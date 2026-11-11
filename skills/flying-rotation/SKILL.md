---
name: flying-rotation
description: Build the "flying rotation" text effect, where a headline or strapline is split into letters that start scattered (tilted at random angles, shrunk, faded, optionally offset) and fly into place, straightening as the visitor scrolls. Scroll-scrubbed with GSAP ScrollTrigger, accessible to screen readers, and respects reduced motion. Use this whenever the user asks for "flying letters", "flying rotation", "letters that rotate into place on scroll", "tilted letters that straighten", a "scattered text assemble" effect, a kinetic-type strapline, or wants a headline to "come together" as they scroll, even if they don't say GSAP.
---

# Flying Rotation

Each character of a line of text starts out **tilted at its own random angle, scaled down and faded**. As the line scrolls into view the characters **rotate back to 0°, grow to full size and turn fully opaque**, one slightly after another. The scroll position drives the animation directly (scrub): scrolling back up scatters the letters again.

Reference implementation: `parallel-studio/index.html`, section "5. Strapline" (`.strap`).

## When to use it

- One strapline or manifesto sentence per page, set large (roughly 5–12vw). The effect is a centrepiece; on body copy or several headings it becomes noise.
- Short text works best, around 6–16 words. Longer lines stagger for so long that the end never settles inside the scroll window.

## 1. Markup

Write the real sentence in the HTML so it reads without JavaScript and search engines see it:

```html
<section class="strap-band">
  <p class="strap">Parallel is a home for image-makers and the productions built around them.</p>
</section>
```

## 2. CSS

```css
.strap { font-size: clamp(40px, 8vw, 132px); line-height: 1.02; letter-spacing: -0.03em; }
/* Words never break mid-word once split into spans */
.strap .w  { display: inline-block; white-space: nowrap; }
/* Transforms do nothing on inline elements, so characters must be inline-block.
   The padding/negative-margin pair stops italic glyphs from clipping when they rotate. */
.strap .ch { display: inline-block; padding-inline: 0.06em; margin-inline: -0.06em; }
/* Optional typographic contrast: key words italic and light */
.strap .it { font-style: italic; font-weight: 300; }
```

## 3. Split the text accessibly

Screen readers would read separate spans letter by letter, so put the full sentence on the parent as `aria-label` and hide the spans:

```js
const strap = document.querySelector(".strap");
const text = strap.textContent.trim();
const plain = new Set(["is", "a", "for", "and", "the", "around"]); // words kept upright, the rest go italic
strap.setAttribute("aria-label", text);
strap.textContent = "";
text.split(/\s+/).forEach((word) => {
  const w = document.createElement("span");
  w.className = "w";
  w.setAttribute("aria-hidden", "true");
  if (!plain.has(word.toLowerCase().replace(/[^a-z]/g, ""))) w.classList.add("it");
  [...word].forEach((ch) => {            // spread handles emoji/surrogate pairs; .split("") does not
    const s = document.createElement("span");
    s.className = "ch";
    s.textContent = ch;
    w.appendChild(s);
  });
  strap.appendChild(w);
  strap.appendChild(document.createTextNode(" ")); // real spaces keep normal line wrapping
});
```

## 4. Animate

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
```

```js
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (window.gsap && !reduce) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.fromTo(".strap .ch",
    { opacity: 0.12, scale: 0.6, rotation: () => gsap.utils.random(-20, 20) }, // function = new angle per letter
    { opacity: 1, scale: 1, rotation: 0,
      ease: "power4", stagger: 0.03,
      scrollTrigger: { trigger: ".strap", start: "top bottom", end: "bottom 30%", scrub: true } });
}
```

Use `fromTo`, not `from`: with scrub, `from` records whatever state the element is in when the tween is created, and that breaks on refresh or if the code runs twice.

## 5. Make it actually "fly"

The base version only rotates and scales in place. For letters that travel in from elsewhere, add offsets to the `from` state (the `to` state goes back to `x: 0, y: 0`):

| Variant | Add to `from` | Feel |
|---|---|---|
| Scatter | `x: () => gsap.utils.random(-120, 120), y: () => gsap.utils.random(-80, 80)` | Letters drift in from a loose cloud |
| Rise | `y: () => gsap.utils.random(40, 140)` | Letters float up into the line |
| 3D flip | `rotationX: () => gsap.utils.random(-90, 90)` plus `transformPerspective: 600` | Letters tumble toward the viewer |
| Wild spin | `rotation: () => gsap.utils.random(-180, 180)` | Louder; use only for playful brands |
| Word-level | Target `.strap .w` instead of `.ch` | Calmer, and better for long lines |

Tuning knobs:
- **Angle range** (`±20`): ±8 is subtle, ±20 is lively, ±45 or more starts to look chaotic.
- **`stagger`** (`0.03`): the total spread is `stagger × letter count`. Keep it under about 2× the tween length or the last word lags behind.
- **`ease: "power4"`**: most of the motion happens early, so letters snap upright quickly and then settle. `"none"` ties them linearly to the scroll.
- **`scrub: true`** locks the animation to the scrollbar. `scrub: 0.6` adds a short catch-up lag that feels smoother with a trackpad.
- **`end: "bottom 30%"`**: the line is fully assembled before it reaches the top third of the screen, which is where people are reading.

## 6. Smooth scroll (Lenis), if the page uses it

```js
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

## 7. Fallbacks

- **No JS, or GSAP fails to load**: the HTML sentence renders normally. Only split the text if you will animate it, or else make sure the split version looks identical to the original (with the CSS above it does).
- **Reduced motion**: skip the tween. The letters stay upright and fully opaque.
- **Web fonts**: call `ScrollTrigger.refresh()` on `load` or after `document.fonts.ready`. A late font swap changes the line height and moves the trigger.

## Pitfalls

- If the characters are not `inline-block`, rotation and scale silently do nothing.
- If words are not `nowrap` wrappers, the browser can break a line between two letters of one word.
- Without the padding/negative-margin trick, the edges of italic letters get clipped while they rotate.
- If every letter gets the same angle, the effect looks like a rotated block. Pass a **function** for random values so each letter is evaluated separately.
- Putting `will-change: transform` on hundreds of characters wastes GPU memory. Leave it off; GSAP handles this itself.
- Big angles on a centred line can push letters past the viewport edge on phones. Check at 375px width, and add `overflow-x: clip` on the section if needed.

## Verify

1. Scroll slowly: the letters straighten progressively and are fully upright by the time the line reaches the upper third of the screen.
2. Scroll back up: they scatter again (scrub is reversible).
3. Turn on reduced motion in the OS or DevTools: the text is static and readable.
4. Use a screen reader or the accessibility tree: it reads the sentence once, as a whole (from `aria-label`).
5. Check at 375px wide: no horizontal scroll and no words broken mid-letter.
6. Block the GSAP CDN: the sentence still shows as normal text.
