# plugin-cards
A [Micro.blog](https://micro.blog "Micro.blog") plugin for adding [Twitter](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards "Twitter Cards") and [Open Graph](https://ogp.me "Open Graph Protocol") `<meta>` tags, which are used to generate link preview cards all over the g0dd@mn place.

![Facebook](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/facebook.jpeg)

![Twitter](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/twitter.jpeg)

![Slack](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/slack.jpeg)

![LinkedIn](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/linkedin.jpeg)

![Pinterest](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/pinterest.jpeg)

![Messages](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/messages.jpeg)

![Telegram](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/telegram.jpeg)

There is only one template involved. It lives at `/layouts/partials/twitter-open-graph-cards.html` and looks like this:

```go
{{/* Determine site name */}}
{{ $site_name := site.Title }}

{{/* Determine the title */}}
{{ $title := .Title }}

{{/* Determine description */}}
{{ $description := .Summary | default (.Description | default .Site.Params.description )  }}

{{/* Create a variable for the card image */}}
{{ $image := false }}

{{/* Check whether the page as an image */}}
{{ with .Params.images }}{{ $image = (index . 0 | absURL) }}{{ end }}

{{ if not $image }}

  {{/* Capture the path for the page */}}
  {{ $page_path := (urls.Parse .Permalink).Path }}
  
  {{/* Check whether card data is available */}}
  {{ with site.Params.card_data_json }}
    {{ with transform.Unmarshal . }}
    
      {{/* Check whether the data has an entry for this page */}}
      {{ with (index . $page_path) }}{{ $image = . }}{{ end }}
      
      {{/* Otherwise check for a default image */}}
      {{ if not $image }}
        {{ with index . "default" }}{{ $image = . }}{{ end }}
      {{ end }}
    
    {{ end }}
    
  {{ end }}
  
{{ end }}

{{/* Grab section and categories */}}
{{ $section := false }}
{{ $categories := false }}
{{ if .IsPage }}
  {{ if ne (len .Section) 0 }}{{ $section = .Section }}{{ end }}
  {{ if .Page.Params.categories }}{{ $categories = .Page.Params.categories }}{{ end }}
{{ end }}

{{/* Grab times */}}
{{ $iso8601 := "2006-01-02T15:04:05-07:00" }}
{{ $published_time := false }}
{{ $modified_time := false }}
{{ $updated_time := false }}
{{ if .IsPage }}
  {{ if not .PublishDate.IsZero }}
    {{ $published_time = (.PublishDate.Format $iso8601 | safeHTML) }}
  {{ else if not .Date.IsZero }}
    {{ $published_time = (.Date.Format $iso8601 | safeHTML) }}
  {{ end }}
  {{ if not .Lastmod.IsZero }}{{ $modified_time = (.Lastmod.Format $iso8601 | safeHTML) }}{{ end }}
{{ else if not .Date.IsZero }}
  {{ $updated_time = (.Date.Format $iso8601 | safeHTML) }}
{{ end }}

{{/* Determine type */}}
{{ $type := "website" }}
{{ $audio := false }}
{{ with .Params.audio }}
{{ $audio = (index . 0 | absURL) }}
{{ $type = "music.song" }}
{{ else }}
{{ if .Title }}{{ $type = "article" }}{{ end }}
{{ end }}

{{/* Create meta tags using the variable values. */}}
<meta property="og:url" content="{{ .Permalink }}" />
<meta property="og:site_name" content="{{ $site_name }}" />
{{ if $title }}
<meta property="og:title" content="{{ $title }}" />
{{ else }}
<meta property="og:title" content="{{ $description }}" />
{{ end }}
<meta property="og:description" content="{{ $description }}" />
{{ with $image }}<meta property="og:image" content="{{ . }}" />{{ end }}
{{ with $published_time }}<meta property="article:published_time" content="{{ . }}" />{{ end }}
{{ with $modified_time }}<meta property="article:modified_time" content="{{ . }}" />{{ end }}
{{ with $section }}<meta property="article:section" content="{{ . }}" />{{ end }}
{{ with $categories }}{{ range first 6 . }}<meta property="article:tag" content="{{ . }}" />{{ end }}{{ end }}
{{ with $updated_time }}<meta property="og:updated_time" content="{{ . }}" />{{ end }}
{{ with $audio }}<meta property="og:audio" content="{{ . }}" />{{ end }}
<meta property="og:type" content="{{ $type }}" />
{{ if $image }}
<meta name="twitter:card" content="summary_large_image"/>
{{ else }}
<meta name="twitter:card" content="summary"/>
{{ end }}
{{ with site.Params.twitter_username }}
<meta name="twitter:site" content="@{{ . }}" />
<meta name="twitter:creator" content="@{{ . }}" />
{{ end }}
<meta property="twitter:domain" content="{{ (urls.Parse site.BaseURL).Host }}">
<meta property="twitter:url" content="{{ .Permalink }}">
{{ if $title }}
<meta name="twitter:title" content="{{ $title }}" />
{{ else }}
<meta name="twitter:title" content="{{ $description }}" />
{{ end }}
<meta name="twitter:description" content="{{ $description }}" />
{{ with $image }}<meta property="twitter:image" content="{{ . }}" />{{ end }}
```

Open Graph audio meta tags are created when an audio file is detected. 

![Audo Card](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/audio.jpeg)


## Plugin Parameters

![](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/plugin_parameters.jpeg)

The `Twitter Username` parameter establishes the content creator for Twitter cards. If you leave this empty, the plugin will fall back to `site.Params.twitter_username`, if that has been set. Without one of these two variables holding a value, Twitter cards will not be generated.

The `Card Data` parameter is optional. To understand why it is there, let’s talk about card images. 

## Card Image
The first image found gets priority. The large summary Twitter card will be generated when there is an image available; otherwise, the smaller summary card is generated.

When the page for which you are generating cards does not have an image available in its front matter, that’s when cool sh$t happens … and why that `Card Data` parameter is there.

The data consists of a JSON object stored as a `string` (which is what happens when you paste your JSON object code into the field and hit the button). The pasted code might look something like this:

```json
{
  "default": "https://moondeer.blog/uploads/2021/7c412827ad.jpg",
  "/plausible/": "https://moondeer.blog/uploads/2021/e71e7d47c1.jpg",
  "/2021/": "https://moondeer.blog/uploads/2021/98295e13a8.jpg",
  "/2020/": "https://moondeer.blog/uploads/2021/24760a1062.jpg",
  "/about/": "https://moondeer.blog/uploads/2021/955619b235.jpg",
  "/cloud/": "https://moondeer.blog/uploads/2021/547d825d8a.jpg",
  "/bookshelf/": "https://moondeer.blog/uploads/2021/27a279361f.jpg",
  "/gallery/":"https://moondeer.blog/uploads/2021/8585a4a081.jpg",
  "/categories/perspectives/": "https://moondeer.blog/uploads/2021/f5f64b49bb.jpg",
  "/categories/projects/": "https://moondeer.blog/uploads/2021/a0c8728c89.jpg",
  "/categories/poetry/": "https://moondeer.blog/uploads/2021/23a2035cdc.jpg",
  "/categories/music/": "https://moondeer.blog/uploads/2021/8d0a055caa.jpg",
  "/categories/programming/": "https://moondeer.blog/uploads/2021/47e02e5e74.jpg",
  "/categories/critters/": "https://moondeer.blog/uploads/2021/0a37500db6.jpg",
  "/categories/stream-of-consciousness/": "https://moondeer.blog/uploads/2021/c11b3de2ff.jpg",
  "/categories/inside-the-art/": "https://moondeer.blog/uploads/2021/8c4669346c.jpg",
  "/categories/biographical-tripe/": "https://moondeer.blog/uploads/2021/92a565154b.jpg",
  "/categories/artsy-fartsy/": "https://moondeer.blog/uploads/2021/76f1f5d0d6.jpg",
  "/categories/personal-favorites/": "https://moondeer.blog/uploads/2021/328c442bd6.jpg"
}
```

All the values are image URLs. As for the keys, there are really only two things happening here. There is a `default` entry, which is used whenever nothing else could be retrieved. All the remaining keys are site paths. The bits that follow `[SCHEME://HOSTNAME]`. This is how your pages without images in the front matter get their image card.

Soooo … when I leave a link like this: `https://moondeer.blog/gallery/`

I get a Twitter card like this:

![Gallery Card](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/gallery.jpeg)

Orrrr … say I leave a link like this: `https://moondeer.blog/categories/perspectives/`

Then I get a Twitter card like this:

![Perspectives Card](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/perspectives.jpeg)