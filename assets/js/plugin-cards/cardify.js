{{ with (.Scratch.Get "plugin-cards.Parameters").Cardify }}

/*
  Add the event listener for a loaded DOM. When invoked,
  the handler processes page links looking for the cardify
  query parameter and scrapes what it finds.
*/
document.addEventListener('DOMContentLoaded',() => {
  
  // Fetch and process any eligible links with the query parameter.
  document.querySelectorAll('a.cardify').forEach(link => {
    link.outerHTML = link.childNodes[1].textContent;
    })
});

{{ end }}