{{ with (.Scratch.Get "plugin-cards.Parameters").Cardify }}

window.twttr = (function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0],
    t = window.twttr || {};
  if (d.getElementById(id)) return t;
  js = d.createElement(s);
  js.id = id;
  js.src = "https://platform.twitter.com/widgets.js";
  fjs.parentNode.insertBefore(js, fjs);

  t._e = [];
  t.ready = function(f) {
    t._e.push(f);
  };

  return t;
  }(document, "script", "twitter-wjs"));

/*
  Add the event listener for a loaded DOM. When invoked,
  the handler processes page links looking for the cardify
  query parameter and scrapes what it finds.
*/
document.addEventListener('DOMContentLoaded',() => {
  
  // Fetch and process any eligible links with the query parameter.
  document.querySelectorAll('a.cardify').forEach(link => {
    link.outerHTML = link.childNodes[1].textContent;
    twttr?.widgets.load();
    })
});

{{ end }}