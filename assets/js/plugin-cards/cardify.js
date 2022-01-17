{{ with (.Scratch.Get "plugin-cards.Parameters").Cardify }}

/*
  Add the event listener for a loaded DOM. When invoked,
  the handler processes page links looking for the cardify
  query parameter and scrapes what it finds.
*/
document.addEventListener('DOMContentLoaded',() => {
  
  // Fetch and process any eligible links with the query parameter.
  let links = Array
    .from(document.querySelectorAll('a[href*="{{ (urls.Parse site.BaseURL).Host }}" i]'))
    .filter(link => new URL(link).searchParams.has('cardify'))
    .forEach(link => fetch(link)
                      .then(response => response.text())
                      .then(html => scrapePage(html, link)));
});

/*
  Creates a DOM from the provided HTML text, 
  queries for meta tags, and replaces the provided link
  with a new div element containing child elements
  displaying the information fetched from the meta tags.
*/
function scrapePage(html, link) {
  
  /* Helpers for constructing <meta> tag selectors. */ 
  const meta = (attr, plat, type) => `meta[${attr}="${plat}:${type}"]`;
  const twitter = type => meta('name', 'twitter', type);
  const og = type => meta('property', 'og', type);
  const metaSelector = type => `${og(type)}, ${twitter(type)}`;
  const article = type => meta('property', 'article', type);
  
  var parser = new DOMParser();
  var page = parser.parseFromString(html, 'text/html');
  let urlTag = page.querySelector(metaSelector('url'));
  let imgTag = page.querySelector(metaSelector('image'));
  let audioTag = page.querySelector(og('audio'));
  let videoTag = page.querySelector(og('video'));
  let titleTag = page.querySelector(metaSelector('title'));
  let descTag = page.querySelector(metaSelector('description'));
  let readingTimeTag = page.querySelector(article('reading_time'));
  let publishDateTag = page.querySelector(article('published_time'));
  
  let img = null, audio = null, video = null;
  let url = null, title = null, desc = null;
  let readingTime = null, publishDate = null;
  
  if (publishDateTag) { publishDate = new Date(publishDateTag.content) }
  if (readingTimeTag) { readingTime = readingTimeTag.content }
  if (descTag) { desc = descTag.content.trim() }
  if (titleTag) {
    let textarea = document.createElement('TEXTAREA');
    textarea.innerHTML = titleTag.content.trim();
    title = textarea.value;
  }
  if (imgTag) { img = imgTag.content }
  if (audioTag) { audio = audioTag.content }
  if (videoTag) { video = videoTag.content }
  if (urlTag) { url = urlTag.content }
  
  if (url && title && desc) {
    
    let cardDiv = document.createElement("DIV");
    cardDiv.className = '{{ .Style.ClassName }}';
    
    let queryValue = (new URL(link)).searchParams.get('cardify')
    if (queryValue) { cardDiv.classList.add(queryValue) }
    
    if (audio) {
      let cardAudio = document.createElement("AUDIO");
      cardAudio.src = audio;
      cardAudio.controls = 'controls';
      cardAudio.preload = 'metadata';
      cardDiv.append(cardAudio);
    } 
    
    else if (video) {
      let cardVideo = document.createElement("VIDEO");
      cardVideo.src = video;
      cardVideo.controls = 'controls';
      cardVideo.muted = 'muted';
      cardVideo.autoplay = 'autoplay';
      cardVideo.loop = 'loop';
      cardDiv.append(cardVideo);
    }
    
    else if (img) {
      let cardImg = document.createElement("IMG");
      cardImg.src = img;
      cardDiv.append(cardImg);
    }
    
    let cardBody = document.createElement("DIV");
    cardDiv.append(cardBody);
    
    let cardTitle = document.createElement("H3");
    cardTitle.innerHTML = title;
    cardBody.append(cardTitle);
    
    let cardDescription = document.createElement("P");
    cardDescription.innerHTML = desc;
    cardBody.append(cardDescription);
    
    let cardLink = document.createElement("A");
    cardLink.href = url;
    cardBody.append(cardLink);
    
    if (readingTime || publishDate) {
      
      let timeDateReadingTime = document.createElement("P");
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
        publishDateElement.innerHTML = `${time} • ${date}`;
        timeDateReadingTime.append(publishDateElement);
      }
  
      if (readingTime) {
        let readingTimeElement = document.createElement("SMALL");
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