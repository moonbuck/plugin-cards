{{ with (.Scratch.Get "plugin-cards.Parameters").Cardify }}

{{ $host := (urls.Parse site.BaseURL).Host }}
{{ $match_host := printf "a[href*=\"%s\" i]" $host }}

{{ $auto_match := "" }}

{{ with .Config.CustomSelector }}

{{ $auto_match = . }}

{{ else }}

{{ $not_card := printf ":not(.%s)" .Specifiers.LinkClassName }}
{{ $not_summary := printf ":not(%s)" .Config.ReadMoreLink }}

{{ $auto_match = .Config.PageSandbox }}
{{ $auto_match = printf "%s %s" $auto_match $match_host }}
{{ $auto_match = printf "%s%s," $auto_match $not_card }}
{{ $auto_match = printf "%s %s" $auto_match .Config.ListSandbox }}
{{ $auto_match = printf "%s %s" $auto_match $match_host }}
{{ $auto_match = printf "%s%s" $auto_match $not_summary }}
{{ $auto_match = printf "%s%s" $auto_match $not_card }}

{{ end }}

/*
  Add the event listener for a loaded DOM. When invoked,
  the handler processes page links according to the
  configuration of the query match and host match flags.
*/
document.addEventListener('DOMContentLoaded',() => {
  
  // Create an empty array to hold the links to be processed.
  let links = [];
  
  // If so flagged, append links retrieved by the host match selector.
  if ({{ .Config.HostMatch }}) {
    links = links.concat(
      Array.from(document.querySelectorAll('{{ $auto_match }}'))
    );
  }
  
  // If so flagged, append links containing the query parameter.
  if ({{ .Config.QueryMatch }}) {
    links = links.concat(
      Array.from(document.querySelectorAll('{{ $match_host }}'))
           .filter(link => new URL(link).searchParams.has('{{ .Specifiers.QueryParameter }}'))
     );
  }
  
  // Process unique links.
  [...new Set(links)].forEach(link => processLink(link));
  
}) // document.addEventListener

/*
  Fetches page text and feeds it to scrapePage(html, link)
*/
function processLink(link) {

  // Convert the link into a URL.  
  let url = new URL(link);
  
  // Grab the search parameters.
  let searchParams = url.searchParams;
  
  // Check for the query parameter.
  if (searchParams.has('{{ .Specifiers.QueryParameter }}')) {
    // Return if the parameter has a value set to 'false'.
    if (searchParams.get('{{ .Specifiers.QueryParameter }}') == 'false') { return; }
  }
  
{{ if .Config.URLFilter }}

  if (   url.pathname.match(/{{ .Config.URLFilter }}/)
      || ({{ .Config.QueryMatchOverridesFilter }} && searchParams.has('{{ .Specifiers.QueryParameter }}'))) {
     
{{ end }}
  
  fetch(link)
    .then(response => response.text())
    .then(html => scrapePage(html, link));
    
{{ if .Config.URLFilter }}

  }

{{ end }}
    
}

/*
  Creates a DOM from the provided HTML text, 
  queries for meta tags, and replaces the provided link
  with a new div element containing child elements
  displaying the information fetched from the meta tags.
*/
function scrapePage(html, link) {
  
  /*
    Helpers for constructing <meta> tag selectors.
  */
  
  const meta = (attr, plat, type) => `meta[${attr}="${plat}:${type}"]`;
  const twitter = type => meta('name', 'twitter', type);
  const og = type => meta('property', 'og', type);
  const metaSelector = type => `${og(type)}, ${twitter(type)}`;
  const article = type => meta('property', 'article', type);
  
  var parser = new DOMParser();
  var page = parser.parseFromString(html, 'text/html');
  let urlTag = page.querySelector(metaSelector('url'));
  let imgTag = page.querySelector(metaSelector('image'));
  let titleTag = page.querySelector(metaSelector('title'));
  let descTag = page.querySelector(metaSelector('description'));
  let readingTimeTag = page.querySelector(article('reading_time'));
  let publishDateTag = page.querySelector(article('published_time'));
  
  var url = null, img = null, title = null, desc = null;
  var readingTime = null, publishDate = null;
  
  if (publishDateTag) { publishDate = new Date(publishDateTag.content) }
  if (readingTimeTag) { readingTime = readingTimeTag.content }
  if (descTag) { desc = descTag.content.trim() }
  if (titleTag) {
    let textarea = document.createElement('TEXTAREA');
    textarea.innerHTML = titleTag.content.trim();
    title = textarea.value;
  }
  if (imgTag) { img = imgTag.content }
  if (urlTag) { url = urlTag.content }
  
  if (url && title && desc) {
    
    let cardDiv = document.createElement("DIV");
    cardDiv.className = '{{ .Specifiers.CardClassName }}';
    
    let queryValue = (new URL(link)).searchParams.get('{{ .Specifiers.QueryParameter }}')
    if (queryValue) { cardDiv.classList.add(queryValue) }
    
    if (img) {
      let cardImg = document.createElement("IMG");
      cardImg.src = img;
      cardImg.className = '{{ .Specifiers.ImageClassName }}';
      if (queryValue) { cardImg.classList.add(queryValue) }
      cardDiv.append(cardImg);
    }
    
    let cardBody = document.createElement("DIV");
    cardBody.className = '{{ .Specifiers.BodyClassName }}';
    if (queryValue) { cardBody.classList.add(queryValue) }
    cardDiv.append(cardBody);
    
    let cardTitle = document.createElement("H3");
    cardTitle.className = '{{ .Specifiers.TitleClassName }}';
    if (queryValue) { cardTitle.classList.add(queryValue) }
    cardTitle.innerHTML = title;
    cardBody.append(cardTitle);
    
    let cardDescription = document.createElement("P");
    cardDescription.className = '{{ .Specifiers.TextClassName }}';
    if (queryValue) { cardDescription.classList.add(queryValue) }
    cardDescription.innerHTML = desc;
    cardBody.append(cardDescription);
    
    let cardLink = document.createElement("A");
    cardLink.className = '{{ .Specifiers.LinkClassName }}';
    if (queryValue) { cardLink.classList.add(queryValue) }
    cardLink.href = url;
    cardBody.append(cardLink);
    
    if (readingTime || publishDate) {
      
      let timeDateReadingTime = document.createElement("P");
      timeDateReadingTime.className = '{{ .Specifiers.TextClassName }}';
      if (queryValue) { timeDateReadingTime.classList.add(queryValue) }
      cardBody.append(timeDateReadingTime);
      
      if (publishDate) {
        let timeFormatter = new Intl.DateTimeFormat('en-US', { 
          hour: 'numeric', 
          minute: '2-digit'
        });
        let time = timeFormatter.format(publishDate);
        let dateFormatter = new Intl.DateTimeFormat('en-US', {
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
        let date = dateFormatter.format(publishDate);
        let publishDateElement = document.createElement("SMALL");
        publishDateElement.className = '{{ .Specifiers.PublishDateClassName }}';
        if (queryValue) { publishDateElement.classList.add(queryValue) }
        publishDateElement.innerHTML = `${time} • ${date}`;
        timeDateReadingTime.append(publishDateElement);
      }
  
      if (readingTime) {
        let readingTimeElement = document.createElement("SMALL");
        readingTimeElement.className = '{{ .Specifiers.ReadingTimeClassName }}';
        if (queryValue) { readingTimeElement.classList.add(queryValue) }
        let value = parseInt(readingTime);
        let units = `minute${value > 1 ? 's' : ''}`;
        readingTimeElement.innerHTML = `${value} ${units}`;
        timeDateReadingTime.append(readingTimeElement);
      }
      
    }
  
    let parentNode = link.parentNode;
    if (cardDiv && parentNode) {
      parentNode.replaceChild(cardDiv, link);
    }
  }

}

{{ end }}