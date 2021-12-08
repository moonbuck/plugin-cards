/*

Card:

image?           og:image | twitter:image
title            og:title | twitter:title
description      og:description | twitter:description
reading-time?    article:reading_time
publish-date?    article:publish_date

*/

// Whether to cardify links with the custom query string set
const QUERY_MATCH_CARDS = {{ .Scratch.Get "Card.Creation.QueryMatch" }}

// The query parameter to match
const QUERY_PARAMETER = '{{ .Scratch.Get "Card.Creation.QueryParameter" }}'

// Whether matching the query parameter overrides failing the url filter
const QUERY_MATCH_OVERRIDES_FILTER = {{ .Scratch.Get "Card.Creation.QueryMatchOverridesFilter" }}

// Select links inside a list of posts
const LIST_ANCHOR = '{{ .Scratch.Get "Card.HostMatch.ListSandbox" }} a';

// Select links inside a post page
const PAGE_ANCHOR = '{{ .Scratch.Get "Card.HostMatch.PageSandbox" }} a';

// Match the custom query string
const MATCH_QUERY = `href$="${QUERY_PARAMETER}"`;

// The full selector for query string candidates
const QUERY_MATCH_SEL   = `${LIST_ANCHOR}[${MATCH_QUERY}],
                         ${PAGE_ANCHOR}[${MATCH_QUERY}]`;

// Whether to cardify links that match the site hostname                    
const HOST_MATCH_CARDS = {{ .Scratch.Get "Card.Creation.HostMatch" }};

// The site hostname
const HOSTNAME = "{{ (urls.Parse site.BaseURL).Host }}";

// Match the hostname as it is configured in Hugo
const MATCH_HOST = `href*="${HOSTNAME}"`;

// Match the hostname converted to all lowercase
const MATCH_LOWER_HOST = `href*="${HOSTNAME.toLowerCase()}"`;

// Match links that do not include the cardify-link class
const NOT_CARD = ':not(.cardify-card-link)';

// Match links that do not include the read-more class
const NOT_SUMMARY = ':not({{ .Scratch.Get "Card.HostMatch.ReadMoreLink" }})';

// Match links that do not match the query string
const NOT_QUERY = `:not([${MATCH_QUERY}])`;

{{- with .Scratch.Get "Card.HostMatch.CustomSelector" -}}

const HOST_MATCH_SEL = '{{ . }}';

{{- else -}}

// The full selector for host match candidates
const HOST_MATCH_SEL = `${PAGE_ANCHOR}[${MATCH_HOST}]${NOT_CARD}${NOT_QUERY}, 
                      ${PAGE_ANCHOR}[${MATCH_LOWER_HOST}]${NOT_CARD}${NOT_QUERY},
                      ${LIST_ANCHOR}[${MATCH_HOST}]${NOT_SUMMARY}${NOT_CARD}${NOT_QUERY}, 
                      ${LIST_ANCHOR}[${MATCH_LOWER_HOST}]${NOT_SUMMARY}${NOT_CARD}${NOT_QUERY}`;
                      
{{- end -}}                      

// Add the event listener for a loaded DOM
document.addEventListener('DOMContentLoaded',() => {
  
  // Return if we aren't meant to be generating cards
 if (!(QUERY_MATCH_CARDS || HOST_MATCH_CARDS)) {  return }
  
  // Check whether we're only processing query tagged links
  if (QUERY_MATCH_CARDS && !HOST_MATCH_CARDS) {

    document.querySelectorAll(QUERY_MATCH_SEL)
            .forEach(link => processLink(link))
          
  }
  
  // Check whether we're only processing host matches
  else if (!QUERY_MATCH_CARDS && HOST_MATCH_CARDS) {

    document.querySelectorAll(HOST_MATCH_SEL)
            .forEach(link => processLink(link))
  }
    
  // Fetch query tagged and host matched links
  else {

    document.querySelectorAll(`${QUERY_MATCH_SEL}, ${HOST_MATCH_SEL}`)
            .forEach(link => processLink(link))

  }
  
}) // document.addEventListener

// Fetches page text and feeds it to scrapePage(html, link)
function processLink(link) {
  
{{- with .Scratch.Get "Card.HostMatch.URLFilter" }}

  let url = new URL(link)
  
  if (   url.pathname.match(/{{ . }}/)
      || (QUERY_MATCH_OVERRIDES_FILTER && url.searchParams.has(QUERY_PARAMETER))) {
     
{{- end }}
  
  fetch(link)
    .then(response => response.text())
    .then(html => scrapePage(html, link))
    
{{- if .Scratch.Get "Card.HostMatch.URLFilter" }}

  }

{{- end }}
    
}

// Selectors used to match meta tags
const URL_SEL = `meta[property="og:url"],
                meta[name="twitter:url"]`
                
const IMG_SEL = `meta[property="og:image"],
                meta[name="twitter:image"]`
                
const TITLE_SEL = `meta[property="og:title"],
                  meta[name="twitter:title"]`

const DESC_SEL = `meta[property="og:description"],
                 meta[name="twitter:description"]`
                 
const READING_TIME_SEL = 'meta[name="article:reading_time"]'

const PUBLISH_DATE_SEL = 'meta[property="article:published_time"]'

// Creates a DOM from the provided HTML text, 
// queries for meta tags, and replaces the provided link
// with a new div element containing child elements
// displaying the information fetched from the meta tags.
function scrapePage(html, link) {
  
  var parser = new DOMParser()
  var page = parser.parseFromString(html, 'text/html')
  let urlTag = page.querySelector(URL_SEL)
  let imgTag = page.querySelector(IMG_SEL)
  let titleTag = page.querySelector(TITLE_SEL)
  let descTag = page.querySelector(DESC_SEL)
  let readingTimeTag = page.querySelector(READING_TIME_SEL)
  let publishDateTag = page.querySelector(PUBLISH_DATE_SEL)
  
  var url = null, img = null, title = null, desc = null
  var readingTime = null, publishDate = null
  
  if (publishDateTag) { publishDate = new Date(publishDateTag.content) }
  if (readingTimeTag) { readingTime = readingTimeTag.content }
  if (descTag) { desc = descTag.content.trim() }
  if (titleTag) { title = titleTag.content.trim() }
  if (imgTag) { img = imgTag.content }
  if (urlTag) { url = urlTag.content }
  
  if (url && title && desc) {
    
    let cardDiv = document.createElement("DIV")
    cardDiv.className = "cardify-card"
    
    if (img) {
      let cardImg = document.createElement("IMG")
      cardImg.src = img
      cardImg.className = "cardify-card-img"
      cardDiv.appendChild(cardImg)
    }
    
    let cardBody = document.createElement("DIV")
    cardBody.className = "cardify-card-body"
    cardDiv.appendChild(cardBody)
    
    let cardTitle = document.createElement("H3")
    cardTitle.className = "cardify-card-title"
    cardTitle.innerText = title
    cardBody.appendChild(cardTitle)
    
    let cardDescription = document.createElement("P")
    cardDescription.className = "cardify-card-text"
    cardDescription.innerText = desc
    cardBody.appendChild(cardDescription)
    
    let cardLink = document.createElement("A")
    cardLink.className = "stretched-link cardify-card-link"
    cardLink.href = url
    cardBody.appendChild(cardLink)
    
    if (readingTime || publishDate) {
      
      let timeDateReadingTime = document.createElement("P")
      timeDateReadingTime.className = "cardify-card-text"
      cardBody.appendChild(timeDateReadingTime)
      
      if (publishDate) {
        let timeFormatter = new Intl.DateTimeFormat('en-US', { 
          hour: 'numeric', 
          minute: '2-digit'
        })
        let time = timeFormatter.format(publishDate)
        let dateFormatter = new Intl.DateTimeFormat('en-US', {
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
        let date = dateFormatter.format(publishDate)
        let publishDateElement = document.createElement("SMALL")
        publishDateElement.className = "publish-date"
        publishDateElement.innerText = `${time} • ${date}`
        timeDateReadingTime.appendChild(publishDateElement)
      }
  
      if (readingTime) {
        let readingTimeElement = document.createElement("SMALL")
        readingTimeElement.className = "reading-time text-muted"
        let value = parseInt(readingTime)
        let units = `minute${value > 1 ? 's' : ''}`
        readingTimeElement.innerText = `${value} ${units}`
        timeDateReadingTime.appendChild(readingTimeElement)      
      }
      
    }
  
    let parentNode = link.parentNode
    if (cardDiv && parentNode) {
      parentNode.replaceChild(cardDiv, link)
    }
  }

}