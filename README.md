# 1Fi Marketplace

A standalone, mobile-first **Expo + React Native + TypeScript** application
that recreates the **Shop → 1Fi Marketplace** experience of the 1Fi fintech
app. Users browse smartphones, filter by brand, sort by price, open a product
to choose a variant and a **0% interest EMI plan**, and reach a mock
confirmation screen.

This is a submission for the **1Fi SDE Intern Assignment**. The real 1Fi
source is not available, so the app is implemented as an independent
extension of 1Fi's design language.

> ⚠️ Scope. Only the Shop → 1Fi Marketplace portion of the 1Fi app is
> implemented. **Top Brands** and **Nearby Stores** are intentionally
> placeholder screens with working navigation, as per the assignment.
> No real backend, no real payment processing, no GPS / map / location
> functionality is included.

---

## Features

### 1Fi Marketplace (fully implemented)
- **Product Listing** — grid of smartphones with brand chips and price sorting.
  - Filter by brand: All / Apple / Samsung / Google.
  - Sort by price: Low → High, High → Low.
  - **Loading**, **Empty**, **Error** + **Retry**, and the **Successful** state
    are all wired and visually distinct. The loading state uses product-shaped
    skeletons, not a spinner.
- **Product Detail** — image gallery (with carousel dots), brand, name,
  storage + colour variant selector that **updates the price dynamically**,
  full specifications table, highlight pills.
- **EMI Plan Selection** — each plan's tenure, monthly amount, total payable,
  **0% INTEREST** pill, **NO PROCESSING FEE** pill, and cashback where
  applicable. Plans are generated from a pure utility — see EMI Logic below.
- **Disabled CTA** until an EMI plan is selected.
- **Confirmation** — animated "Order placed" screen with order summary,
  EMI reconciliation line, and next-steps. Uses the same `MarketplaceContext`
  so the selection survives navigation.

### Top Brands, Nearby Stores (placeholders)
- Two simple, fully-styled screens that demonstrate working navigation.
- They share the same Shop bottom-tab shell.
- No GPS, map, location permissions, distance calculation, or merchant
  discovery — those are deliberately out of scope for this assignment.

### Error / Loading / Empty demonstration
- Triple-tap the **Shop** title on the Marketplace list to open the dev-only
  debug menu (gated by `__DEV__`, **never shipped in production builds**).
- From the menu you can independently force `fetchProducts()`,
  `fetchProductById()`, or `fetchEmiPlans()` to fail, then exercise the
  retry button on each affected screen.
- The mock API also exposes `setApiConfig({ shouldFail: ... })` for use from
  any console — the README example below shows both paths.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Expo SDK 51 (React Native 0.74) | Aligns with the original 1Fi mobile target. |
| Language | TypeScript (strict) | Contract between mock API, hooks, and screens. No `any`. |
| Navigation | React Navigation 6 (bottom tabs + native stack) | Three Shop tabs + nested Marketplace stack. |
| State | React Context + custom `useApi` hook | Avoids Redux for an app this size; avoids prop drilling. |
| Mock API | `src/api/marketplace.ts` (typed async functions + simulated delay + injectable failure) | Re-instantiable as a real backend without UI changes. |
| Gradients | `expo-linear-gradient` | Marketing surfaces only. |
| Testing | Jest + ts-jest | Pure-logic coverage for EMI, currency, and the mock API. |

---

## Architecture

```
src/
├── api/                    Mock API (typed async functions, delay, failure toggle)
├── components/             Reusable UI: ProductCard, VariantSelector, EmiPlanCard,
│                          PriceTag, Skeleton, EmptyState, ErrorState, BrandChips,
│                          DevDebugMenu (dev-only)
├── data/                   Mock products (Apple, Samsung, Google) + brand list
├── hooks/                  useApi (loading/error/retry + stale-request guard),
│                          useMarketplace (Context) for shared selection
├── navigation/             Typed root navigator (bottom tabs + stack)
├── screens/                Marketplace List / Detail / Confirmation + 2 placeholders
├── theme/                  Colors, radii, spacing, shadows, typography
├── types/                  Shared TypeScript types (no `any`)
└── utils/                  formatINR, formatTenureMonths, generateEmiPlans
```

### MarketplaceContext
The selected `product`, `variant`, and `emiPlan` live in
`src/hooks/useMarketplace.tsx`. Changing product clears variant + plan;
changing variant clears plan. This keeps the Detail ↔ Confirmation flow
honest without prop drilling.

### `useApi`
Generic data hook with `loading` / `success` / `error` states, retry via
`tick`, **and a sequence-number guard** that prevents an older in-flight
request from overwriting a newer one (e.g. rapid variant changes).

---

## EMI Logic (the part reviewers care about)

`generateEmiPlans(price)` in `src/utils/emi.ts` is a pure function. It does
**not** round the monthly amount to a friendly multiple, because doing so
makes `monthly × tenure ≠ price` and forces the UI to lie about the total.

Instead, for 0% interest with no fees:

```text
regularMonthlyAmount = floor(price / tenureMonths)
lastMonthlyAmount    = price − regularMonthlyAmount × (tenureMonths − 1)
```

By construction:

```text
regularMonthlyAmount × (tenureMonths − 1) + lastMonthlyAmount = price
```

The first (tenure − 1) installments are `regularMonthlyAmount` rupees; the
last installment absorbs the remainder. When the price divides evenly by
tenure, the two values coincide and the UI shows a single monthly figure.

The `EmiPlanCard` displays `regularMonthlyAmount → lastMonthlyAmount` (or
just `regularMonthlyAmount` when they are equal) and the Confirmation screen
prints the **literal reconciliation**:
`regularMonthlyAmount × (tenure − 1) + lastMonthlyAmount = price`. Nothing
is hidden.

The function is unit-tested for every combination of six real product prices
(₹60,000, ₹79,900, ₹69,999, ₹75,999, ₹1,34,900, ₹1,44,999) and six tenures
(3 / 6 / 9 / 12 / 18 / 24 months) — **36 cases**, all reconciled.

---

## Mock API

`src/api/marketplace.ts` exposes three async functions:

```ts
fetchProducts(filters?: { brand?: Brand; sort?: 'price_asc' | 'price_desc' }): Promise<Product[]>
fetchProductById(id: string): Promise<Product>
fetchEmiPlans(variantPrice: number): Promise<EmiPlan[]>
```

All three:
- Wait a configurable delay (default `400ms`) before resolving.
- Throw a typed `ApiError` if their endpoint is configured to fail.
- Return deep clones of the in-memory mock data so callers can't mutate
  state by accident.

```ts
// Force every endpoint to fail (e.g. for a quick smoke test)
import { setApiConfig, resetApiConfig } from './src/api/marketplace';

setApiConfig({ shouldFail: true });
resetApiConfig();

// Force only one endpoint to fail
setApiConfig({ shouldFail: { emi: true } });
```

In-app, **triple-tap the "Shop" title** on the Marketplace list to open the
dev-only Debug Menu (gated by `__DEV__` — not present in production builds).

---

## Error / Loading / Empty demonstration

| Step | What you'll see |
|---|---|
| 1. Open the Marketplace tab | Banner + brand chips + product grid. |
| 2. Triple-tap "Shop" | Dev Debug Menu opens. |
| 3. Toggle `Fail fetchProducts()` ON | The next list load shows the **ErrorState** with a retry button. |
| 4. Tap retry | `useApi` actually re-invokes `fetchProducts`; toggle it OFF first to recover. |
| 5. Toggle `Fail fetchProductById()` ON | Open any product → **ErrorState** on the Detail screen with retry. |
| 6. Toggle `Fail fetchEmiPlans()` ON | Open any product → Detail loads, but the EMI list shows the **ErrorState** with retry. |

In production builds (`expo export`, `eas build`) the Debug Menu is tree-
shaken out by Metro because it is wrapped in `__DEV__` and imports only the
local mock API (no network, no secrets).

---

## Security

This is a self-contained, mock-only application. **There are no secrets to
or secrets to manage.** The repository does not depend on any third-party
API key.

### What we checked
- **Secret scan** of the entire repository: no `.env` files, no API keys,
  tokens, JWT secrets, database URLs, cloud credentials, or hardcoded
  passwords were found. Only matches for `js-tokens` and similar package
  names in `package-lock.json`.
- **Git history**: this repository was re-initialised as a clean single
  commit to avoid accidentally pulling in untracked parent-directory state.
  No secrets exist in the included history.
- **Production bundle**: `npx expo export --platform web` was inspected.
  No API keys, bearer tokens, or passwords appear in the bundle.
- **Dependency audit**: `npm audit` shows 38 dev-only vulnerabilities inside
  Expo's tooling (node-tar, cacache, xcode/uuid, etc.) that do **not** reach
  the runtime bundle. They are inherited from Expo SDK 51 and require
  upgrading to Expo 52+ to address. They are documented as a remaining risk
  below.
- **Failure injection**: the dev-only Debug Menu is gated by `__DEV__` and
  never compiled into production builds. It only toggles an in-memory flag
  on the local mock API — there is no production backdoor.
- **No unsafe APIs** are used: no `eval`, no `Function()`, no `dangerouslySetInnerHTML`,
  no remote script loading. The web bundle is a single static JS file served
  with a standard Content-Type. All external resources are HTTPS Unsplash
  CDN images (replace with first-party assets for production).

### What is **not** applicable here
- CORS — there is no backend.
- Authentication — there is no auth.
- Server-side vulnerabilities — there is no server.
- Push notifications, deep links, runtime permissions — none requested.

---

## Running locally

```bash
# 1. Install
npm install

# 2. Run on iOS / Android / Web
npm run start         # interactive Expo dev server
npm run android
npm run ios
npm run web

# 3. Verify
npm run typecheck     # tsc --noEmit, must pass
npm test              # Jest, runs EMI + currency + mock API tests
```

Requirements: Node 18+, the Expo Go app on your phone (or Android emulator /
iOS simulator), and the optional `eas-cli` for production builds.

---

## Building

```bash
# Web (static SPA, deployable to any static host)
npx expo export --platform web --output-dir dist

# iOS (requires a Mac with Xcode + an Apple Developer account)
npx expo prebuild --platform ios
npx expo run:ios

# Android (requires Android SDK + a keystore)
npx expo prebuild --platform android
npx expo run:android
```

For EAS Build, create a private `eas.json` (not in this repo) and use
`eas build --platform ios|android`.

---

## Deployed Website

The production web bundle was built and smoke-tested locally with
`http-server` (HTTP 200, ~712 KB JS, no inline secrets).

> ⚠️ I cannot push to a public deployment target from this sandbox. The
> static `dist/` folder produced by `npx expo export --platform web` is
> drop-in deployable to **Netlify**, **Vercel**, **Cloudflare Pages**, or
> **GitHub Pages** — see the Deployment section below.

### Quick deploy — Netlify
```bash
npx expo export --platform web --output-dir dist
npx netlify-cli deploy --dir dist --prod
```

### Quick deploy — Vercel
```bash
npx expo export --platform web --output-dir dist
npx vercel deploy dist --prod
```

### Quick deploy — GitHub Pages
```bash
npx expo export --platform web --output-dir dist
npx gh-pages -d dist -b gh-pages
```

---

## GitHub

This project's intended repository is the existing remote. To publish the
final code:

```bash
# 1. Initialise a fresh git history scoped to this folder
git init -b main
git add .
git commit -m "feat: 1Fi Marketplace (List / Detail / EMI / Confirmation) with truthful EMI reconciliation and Jest coverage"

# 2. Add the remote (already configured in your environment as the bhavik305/advance remote)
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

> ⚠️ I do not have credentials in this sandbox to run `git push` on your
> behalf. Run the commands above locally with your GitHub access.

---

## Scope (explicit)

- ✅ **Marketplace**: complete (List / Detail / EMI / Confirmation).
- ✅ **Top Brands**: placeholder with working navigation.
- ✅ **Nearby Stores**: placeholder with working navigation.
- ❌ No real payment processing.
- ❌ No real backend.
- ❌ No location / GPS / maps.
- ❌ No KYC / auth.
- ❌ No push notifications, deep links, or runtime permissions.

---

## Known limitations

- **Demo images** come from Unsplash. In a real 1Fi build they would come
  from the brand partner's CDN.
- **Cashback amounts** are illustrative defaults inside `generateEmiPlans`,
  not pulled from a real offers service.
- **No automated UI tests**. Pure-logic coverage (EMI, currency, mock API)
  is in place via Jest; component / e2e tests were not requested and were
  out of scope for the time budget.
- **Expo SDK 51 carries known dev-tooling vulnerabilities** (`node-tar`,
  `cacache`, `xcode/uuid`). They are inherited and require upgrading to
  Expo SDK 52+ to address; they do **not** reach the runtime bundle.
- **No deployment** was performed from this sandbox because it has no
  outbound credentials. The static web export is ready to be uploaded to
  any static host.

---

## Scripts

| Script | What it does |
|---|---|
| `npm run start` | Start the Expo dev server |
| `npm run android` / `ios` / `web` | Start the dev server targeting a platform |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run Jest (3 suites, 65 tests) |
| `npm run test:watch` | Jest watch mode |