{{- $params := (.Scratch.Get "plugin-cards.Cardify").Parameters.Card -}}
{{- $specifiers := (.Scratch.Get "plugin-cards.Cardify").Specifiers -}}

/* Selector composition */

// The query parameter to match
const QUERY_PARAMETER = 'cardify';

// Select links inside a list of posts
const LIST_ANCHOR = `{{ $params.HostMatch.ListSandbox }} a`;

// Select links inside a post page
const PAGE_ANCHOR = `{{ $params.HostMatch.PageSandbox }} a`;

// Match the hostname as it is configured in Hugo
const MATCH_HOST = `[href*="{{ (urls.Parse site.BaseURL).Host }}" i]`;

// Match links that do not include the cardify-link class
const NOT_CARD = ':not(.cardify-card-link)';

// Match links that do not include the read-more class
const NOT_SUMMARY = `:not({{ $params.HostMatch.ReadMoreLink }})`;

// Construct the host match selector.
{{ with $params.HostMatch.CustomSelector -}}
const HOST_MATCH_SEL = '{{ . }}';
{{ else -}}
const HOST_MATCH_SEL = `\
${PAGE_ANCHOR}${MATCH_HOST}${NOT_CARD}, \
${LIST_ANCHOR}${MATCH_HOST}${NOT_SUMMARY}${NOT_CARD}`;
{{- end }}

/*
  Add the event listener for a loaded DOM. When invoked,
  the handler processes page links according to the
  configuration of the query match and host match flags.
*/
document.addEventListener('DOMContentLoaded',() => {
  
  // Create an empty array to hold the links to be processed.
  let links = [];
  
  // If so flagged, append links retrieved by the host match selector.
  if ({{ $params.Creation.HostMatch }}) {
    links = links.concat(
      Array.from(document.querySelectorAll(HOST_MATCH_SEL))
    );
  }
  
  // If so flagged, append links containing the query parameter.
  if ({{ $params.Creation.QueryMatch }}) {
    links = links.concat(
      Array.from(document.querySelectorAll(`a${MATCH_HOST}`))
           .filter(link => new URL(link).searchParams.has(QUERY_PARAMETER))
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
  if (searchParams.has(QUERY_PARAMETER)) {
    // Return if the parameter has a value set to 'false'.
    if (searchParams.get(QUERY_PARAMETER) == 'false') { return; }
  }
  
{{- with $params.HostMatch.URLFilter }}

  if (   url.pathname.match(/{{ . }}/)
      || ({{ $params.Creation.QueryMatchOverridesFilter }} && searchParams.has(QUERY_PARAMETER))) {
     
{{- end }}
  
  fetch(link)
    .then(response => response.text())
    .then(html => scrapePage(html, link));
    
{{- if $params.HostMatch.URLFilter }}

  }

{{- end }}
    
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
    cardDiv.className = '{{ $specifiers.Card }}';
    
    let queryValue = (new URL(link)).searchParams.get(QUERY_PARAMETER)
    if (queryValue) { cardDiv.classList.add(queryValue) }
    
    if (img) {
      let cardImg = document.createElement("IMG");
      cardImg.src = img;
      cardImg.className = '{{ $specifiers.Image }}';
      cardDiv.append(cardImg);
    }
    
    let cardBody = document.createElement("DIV");
    cardBody.className = '{{ $specifiers.Body }}';
    cardDiv.append(cardBody);
    
    let cardTitle = document.createElement("H3");
    cardTitle.className = '{{ $specifiers.Title }}';
    cardTitle.innerHTML = title;
    cardBody.append(cardTitle);
    
    let cardDescription = document.createElement("P");
    cardDescription.className = '{{ $specifiers.Text }}';
    cardDescription.innerHTML = desc;
    cardBody.append(cardDescription);
    
    let cardLink = document.createElement("A");
    cardLink.className = '{{ $specifiers.Link }}';
    cardLink.href = url;
    cardBody.append(cardLink);
    
    if (readingTime || publishDate) {
      
      let timeDateReadingTime = document.createElement("P");
      timeDateReadingTime.className = '{{ $specifiers.Text }}';
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
        publishDateElement.className = '{{ $specifiers.PublishDate }}';
        publishDateElement.innerHTML = `${time} • ${date}`;
        timeDateReadingTime.append(publishDateElement);
      }
  
      if (readingTime) {
        let readingTimeElement = document.createElement("SMALL");
        readingTimeElement.className = '{{ $specifiers.ReadingTime }}';
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