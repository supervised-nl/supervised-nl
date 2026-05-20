# SEO + GEO playbook

Hoe we `supervised.nl` op nummer 1 in Google hebben gekregen. Volg deze stappen in volgorde, dan heb je dezelfde basis op elke nieuwe site. Werkt voor Hugo en met kleine aanpassingen ook voor Next.js.

## 1. Fundament: snelle, statische stack

- Hugo of Next.js met statische export, gehost op Vercel. Geen client-side framework voor content-pagina's.
- Eén CSS-bestand via Hugo Pipes met `fingerprint` en `integrity` hash. Geen JS-framework.
- Fonts via `<link rel="preload" ... as="font" crossorigin>` om LCP te drukken.
- `<script defer src="/_vercel/insights/script.js">` en `/_vercel/speed-insights/script.js` voor Real Experience Score in Vercel. Google ziet die scores indirect terug in Core Web Vitals.

## 2. Per-pagina metadata, geen losse SEO-plugin

In één `baseof.html` (of `_app.tsx`-equivalent) regel je alles:

- `<title>{{ .Title }} | {{ .Site.Title }}</title>` — gebruik altijd `.Title`, nooit gehardcodeerd.
- `<meta name="description">` met fallback naar site-default.
- `<meta name="author">` afhankelijk van section (blog = persoonsnaam, rest = merknaam).
- `<link rel="canonical" href="{{ .Permalink }}">` op elke pagina.
- `<meta name="robots" content="noindex, follow">` op `taxonomy`/`term` pagina's. Beschermt je crawlbudget.
- `<link rel="sitemap">` en `<link rel="alternate" type="application/rss+xml">`.

## 3. OpenGraph en Twitter Cards volledig invullen

- `og:title`, `og:url`, `og:type` (article voor blog, anders website), `og:site_name`, `og:description`, `og:locale`.
- Voor blog: `article:published_time` en `article:modified_time` in ISO 8601.
- `og:image` met **width en height** uit `resources.Get` zodat afmetingen kloppen.
- `twitter:card = summary_large_image`, plus `twitter:title`, `twitter:description`, `twitter:image`.
- Eén OG-beeld als default (`img/hero.png`), per-pagina override via `ogImage:` front matter.

## 4. JSON-LD structured data: zes schema-types

Het belangrijkste GEO-onderdeel (Generative Engine Optimization). Eén `<script type="application/ld+json">` blok per type, conditioneel gerenderd op basis van section en front matter.

1. **Organization** (op iedere pagina): naam, url, email, telefoon, **vatID** (BTW-nummer voor entity resolution), logo, PostalAddress, areaServed, sameAs naar LinkedIn.
2. **Article** (op blogposts): headline, description, datePublished, dateModified, image, mainEntityOfPage, author (Person met url+sameAs), publisher.
3. **FAQPage** (op pagina's met `faq:` front matter): array van `Question`/`Answer` paren. Hugo genereert de schema rechtstreeks uit het YAML-veld.
4. **Person** (op `/over/`): naam, jobTitle, worksFor → Organization. Koppelt de eigenaar aan het merk.
5. **Service** (op elke `/diensten/<x>/`): name, description, provider, areaServed. Eén sub-pagina per dienst, niet één lange pagina.
6. **BreadcrumbList** (op alle niet-home pagina's): 2 of 3 niveaus, dynamisch op basis van section.

## 5. Sitemap met expliciete prioriteiten

In `hugo.toml`:

```toml
[sitemap]
  changefreq = 'monthly'
  priority = 0.5
  filename = 'sitemap.xml'
```

Override per pagina via front matter:

| Type pagina | Priority | Changefreq |
|---|---|---|
| Home | 1.0 | weekly |
| Diensten-index, over, blog-index, faq | 0.8 | monthly |
| Sub-diensten | 0.7 | monthly |
| Contact | 0.5 | yearly |
| Privacy, algemene voorwaarden | 0.3 | yearly |

## 6. robots.txt: AI-crawlers expliciet toelaten

In `layouts/robots.txt` (Hugo) of `public/robots.txt` (Next.js) zet je naast `User-agent: *` ook expliciet:

```
GPTBot
ChatGPT-User
Claude-Web
Applebot-Extended
PerplexityBot
Google-Extended
Meta-ExternalAgent
```

Allemaal `Allow: /`. Vergeet `Sitemap:` regel onderaan niet.

## 7. llms.txt: jouw site samengevat voor LLM's

`static/llms.txt` is een platte tekst-samenvatting die LLM-crawlers prefereren boven HTML scrapen. Inhoud:

- Korte intro (wie/wat/waar).
- Diensten in bullet list, elk met **URL erbij**.
- Doelgroep, aanpak, oprichter, kernwaarden, technologie.
- Key facts: KVK, BTW, adres, contact, taal.
- Sitemap-style lijst van pagina's met paden.

## 8. Inhoud structureren voor entity resolution

- Eén URL per dienst (`/diensten/ai-workshop/`, niet `/diensten#workshop`). LLM's citeren URLs.
- Author = consistent **één naam met `sameAs` naar LinkedIn**. Zorgt dat Google jouw artikelen koppelt aan de juiste persoon.
- BTW-nummer in Organization schema. Klinkt overdreven, maar is het sterkste juridische identificatiekenmerk dat een AI-model kan gebruiken.
- FAQ-pagina met daadwerkelijke vragen die je doelgroep stelt, in consistente persoonsvorm (eerste persoon enkelvoud als je solo bent, meervoud als je een team bent).

## 9. Security headers + CSP

In `vercel.json`:

- HSTS, X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy, COOP, Permissions-Policy.
- **Strikte CSP met sha256-hashes per inline script**. Google's Page Experience signal beloont dit.
- Cache-Control `immutable` voor fonts/css/js/img.

CSP-hash berekenen voor een inline script:

```bash
echo -n "<script content>" | openssl dgst -sha256 -binary | base64
```

## 10. Uitrol-checklist voor een nieuwe site

1. Lift `baseof.html` (de hele `<head>` en de JSON-LD blokken) als template. Alles is data-driven via front matter.
2. Kopieer `hugo.toml` sitemap-blok + per-pagina front matter conventies.
3. Kopieer `robots.txt`-template en `llms.txt`-structuur. Vervang alleen de content.
4. Kopieer `vercel.json` headers. Hercompute CSP-hashes voor jouw inline scripts.
5. Per pagina-type: bepaal welk schema (`Article`, `Service`, `Person`, `FAQPage`, `WebPage`) en zet dat als `schema:` of via section in de template.
6. Submit `sitemap.xml` in Google Search Console + Bing Webmaster Tools.
7. Test JSON-LD met de Rich Results Test van Google.

## De drie ingrediënten die het verschil maken

1. **vatID + sameAs voor entity resolution** — koppelt jouw merk en personen aan een juridische identiteit die AI-modellen kunnen verifiëren.
2. **llms.txt + expliciete AI-crawler allow** voor GEO — zorgt dat ChatGPT, Claude, Perplexity en Gemini jouw site begrijpen en citeren.
3. **Eén Service-pagina per dienst met eigen schema** in plaats van één overzichtspagina — elke dienst krijgt zijn eigen indexeerbare entity.

De rest is hygiëne die elke site zou moeten hebben.
