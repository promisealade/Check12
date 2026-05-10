# Afrione theme

Lifted from the wallet home mockup (AFRi card + xGHS row + action tiles + Recent list). The theme lives in two files and is consumed by everything under `apps/web/src` via Tailwind classes — no extra wiring needed.

- `apps/web/tailwind.config.ts` — color scales, fonts, radii, shadows
- `apps/web/src/app/globals.css` — component layer (`.wallet-card`, `.action-tile`, `.badge-sage`, etc.)

## Color tokens

| Token             | Hex        | Used for                                              |
|-------------------|------------|--------------------------------------------------------|
| `parchment`       | `#EFE9DD`  | Page background                                        |
| `brand-700` (ink) | `#1E2F22`  | AFRi wallet card surface; primary heading color        |
| `brand-600`       | `#243A28`  | Hover state on dark surfaces                           |
| `brand-50`        | `#EEF1EA`  | Soft brand backgrounds (`.alert-info`)                 |
| `gold-400`        | `#C9A04B`  | Primary accent — token bubble, AFRi mark, focus ring   |
| `gold-500`        | `#B9893A`  | Gold CTAs (`.btn-gold`)                                |
| `gold-300`        | `#E6C57A`  | "Live · 1 AFRi = 14.82 GHS" text on dark card          |
| `sage-200`        | `#CDD8C4`  | xGHS token bubble + "Bank of Ghana licensed" pill      |
| `sand-100`        | `#F4E8CB`  | "Sent to Adaeze" tx pill + "100% reserves" pill        |
| `muted-100`       | `#ECE7DA`  | Hairline borders between cards / tx rows               |
| `muted-500`       | `#6E6A5E`  | `.subtle` text (timestamps, "Akwaaba" greeting)        |
| `body`            | `#3A3E37`  | Default body text                                      |
| `success-700`     | `#1F5326`  | `+500 xGHS`, `+1,200 xGHS` incoming amounts            |

Plus standard semantic scales for warn / danger and a full 50–900 ramp on `brand`, `gold`, `sage`, `muted` for in-between cases.

## Component classes

The screenshot maps almost 1:1 onto these utilities:

```tsx
// AFRi hero card
<section className="wallet-card">
  <div className="flex items-start justify-between gap-3">
    <div className="flex gap-3">
      <span className="token-bubble token-bubble--gold">A</span>
      <div>
        <p className="font-semibold">AFRi wallet</p>
        <p className="text-xs text-white/65">Gold-backed · USD-pegged</p>
      </div>
    </div>
    <span className="wallet-rate">Live · 1 AFRi = 14.82 GHS</span>
  </div>
  <p className="wallet-balance mt-4">42.18 <span className="text-lg opacity-85">AFRi</span></p>
  <p className="mt-1 text-xs text-white/60">≈ GHS 625.31 · USD 42.18</p>
</section>

// xGHS secondary row
<div className="wallet-row mt-3">
  <span className="token-bubble token-bubble--sage">x</span>
  <div className="flex-1">
    <p className="font-semibold text-brand-700">xGHS wallet</p>
    <p className="text-xs text-muted-500">1:1 cedi · Bank-backed</p>
  </div>
  <div className="text-right">
    <p className="text-base font-semibold text-brand-700">1,240.00</p>
    <p className="text-xs text-muted-500">GHS 1,240.00</p>
  </div>
</div>

// Action grid
<div className="grid grid-cols-4 gap-2.5 mt-4">
  <button className="action-tile"><Icon /> Send</button>
  <button className="action-tile"><Icon /> Receive</button>
  <button className="action-tile"><Icon /> Buy</button>
  <button className="action-tile"><Icon /> Cash out</button>
</div>

// Trust badges
<div className="flex gap-2">
  <span className="badge-sage">Bank of Ghana licensed</span>
  <span className="badge-gold">100% reserves</span>
</div>

// Recent transactions
<ul>
  <li className="tx-row">
    <span className="token-bubble token-bubble--sand">↗</span>
    <div className="flex-1">
      <p className="text-sm font-semibold text-brand-700">Sent to Adaeze (NG)</p>
      <p className="text-xs text-muted-500">Today, 10:42 · Settled in 38s</p>
    </div>
    <div className="text-right">
      <p className="tx-amount-out">–5.00 AFRi</p>
      <p className="text-xs text-muted-500">≈ NGN 8,420</p>
    </div>
  </li>
</ul>
```

## Migration notes

The previous palette only changed in the warmer/cooler direction — most pages will pick up the new look automatically. Three things to look for when sweeping the codebase:

1. `bg-cream` still works (kept as an alias) but new code should prefer `bg-parchment`.
2. `text-gray-*` references should migrate to the `text-muted-*` scale — the new muted ramp is warm (`#ECE7DA → #3F3D37`) instead of cool gray, which is what makes the cream surface read as parchment instead of paper.
3. Buttons that were `bg-brand-500` should move to `bg-brand-700` to match the wallet card's deeper green — `brand-500` is now a mid-tone.

Preview the swatches & mock components at `docs/theme-preview.html`.
