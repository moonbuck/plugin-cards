/*

Card:

image?           og:image | twitter:image
title            og:title | twitter:title
description      og:description | twitter:description
reading-time?    article:reading_time
publish-date?    article:publish_date

*/

{{- $params := site.Params -}}

{{- $config := site.Data.plugin_cards_config -}}
{{- $config  = $config | default site.Data.plugin_cards.config -}}

{{- $QueryMatch := index $params "cards.card.creation.querymatch" -}}
{{- $QueryMatch =  $QueryMatch | default $config.Card.Creation.QueryMatch -}}
{{- $QueryMatch =  $QueryMatch | default true -}}

{{- $HostMatch := index $params "cards.card.creation.hostmatch" -}}
{{- $HostMatch  = $HostMatch | default $config.Card.Creation.HostMatch -}}
{{- $HostMatch  = $HostMatch | default false -}}

{{- $URLFilter := index $params "cards.card.hostmatch.urlfilter" -}}
{{- $URLFilter  = $URLFilter | default $config.Card.HostMatch.URLFilter -}}

{{- $ReadMoreLink := index $params "cards.card.hostmatch.readmorelink" -}}
{{- $ReadMoreLink  = $ReadMoreLink | default $config.Card.HostMatch.ReadMoreLink -}}
{{- $ReadMoreLink  = $ReadMoreLink | default ".read-more" -}}

{{- $ListSandbox := index $params "cards.card.hostmatch.listsandbox" -}}
{{- $ListSandbox  = $ListSandbox | default $config.Card.HostMatch.ListSandbox -}}
{{- $ListSandbox  = $ListSandbox | default ".post-body" -}}

{{- $PageSandbox := index $params "cards.card.hostmatch.pagesandbox" -}}
{{- $PageSandbox  = $PageSandbox | default $config.Card.HostMatch.PageSandbox -}}
{{- $PageSandbox  = $PageSandbox | default "#post-body" -}}

{{- $CustomSelector := index $params "cards.card.hostmatch.customselector" -}}
{{- $CustomSelector  = $CustomSelector | default $config.Card.HostMatch.CustomSelector -}}

// Whether to cardify links with the custom query string set
const queryMatchCards = {{ $QueryMatch }};

// Select links inside a list of posts
const listAnchor = '{{ $ListSandbox }} a';

// Select links inside a post page
const pageAnchor = '{{ $PageSandbox }} a';

// Match the custom query string
const matchQuery = `href$="cardify"`;

// The full selector for query string candidates
const queryMatchSel   = `${listAnchor}[${matchQuery}],
                         ${pageAnchor}[${matchQuery}]`;

// Whether to cardify links that match the site hostname                    
const hostMatchCards = {{ $HostMatch }};

// The site hostname
const hostname = "{{ (urls.Parse site.BaseURL).Host }}";

// Match the hostname as it is configured in Hugo
const matchHost = `href*="${hostname}"`;

// Match the hostname converted to all lowercase
const matchLowerHost = `href*="${hostname.toLowerCase()}"`;

// Match links that do not include the cardify-link class
const notCard = ':not(.cardify-card-link)';

// Match links that do not include the read-more class
const notSummary = ':not({{ $ReadMoreLink }})';

// Match links that do not match the query string
const notQuery = `:not([${matchQuery}])`;

{{- with $CustomSelector -}}

const hostMatchSel = '{{ . }}';

{{- else -}}

// The full selector for host match candidates
const hostMatchSel = `${pageAnchor}[${matchHost}]${notCard}${notQuery}, 
                      ${pageAnchor}[${matchLowerHost}]${notCard}${notQuery},
                      ${listAnchor}[${matchHost}]${notSummary}${notCard}${notQuery}, 
                      ${listAnchor}[${matchLowerHost}]${notSummary}${notCard}${notQuery}`;
                      
{{- end -}}                      

// Add the event listener for a loaded DOM
document.addEventListener('DOMContentLoaded',() => {
  
  // Return if we aren't meant to be generating cards
 if (!(queryMatchCards || hostMatchCards)) {  return }
  
  // Check whether we're only processing query tagged links
  if (queryMatchCards && !hostMatchCards) {

    document.querySelectorAll(queryMatchSel)
            .forEach(link => processLink(link))
          
  }
  
  // Check whether we're only processing host matches
  else if (!queryMatchCards && hostMatchCards) {

    document.querySelectorAll(hostMatchSel)
            .forEach(link => processLink(link))
  }
    
  // Fetch query tagged and host matched links
  else {

    document.querySelectorAll(`${queryMatchSel}, ${hostMatchSel}`)
            .forEach(link => processLink(link))

  }
  
}) // document.addEventListener

// Fetches page text and feeds it to scrapePage(html, link)
function processLink(link) {
  
{{- with $URLFilter }}

  if ((new URL(link)).pathname.match(/{{ . }}/)) {
  
{{- end }}
  
  fetch(link)
    .then(response => response.text())
    .then(html => scrapePage(html, link))
    
{{- if $URLFilter -}}
  }
{{- end -}}
}

// Selectors used to match meta tags
const urlSel = `meta[property="og:url"],
                meta[name="twitter:url"]`
                
const imgSel = `meta[property="og:image"],
                meta[name="twitter:image"]`
                
const titleSel = `meta[property="og:title"],
                  meta[name="twitter:title"]`

const descSel = `meta[property="og:description"],
                 meta[name="twitter:description"]`
                 
const readingTimeSel = 'meta[name="article:reading_time"]'

const publishDateSel = 'meta[property="article:published_time"]'

// Creates a DOM from the provided HTML text, 
// queries for meta tags, and replaces the provided link
// with a new div element containing child elements
// displaying the information fetched from the meta tags.
function scrapePage(html, link) {
  
  var parser = new DOMParser()
  var page = parser.parseFromString(html, 'text/html')
  let urlTag = page.querySelector(urlSel)
  let imgTag = page.querySelector(imgSel)
  let titleTag = page.querySelector(titleSel)
  let descTag = page.querySelector(descSel)
  let readingTimeTag = page.querySelector(readingTimeSel)
  let publishDateTag = page.querySelector(publishDateSel)
  
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