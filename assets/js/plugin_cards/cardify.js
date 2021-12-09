/* Plugin parameter values */

// Whether to cardify links with the custom query string set
const QUERY_MATCH_CARDS = {{ .Scratch.Get "Card.Creation.QueryMatch" }};

// The query parameter to match
const QUERY_PARAMETER = '{{ .Scratch.Get "Card.Creation.QueryParameter" }}';

// Whether matching the query parameter overrides failing the url filter
const QUERY_MATCH_OVERRIDES_FILTER = {{ .Scratch.Get "Card.Creation.QueryMatchOverridesFilter" }};

// Selector for establishing containment of which links are eligible in list pages.
const LIST_SANDBOX = '{{ .Scratch.Get "Card.HostMatch.ListSandbox" }}';

// Selector for establishing containment of which links are eligible in post pages.
const PAGE_SANDBOX = '{{ .Scratch.Get "Card.HostMatch.PageSandbox" }}';

// Whether to automatically cardify links that match the site hostname.              
const HOST_MATCH_CARDS = {{ .Scratch.Get "Card.Creation.HostMatch" }};

// Matchable hosts with regard to link cardification.
const HOSTNAME = '{{ (urls.Parse site.BaseURL).Host }}';

// Selector for identifying post summary item "read more" links.
const READ_MORE_LINK = '{{ .Scratch.Get "Card.HostMatch.ReadMoreLink" }}';

// Selector to use for site hostname matching in place of 
// the default selector.
const CUSTOM_SELECTOR = '{{ .Scratch.Get "Card.HostMatch.CustomSelector" }}';
  
/* Hugo variable values */
  
{{- with .Scratch.Get "Specifiers" }}
const CARDIFY_CARD_CLASS = '{{ .Card }}';
const CARDIFY_CARD_IMG_CLASS = '{{ .Image }}';
const CARDIFY_CARD_BODY_CLASS = '{{ .Body }}';
const CARDIFY_CARD_TITLE_CLASS = '{{ .Title }}';
const CARDIFY_CARD_TEXT_CLASS = '{{ .Text }}';
const CARDIFY_CARD_LINK_CLASS = '{{ .Link }}';
const CARDIFY_CARD_PUBLISH_DATE_CLASS = '{{ .PublishDate }}';
const CARDIFY_CARD_READING_TIME_CLASS = '{{ .ReadingTime }}';
{{- end }}

/* Selector composition */

// Select links inside a list of posts
const LIST_ANCHOR = `${LIST_SANDBOX} a`;

// Select links inside a post page
const PAGE_ANCHOR = `${PAGE_SANDBOX} a`;


// Match the custom query string
const MATCH_QUERY = `href$="${QUERY_PARAMETER}"`;

// The full selector for query string candidates
const QUERY_MATCH_SEL = `${LIST_ANCHOR}[${MATCH_QUERY}],
                         ${PAGE_ANCHOR}[${MATCH_QUERY}]`;

// Match the hostname as it is configured in Hugo
const MATCH_HOST = `[href*="${HOSTNAME}" i]`;

// Match links that do not include the cardify-link class
const NOT_CARD = ':not(.cardify-card-link)';

// Match links that do not include the read-more class
const NOT_SUMMARY = `:not(${READ_MORE_LINK})`;

// Match links that do not match the query string
const NOT_QUERY = `:not([${MATCH_QUERY}])`;

const HOST_MATCH_SEL = (
  CUSTOM_SELECTOR.length > 0 
  ? CUSTOM_SELECTOR
  : `${PAGE_ANCHOR}${MATCH_HOST}${NOT_CARD}${NOT_QUERY}, 
     ${LIST_ANCHOR}${MATCH_HOST}${NOT_SUMMARY}${NOT_CARD}${NOT_QUERY}`
);

// Selectors used to match meta tags

const meta = (attribute, platform, type) => `meta[${attribute}="${platform}:${type}"]`;
const twitter = type => meta('name', 'twitter', type);
const og = type => meta('property', 'og', type);
const metaSelector = type => `${og(type)}, ${twitter(type)}`;
const article = type => meta('property', 'article', type);

const URL_SEL = metaSelector('url');
const IMG_SEL = metaSelector('image');
const TITLE_SEL = metaSelector('title');
const DESC_SEL = metaSelector('description');
const READING_TIME_SEL = article('reading_time');
const PUBLISH_DATE_SEL = article('published_time');

// Add the event listener for a loaded DOM
document.addEventListener('DOMContentLoaded',() => {
  
  // Return if we aren't meant to be generating cards
 if (!(QUERY_MATCH_CARDS || HOST_MATCH_CARDS)) {  return }
  
  // Check whether we're only processing query tagged links
  if (QUERY_MATCH_CARDS && !HOST_MATCH_CARDS) {

    document.querySelectorAll(QUERY_MATCH_SEL)
            .forEach(link => processLink(link));
          
  }
  
  // Check whether we're only processing host matches
  else if (!QUERY_MATCH_CARDS && HOST_MATCH_CARDS) {

    document.querySelectorAll(HOST_MATCH_SEL)
            .forEach(link => processLink(link));
  }
    
  // Fetch query tagged and host matched links
  else {

    document.querySelectorAll(`${QUERY_MATCH_SEL}, ${HOST_MATCH_SEL}`)
            .forEach(link => processLink(link));

  }
  
}) // document.addEventListener

// Fetches page text and feeds it to scrapePage(html, link)
function processLink(link) {
  
{{- with .Scratch.Get "Card.HostMatch.URLFilter" }}

  let url = new URL(link);
  
  if (   url.pathname.match(/{{ . }}/)
      || (QUERY_MATCH_OVERRIDES_FILTER && url.searchParams.has(QUERY_PARAMETER))) {
     
{{- end }}
  
  fetch(link)
    .then(response => response.text())
    .then(html => scrapePage(html, link));
    
{{- if .Scratch.Get "Card.HostMatch.URLFilter" }}

  }

{{- end }}
    
}

// Creates a DOM from the provided HTML text, 
// queries for meta tags, and replaces the provided link
// with a new div element containing child elements
// displaying the information fetched from the meta tags.
function scrapePage(html, link) {
  
  var parser = new DOMParser();
  var page = parser.parseFromString(html, 'text/html');
  let urlTag = page.querySelector(URL_SEL);
  let imgTag = page.querySelector(IMG_SEL);
  let titleTag = page.querySelector(TITLE_SEL);
  let descTag = page.querySelector(DESC_SEL);
  let readingTimeTag = page.querySelector(READING_TIME_SEL);
  let publishDateTag = page.querySelector(PUBLISH_DATE_SEL);
  
  var url = null, img = null, title = null, desc = null;
  var readingTime = null, publishDate = null;
  
  if (publishDateTag) { publishDate = new Date(publishDateTag.content) }
  if (readingTimeTag) { readingTime = readingTimeTag.content }
  if (descTag) { desc = descTag.content.trim() }
  if (titleTag) { title = titleTag.content.trim() }
  if (imgTag) { img = imgTag.content }
  if (urlTag) { url = urlTag.content }
  
  if (url && title && desc) {
    
    let cardDiv = document.createElement("DIV");
    cardDiv.className = CARDIFY_CARD_CLASS;
    
    let queryValue = (new URL(link)).searchParams.get(QUERY_PARAMETER)
    if (queryValue) { cardDiv.classList.add(queryValue) }
    
    if (img) {
      let cardImg = document.createElement("IMG");
      cardImg.src = img;
      cardImg.className = CARDIFY_CARD_IMG_CLASS;
      cardDiv.appendChild(cardImg);
    }
    
    let cardBody = document.createElement("DIV");
    cardBody.className = CARDIFY_CARD_BODY_CLASS;
    cardDiv.appendChild(cardBody);
    
    let cardTitle = document.createElement("H3");
    cardTitle.className = CARDIFY_CARD_TITLE_CLASS;
    cardTitle.innerText = title;
    cardBody.appendChild(cardTitle);
    
    let cardDescription = document.createElement("P");
    cardDescription.className = CARDIFY_CARD_TEXT_CLASS;
    cardDescription.innerText = desc;
    cardBody.appendChild(cardDescription);
    
    let cardLink = document.createElement("A");
    cardLink.className = CARDIFY_CARD_LINK_CLASS;
    cardLink.href = url;
    cardBody.appendChild(cardLink);
    
    if (readingTime || publishDate) {
      
      let timeDateReadingTime = document.createElement("P");
      timeDateReadingTime.className = CARDIFY_CARD_TEXT_CLASS;
      cardBody.appendChild(timeDateReadingTime);
      
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
        publishDateElement.className = CARDIFY_CARD_PUBLISH_DATE_CLASS;
        publishDateElement.innerText = `${time} • ${date}`;
        timeDateReadingTime.appendChild(publishDateElement);
      }
  
      if (readingTime) {
        let readingTimeElement = document.createElement("SMALL");
        readingTimeElement.className = CARDIFY_CARD_READING_TIME_CLASS;
        let value = parseInt(readingTime);
        let units = `minute${value > 1 ? 's' : ''}`;
        readingTimeElement.innerText = `${value} ${units}`;
        timeDateReadingTime.appendChild(readingTimeElement);
      }
      
    }
  
    let parentNode = link.parentNode;
    if (cardDiv && parentNode) {
      parentNode.replaceChild(cardDiv, link);
    }
  }

}