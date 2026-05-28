# Unity Spec — supervised.nl design-upgrade pass

Dit is **dé bron** voor de coördinatie tussen parallel agents. Elke agent moet hier strikt aan houden zodat de site eenheid behoudt.

**Branch:** `motion-design-upgrade`
**Site:** Hugo static, single CSS file
**Toon:** Rustig, zelfverzekerd, geen pocha (NL MKB)

---

## Pas DEZE design tokens toe in `:root` (Agent A doet dit)

Alle bestaande hardcoded waarden in `main.css` worden waar mogelijk vervangen door tokens.

```css
:root {
  /* Surface */
  --bg: #021602;                                  /* unchanged — brand signature */

  /* Ink (tinted whites) */
  --ink-1: oklch(0.985 0.005 145 / 1);            /* strong */
  --ink-2: oklch(0.985 0.005 145 / 0.8);          /* body */
  --ink-3: oklch(0.985 0.005 145 / 0.65);         /* nav/footer — UP from 0.45 (WCAG) */
  --ink-4: oklch(0.985 0.005 145 / 0.35);         /* footer-right, subtle */

  /* Accent (warm orange) */
  --accent: #FF6205;                              /* unchanged */
  --accent-soft: rgb(255 98 5 / 0.5);
  --accent-bg: rgb(255 98 5 / 0.08);              /* blockquote bg */
  --accent-text-em: rgb(255 98 5 / 0.85);         /* current em color */

  /* Rule lines */
  --rule: oklch(0.985 0.005 145 / 0.1);

  /* Radius */
  --radius-sm: 0.382rem;
  --radius-md: 1rem;
  --radius-lg: 2.618rem;

  /* Motion */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);     /* primary curve everywhere */
  --dur-fast: 180ms;                              /* hover feedback */
  --dur-normal: 350ms;                            /* view transitions, medium */
  --dur-slow: 600ms;                              /* glowIn */
  --dur-hero: 700ms;                              /* heroIn */
}
```

**Belangrijk:** `::selection` blijft `var(--accent-soft)` background + `var(--ink-1)` color. Geen `#fff`.

---

## Refactor: vervang dit, met dat

Agent A doet de vervangingen in `main.css`. **Behoud bestaande visuele uitkomst**, alleen via tokens.

| Bestaand | Vervang door |
|----------|--------------|
| `rgba(255, 255, 255, 0.8)` (body color) | `var(--ink-2)` |
| `rgba(255,255,255, 0.8)` in `a` color (line 53) | `var(--ink-2)` |
| `rgba(255,255,255,0.45)` (link underline gradients) | `var(--ink-3)` |
| `rgba(255,255,255,0.45)` (`#menu li a` color) | `var(--ink-3)` |
| `rgba(255,255,255,0.75)` (`#menu li a:hover`) | `var(--ink-2)` |
| `rgba(255,255,255,1)` (`#menu li a.active`, `strong`) | `var(--ink-1)` |
| `rgba(255, 98, 5, 0.35)` (`::selection bg`) | `var(--accent-soft)` |
| `#fff` (`::selection color`) | `var(--ink-1)` |
| `rgba(255,98,5,0.85)` (em color) | `var(--accent-text-em)` |
| `rgba(255,98,5,0.5)` (blockquote border-left) | REMOVE (zie blockquote redesign) |
| `rgba(255,255,197,0.2)` (noise lijnen) | behoud — dit is een specifieke warme tint, geen ink |
| `rgba(255,255,197,0.15)` (`hr` border) | `var(--rule)` (geringe drift acceptabel) |
| `rgba(2, 22, 2, 0.85)` (header bg) | `oklch(from var(--bg) l c h / 0.85)` OR behoud — keuze agent |
| `rgba(255, 255, 255, 0.1)` (header en footer border) | `var(--rule)` |
| `rgba(255, 255, 255, 0.5)` (footer-top color) | `var(--ink-3)` |
| `rgba(255, 255, 255, 0.5)` (footer-top a) | `var(--ink-3)` |
| `rgba(255, 255, 255, 0.7)` (footer-top a:hover) | `var(--ink-2)` |
| `rgba(255,255,255,0.35)` (footer-right a) | `var(--ink-4)` |
| `rgba(255,255,255,0.55)` (footer-right a:hover) | `var(--ink-3)` |
| `rgba(255, 255, 255, 0.055)` (footer-wordmark) | behoud literal (specifieke alpha) |
| `100vh` (in body line 26) | `100lvh` (consistentie) |
| `2.618rem` border-radius hero image | `var(--radius-lg)` |
| `1.618rem` border-radius hero image mobile | `var(--radius-md)` |

---

## Motion-pass (Agent A)

Bestaande keyframes blijven, easing+timing worden bijgesteld:

```css
#glow {
  /* ... existing ... */
  animation: glowIn var(--dur-slow) ease-out forwards;  /* WAS: 1.2s ease-in-out */
}

@keyframes glowIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes heroIn {
  from { opacity: 0; transform: rotate(4deg) translateY(16px); filter: blur(4px); }
  to   { opacity: 1; transform: rotate(4deg) translateY(0);   filter: blur(0); }
}

#content .hero-image img {
  /* ... existing ... */
  animation: heroIn var(--dur-hero) var(--ease-out) 0.2s both;  /* WAS: 1s ease 0.2s both */
}
```

### Link underline transition (line 59)
Behoud `background-size 0.3s` — werkt al goed. Geen wijziging.

### Menu link hover (line 132)
```css
#menu li a {
  /* ... existing ... */
  padding: 0.382rem 0;                           /* nieuw — touch target */
  transition: color 150ms var(--ease-out);       /* WAS: 0.2s ease */
}
```
**Belangrijk:** `padding: 0.382rem 0` mag NIET de horizontale positie veranderen. Alleen vertical padding voor 44×44 tap-area.

### Client-logos (line 191)
```css
#content .clients-logos img {
  height: 1.618rem !important;
  width: auto !important;
  max-width: 100% !important;
  margin-bottom: 0 !important;
  opacity: 0.55;                                 /* WAS: 0.25 */
  mix-blend-mode: luminosity;                    /* NEW — preserve hue, kill saturation */
  transition: opacity var(--dur-fast) var(--ease-out), mix-blend-mode var(--dur-fast) var(--ease-out);
}
#content .clients-logos img:hover {
  opacity: 1;                                    /* WAS: 0.65 */
  mix-blend-mode: normal;                         /* NEW — reveal real brand colors on hover */
}
```
**Verwijder:** `filter: brightness(0) invert(1)` regel.

### Custom view-transitions (nieuw)
```css
@keyframes vt-out { to { opacity: 0; transform: translateY(-8px); } }
@keyframes vt-in  { from { opacity: 0; transform: translateY(8px); } }

::view-transition-old(root) {
  animation: vt-out var(--dur-normal) var(--ease-out) both;
}
::view-transition-new(root) {
  animation: vt-in  var(--dur-normal) var(--ease-out) both;
}
```

### Blockquote redesign (vervang line 153)
```css
blockquote {
  margin: 0.618em 0 1.618em;
  padding: 1rem clamp(1rem, 2.1vw, 1.618rem);
  background: var(--accent-bg);
  border-radius: var(--radius-md);
  font-style: italic;
}
```

### Scroll-to-top transition (line 138)
Behoud, vervang inline `0.3s ease-in-out` met `var(--dur-normal) var(--ease-out)`.

### `prefers-reduced-motion` block (NEW — top of file na `@view-transition` regel)
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Cursor-responsive glow (nieuw, hoort bij Agent B's JS) — CSS-kant
Voeg ergens bij `#glow` een fallback toe:
```css
#glow {
  /* ... existing ... */
  --glow-x: 0px;
  --glow-y: 0px;
  background: radial-gradient(circle max(48vw, 55vh) at calc(-17vw + var(--glow-x)) calc(52% + var(--glow-y)), #FF6205 0%, rgba(255,98,5,0.4) 45%, transparent 80%);
  transition: background-position var(--dur-normal) var(--ease-out);
}
```
Agent B's JS update `--glow-x` en `--glow-y` op `#glow` element. Max range: ±3vw / ±3vh.

---

## Diensten signature move (I6)

Geen redesign. Eén visueel anker per dienst: een groot, dun nummer.

### CSS (Agent A — voeg toe in diensten sectie)
```css
.dienst-card {
  position: relative;
  border-top: 1px solid var(--rule);                    /* refactor van bestaande */
  padding-top: 2.618rem;
  margin-bottom: 2.618rem;
  display: grid;
  grid-template-columns: 4rem 1fr;
  gap: clamp(1rem, 2.5vw, 2.618rem);
  align-items: baseline;
}

.dienst-number {
  font-size: 1.618rem;
  font-weight: 300;
  color: var(--ink-4);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
  line-height: 1;
}

.dienst-card h2 { padding-top: 0; margin-top: 0; }
.dienst-card-body { display: contents; }                /* huidige inhoud lift right column in */

@media (max-width: 600px) {
  .dienst-card {
    grid-template-columns: 1fr;
    gap: 0.382rem;
  }
  .dienst-number {
    font-size: 0.9rem;
    letter-spacing: 0.382em;
    color: var(--ink-3);
  }
}
```

### Template (Agent B — `themes/supervised/layouts/diensten/list.html`)
```html
{{ define "main" }}
<h1>{{ .Title }}</h1>
{{ .Content }}
<div class="diensten-cards">
  {{ range $i, $page := .Pages.ByWeight }}
  <article class="dienst-card">
    <span class="dienst-number" aria-hidden="true">{{ printf "%02d" (add $i 1) }}</span>
    <div>
      <h2><a href="{{ .RelPermalink }}">{{ .Title }}</a></h2>
      <p>{{ .Description }}</p>
      <a href="{{ .RelPermalink }}" class="small">Meer lezen →</a>
    </div>
  </article>
  {{ end }}
</div>
<p class="small" style="margin-top: 3.236rem; opacity: 0.7;"><a href="/faq/">Veelgestelde vragen →</a></p>
{{ end }}
```

---

## Contact FAQ link (Agent B — `themes/supervised/layouts/contact/single.html`)

Voeg toe **na** de bestaande `.contact-details` div, vóór `{{ end }}`:

```html
<p class="small" style="margin-top: 3.236rem; opacity: 0.7;"><a href="/faq/">Veelgestelde vragen →</a></p>
```

---

## Blog-list visual anchor — niet in deze pass

Per audit: één template tegelijk. Diensten krijgt de signature-treatment, blog-list blijft zoals het is. Future pass.

---

## JS-pass (Agent B)

### NEW FILE: `themes/supervised/static/js/site.js`

```js
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Scroll-state classes via IntersectionObserver (was scroll-listener)
  var top = document.getElementById('top');
  if (top) {
    new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        document.body.parentElement.classList.toggle('scrollstart', e.intersectionRatio < 1);
        document.body.classList.toggle('scrolled', !e.isIntersecting);
      });
    }, { threshold: [0.99, 1] }).observe(top);
  }

  // End-of-page sentinel
  var footer = document.querySelector('footer');
  if (footer) {
    new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        document.body.classList.toggle('scrolledend', e.isIntersecting);
      });
    }, { rootMargin: '0px 0px -1px 0px' }).observe(footer);
  }

  // 2. Lenis smooth-scroll — desktop + reduced-motion-respecting
  if (window.innerWidth > 1000 && !reduced) {
    var lenisScript = document.createElement('script');
    lenisScript.src = '/js/lenis.min.js';
    document.body.append(lenisScript);
  }

  // 3. Cursor-responsive glow — ambient, ±3vw range
  if (!reduced && window.matchMedia('(pointer: fine)').matches) {
    var glow = document.getElementById('glow');
    if (glow) {
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      window.addEventListener('pointermove', function(e){
        tx = (e.clientX / window.innerWidth - 0.5) * 6;   // ±3vw
        ty = (e.clientY / window.innerHeight - 0.5) * 6;  // ±3vh
        if (!raf) raf = requestAnimationFrame(tick);
      }, { passive: true });
      function tick(){
        cx += (tx - cx) * 0.08;
        cy += (ty - cy) * 0.08;
        glow.style.setProperty('--glow-x', cx.toFixed(2) + 'vw');
        glow.style.setProperty('--glow-y', cy.toFixed(2) + 'vh');
        raf = (Math.abs(tx-cx) > 0.01 || Math.abs(ty-cy) > 0.01) ? requestAnimationFrame(tick) : null;
      }
    }
  }
})();
```

**Belangrijk:** 
- Geen `addEventListener('scroll', ...)`
- Lenis check ook reduced-motion
- Cursor-glow alleen op pointer:fine (geen touch)
- requestAnimationFrame throttling
- Range: ±3vw/vh subtle — niet als feature, ambient

### `themes/supervised/layouts/_default/baseof.html` updates

**1.** Vervang het tweede inline `<script>` blok (regel ~211-217, het scroll-listener + Lenis loader script) door:
```html
<script defer src="/js/site.js"></script>
```
Plaats deze NA de twee Vercel-insights scripts, op dezelfde plek waar het oude blok zat.

**2.** Het EERSTE inline script blijft (Android detection):
```html
<script>
  if (/Android/i.test(navigator.userAgent)) document.body.classList.add('android');
</script>
```
Hash van dit script blijft hetzelfde. Niet aanraken.

---

## vercel.json CSP — wordt later door orchestrator gefixed

Agent B hoeft vercel.json NIET aan te raken. Orchestrator herberekent na agent-pass.

---

## Restricties — wat NIET aanraken

| Behoud | Reden |
|--------|-------|
| `#glow` radial-gradient kleurstops | Brand signature |
| `#noise` grid lines pattern | Custom texture, niet vervangbaar |
| Hero portrait 4° rotatie + 2.618rem radius | Behoud |
| Golden ratio type-scale | Intentioneel systeem |
| Footer wordmark (17vw) | Enige expressie nu, behouden |
| GeneralSans font | Brand |
| Asymmetrische 55/45 hero-layout | Brand |
| `#content { width: 50%; ... }` desktop | Brand |
| Alle copy in content/ | Tone of voice is correct |
| Hugo template logica (range, with, if) | Werkt — niet refactoren |

---

## Sanity-checks na implementatie (orchestrator)

- [ ] Tokens in `:root` aanwezig en gebruikt
- [ ] `@media (prefers-reduced-motion: reduce)` block aanwezig
- [ ] Geen `#fff` of `rgba(255,255,255,...)` literals meer (op `--ink-4` rgba en noise lines na)
- [ ] heroIn duration 700ms, ease-out-quart
- [ ] glowIn duration 600ms, ease-out, forwards
- [ ] Client logo opacity 0.55 baseline + mix-blend-mode
- [ ] `filter: brightness(0) invert(1)` verwijderd
- [ ] view-transition rules aanwezig
- [ ] Blockquote zonder border-left
- [ ] dienst-card heeft `.dienst-number` rendering
- [ ] FAQ link op /diensten/ en /contact/
- [ ] site.js aanwezig in static/js/
- [ ] baseof.html inline script #2 vervangen door externe ref
- [ ] CSP hash gefixed (orchestrator doet dit)
- [ ] Hugo build/serve werkt zonder errors
- [ ] Visuele identiteit behouden (glow, hero, footer wordmark)
