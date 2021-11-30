# plugin-cards
A [Micro.blog](https://micro.blog "Micro.blog") plugin for adding [Twitter](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards "Twitter Cards") and [Open Graph](https://ogp.me "Open Graph Protocol") <code>&lt;meta></code> tags, which are used to generate link preview cards all over the g0dd@mn place.  As of version 4, the plugin will also generate [structured data](https://developers.google.com/search/docs/advanced/structured-data/intro-structured-data "Structured Data Intro") for posts, which is utilized by search engines. The plugin can also generate card previews of its own to drop into your blog.

![Facebook](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/images/facebook.jpeg)

![Twitter](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/images/twitter.jpeg)

![Slack](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/images/slack.jpeg)

![LinkedIn](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/images/linkedin.jpeg)

![Pinterest](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/images/pinterest.jpeg)

![Messages](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/images/messages.jpeg)

![Telegram](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/images/telegram.jpeg)

Open Graph audio meta tags are created when an audio file is detected. 

![Audo Card](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/images/audio.jpeg)


## Plugin Parameters

The plugin parameters are grouped by the functionality they target. They are all reachable from the plugin parameters interface, however, I am going to describe them using the logic they hold in the template data file (which may be used as an alternative to the plugin parameter interface) that lives at <code>/data/plugin_cards/config.toml</code>.

### TwitterOG
Twitter and Open Graph Parameters

<dl>
<dt>Enable</dt><dd>Whether to inject Twitter and Open Graph <code><meta></code> tags into the page <code><head></code>. The default value is <code>true</code>.</dd>

<dt>TwitterUsername</dt><dd>Username for Twitter <code>&lt;meta></code> tags. Defaults to <code>site.Params.twitter_username</code> when empty.</dd>
</dl>

### StructuredData
Structured Data Parameters

<dl>
<dt>Enable</dt><dd> Whether to inject an <code>application/ld+json</code> script in the page <code>&lt;head></code> with structured data for search engines</dd>

<dt>AuthorName</dt><dd>The value to set for <code>author.name</code> within the JSON object. Defaults to <code>site.Author.name</code> or <code>site.Params.Author.name</code> when empty.</dd>

<dt>ProfileURL</dt><dd>The value to set for <code>author.url</code> within the JSON object. Defaults to <code>site.Author.profileurl</code> when empty.</dd>
</dl>

### Card.Creation
Preview Card Creation Parameters

<dl>
<dt>QueryMatch</dt><dd> Whether to replace links ending with *cardify* with a preview card generated by scraping the linked page for Twitter / Open Graph tags. When set to true, a link like <code>&lt;a href="https://my.blog/2021/11/29/my-post.html?cardify">whatever&lt;/a></code> would be replaced with a preview card by the <code>cardify.js</code> script.</dd>

<dt>HostMatch</dt><dd> Whether to automatically replace any link for a site page with a preview card generated by scraping the linked page for Twitter / Open Graph tags. Exactly which links are replaced withcards may be controlled via the Card.HostMatch parameters. When set to true, a link like <code>&lt;a href="https://my.blog/2021/11/29/my-post.html>whatever&lt;/a></code> may be eligible for preview card replacement depending on how the <code>Card.HostMatch</code> parameters have been configured.</dd>
</dl>

### Card.HostMatch
Parameters for preview cards created automatically when the link points to another page of the Hugo generated site.

<dl>
<dt>ReadMoreLink</dt><dd>A CSS selector specifying the links used by post summaries. This is used to exclude such links from generating preview cards. Default is <code>.read-more</code>.</dd>

<dt>ListSandbox</dt><dd>A CSS selector that leads right up to the <code>&lt;a></code> tags that should be eligible for automatic replacement in post lists. This becomes part of the final host match selector. Default is <code>.post-body</code>.</dd>

<dt>PageSandbox</dt><dd>A CSS selector that leads right up to the <code>&lt;a></code> tags that should be eligible for automatic replacement in post pages. This becomes part of the final host match selector. Default is <code>#post-body</code>.</dd>

<dt>CustomSelector</dt><dd>A custom CSS selector to use in place of the that which would be generated using the three parameter values above. Given the default values:
<pre><code>ReadMoreLink = '.read-more'
ListSandbox = '.post-body'
PageSandbox = '#post-body'
</code></pre>
and a <code>site.BaseURL</code> equal to <code>https://My.blog</code> the default value of the host match selector would be:
<pre><code>#post-body a[href*="My.blog"]:not(.cardify-card-link):not([href$="cardify"]),
#post-body a[href*="my.blog"]:not(.cardify-card-link):not([href$="cardify"]),
.post-body a[href*="My.blog"]:not(.read-more):not(.cardify-card-link):not([href$="cardify"]),
.post-body a[href*="my.blog"]:not(.read-more):not(.cardify-card-link):not([href$="cardify"])</code></pre>
Setting this value to a non-empty string will completely replace the default selector with the custom selector value.</dd>

<dt>URLFilter</dt><dd>A regular expression for whitelisting which links are eligible for automatic replacement. This is applied on top of the CSS selection. The default value, <code>.*.html</code>, excludes category pages, for example.</dd>
</dl>

### Card.Style
Parameters for styling preview cards

![Generated Card Preview](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/images/cardify.jpeg)

<dl>
<dt>SpacerY</dt><dd>Vertical padding applied to <code>.cardify-card-body</code>. Default is <code>1rem</code>.</dd>

<dt>SpacerX</dt><dd>Horizontal padding applied to <code>.cardify-card-body</code>. Default is <code>1rem</code>.</dd>

<dt>TitleSpacerY</dt><dd>Bottom margin applied to <code>.cardify-card-title</code>. Default is `1rem * 0.5`.</dd>

<dt>BG</dt><dd>Background color applied to <code>.cardify-card</code>. Default is <code>white</code>.</dd>

<dt>BorderWidth</dt><dd>Width value for the border applied to <code>.cardify-card</code>. Default is <code>1px</code>.</dd>

<dt>BorderColor</dt><dd>Color value for the border applied to <code>.cardify-card</code>. Default is `rgba(black, .125)`.</dd>

<dt>BorderRadius</dt><dd><code>border-radius</code> value for <code>.cardify-card</code>. Default is <code>0.5rem</code>.</dd>

<dt>TimeDateColor</dt><dd>Color applied to the last <code>.cardify-card-text</code> element (containing the publish date and estimated reading time). Default is <code>#666666</code></dd>
</dl>

### Build
Parameters for controlling the generated css and js files

<dl>
<dt>Fingerprint</dt><dd>Whether to provide subresource integrity by generating a base64-encoded cryptographic hash and attaching a <code>.Data.Integrity</code> property containing an integrity string, which is made up of the name of the hash function, one hyphen and the base64-encoded hash sum. Default is <code>true</code>.</dd>

<dt>SassOutput</dt><dd>Output style for <code>/assets/sass/cardify.scss</code>. Valid options are <code>nested</code>, <code>expanded</code>, <code>compact</code> and <code>compressed</code>. Default is <code>compressed</code>.</dd>

<dt>MinfiyScript</dt><dd>Whether to minify the Javascript file generated from <code>/assets/js/cardify.js</code>. Default is <code>true</code>.</dd>
</dl>

### Card Data

The `Card Data` parameter is optional. I highly recommend using the data template provided at <code>/data/plugin_cards/data.toml</code> or creating a template in your custom theme at <code>/data/plugin_cards_data.toml</code> as an alternative to storying a *stringified* version of the data via the plugin paramters interface. All three locations are acceptable. The next section discusses how the entries are used to provide images for Twitter / Open Graph cards for pages without an image.


## Card Image
The first image found gets priority. The large summary Twitter card will be generated when there is an image available; otherwise, the smaller summary card is generated.

When the page for which you are generating cards does not have an image available in its front matter, that’s when cool sh$t happens … and why that `Card Data` parameter is there.

The data consists of a JSON object stored as a <code>string</code> (which is what happens when you paste your JSON object code into the field and hit the button). The pasted code might look something like this:

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

All the values are image URLs. As for the keys, there are really only two things happening here. There is a <code>default</code> entry, which is used whenever nothing else could be retrieved. All the remaining keys are site paths. The bits that follow <code>[SCHEME://HOSTNAME]</code>. This is how your pages without images in the front matter get their image card.

Starting with `version 2`, instead of pasting all that JSON into the parameter field, you can save it into a template file located at <code>data/plugin_cards/card_data.json</code>.

Soooo … when I leave a link like this: <code>https://moondeer.blog/gallery/</code>

I get a Twitter card like this:

![Gallery Card](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/images/gallery.jpeg)

Orrrr … say I leave a link like this: <code>https://moondeer.blog/categories/perspectives/</code>

Then I get a Twitter card like this:

![Perspectives Card](https://raw.githubusercontent.com/moonbuck/plugin-cards/main/images/perspectives.jpeg)