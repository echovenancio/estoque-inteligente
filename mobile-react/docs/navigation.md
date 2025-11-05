# Navigation & Component Design

This document describes the planned navigation graph, the primary screens and reusable components, the data shapes, edge cases, and PR-sized tasks to implement next.

## Routing approach
- The project uses expo-router (file-based routing) in `mobile-react/app/`.
- Continue with expo-router for top-level flows because it's already present (routes: `/login`, `/inventory`, etc.).
- Where finer stack behavior is needed (modals, nested flows), create nested folder pages or add a `src/navigation` wrapper that uses react-navigation for advanced flows — but prefer file-based routes first.

## Routes (file-based)
- `/login` -> `app/login.tsx` (renders `src/screens/LoginScreen`) [done]
- `/inventory` -> `app/inventory.tsx` (renders `src/screens/InventoryScreen`) [done]
- `/inventory/[id]` -> product detail page (to add) -> renders `src/screens/ProductDetailScreen` or equivalent
- `/inventory/add` -> add/edit product page (to add)
- `/categories` -> categories list page (optional)
- `/settings` -> settings / logout page (optional)

Notes:
- Root `app/index.tsx` should redirect to `/login` when unauthenticated (already implemented as redirect to `/login`).
- Use `router.push('/inventory')` after login (already implemented).

## Primary screens (PR-sized list)
1. Login (existing) — PR 1
   - File: `src/screens/LoginScreen.tsx` (already implemented)
   - Behavior: POST /v1/login -> store token, then router.push('/inventory').
   - Edge cases: invalid credentials, server down, slow network.

2. Inventory list — PR 2
   - File: `src/screens/InventoryScreen.tsx` (UI exists; currently uses mock data)
   - Behavior: call `API.getInventory()` on mount, show loading skeleton, show empty state, retry on failure.
   - Components used: `ProductList`, `ProductItem`.

3. Product detail — PR 3
   - New file: `src/screens/ProductDetailScreen.tsx` (route: `/inventory/[id]`)
   - Behavior: GET /v1/estoque/{id}, show product details, edit button -> navigate to add/edit.

4. Add/Edit product — PR 4
   - File: `src/screens/ProductFormScreen.tsx` (route: `/inventory/add` or `/inventory/[id]/edit`)
   - Behavior: GET categories, validate fields, POST or PUT as needed.

5. Settings / Logout — PR 5
   - File: `src/screens/SettingsScreen.tsx`
   - Behavior: logout -> `CredStore.removeToken()` and router.replace('/login')

## Reusable components
- `ProductItem` (exists) — display name, quantity, colored chip, onPress
- `ProductList` (exists) — FlatList wrapper
- `IconButton` — small icon button with ripple
- `PrimaryButton`, `TextInput` — styled inputs & buttons consistent with `ThemeProvider`
- `EmptyState`, `LoadingSkeleton` — standardized states

## Data shapes (from `src/types/models.ts`)
- LoginReq: { email: string; password: string }
- LoginRes: union; expect at least a token field (server returns `idToken` or `token` currently)
- ResProduto / Produto: product id, name, preco, qtd, categoria, obs, criadoEm

Recommended: verify server `v1/login` JSON shape in `server/v1/endpoints.py` and align token field (e.g., `access_token`).

## Auth, guards and token handling
- Use `CredStore` (AsyncStorage) to persist token on login.
- Axios interceptor on `src/services/api.ts` attaches the token in `Authorization: Bearer ...`.
- Add a small auth middleware/guard: pages under `/inventory` should check `CredStore.getToken()`; if null, redirect to `/login` (use `useEffect` + `router.replace('/login')`).

## Error handling & UX expectations
- Show user-friendly errors from server when available. On network failure show 'Tentar novamente' action.
- Provide empty-state UI when no products.

## PR-sized implementation plan (short-term)
1. PR-2 (Inventory list)
   - Wire `InventoryScreen` to `API.getInventory()` with loading and error states.
   - Add an auth guard on mount to redirect to `/login` if no token.
   - Add a logout button in the header to clear token.

2. PR-3 (Product detail)
   - Implement `/inventory/[id]` page, call `API.getProduct(id)`, map fields to UI.

3. PR-4 (Add/Edit product)
   - Implement form and POST/PUT flow, integrate `API.addProduct` and `API.updateProduct`.

4. PR-5 (Polish & types)
   - Remove temporary `.d.ts` shims where possible by relying on installed types; fix typing issues and add basic unit tests for `ProductItem` (snapshot) and `LoginScreen` (render smoke test).

## Edge cases & testing
- Handle token expiry: 401 responses should force logout and redirect to login.
- Large product lists: implement pagination or lazy loading if the API supports it.
- Input validation for product fields.

## Next immediate action
- Implement PR-2: wire `InventoryScreen` to call `API.getInventory()`, show loader and empty state, and add an auth guard + logout control.

---
If this plan looks good, I'll implement PR-2 next and create a small test to validate the inventory fetch. If you'd prefer a different ordering, tell me which PR to prioritize.
