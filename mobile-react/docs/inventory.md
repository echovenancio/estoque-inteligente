# Inventory & Mapping — Android -> Expo/React Native

This document maps the existing Android Kotlin/XML UI and app flows to React Native (Expo + TypeScript) screens, components, data shapes and PR-sized tasks. Use this for reviews before implementing screens.

---

## High level screens (from `mobile/app/src/main`)

1. Login (Android: `MainActivity`, layout `activity_main.xml`)
   - Features: animated logo, email input, password input (material outline), login button, client-side validation, calls `ApiAccess.login()` then navigates to `LojaActivity` or `FabricaActivity` based on email.
   - RN mapping: `src/screens/LoginScreen.tsx` (already scaffolded). Supporting components: `LogoHeader`, `RoundedTextInput`, `PrimaryButton`.

2. Loja (Store) list (Android: `LojaActivity`, layout `activity_loja.xml`)
   - Features: header with logo + sign out button, search input (TextInput inside TextInputLayout), product list (RecyclerView), add product FAB/ImageButton, product list header (columns: Nome, Quantidade, Categoria), product list item uses `item_produto.xml`.
   - RN mapping: `src/screens/InventoryScreen.tsx` (param `role: 'loja' | 'fabrica'`), `src/components/ProductList.tsx`, `src/components/ProductItem.tsx`, `src/components/SearchInput.tsx`.

3. Fabrica list (Android: `FabricaActivity`, layout `activity_fabrica.xml`)
   - Similar to Loja; differences: navigation on item click goes to `FabricaVisualizarProduto`.
   - RN mapping: same Inventory screen with role flag or separate `FactoryInventoryScreen.tsx` if UI diverges.

4. Product detail (Android: `VisualizarProduto.kt`, `activity_visualizar_produto.xml`; also `FabricaVisualizarProduto.kt`)
   - Features: show product fields (name, quantity, labels/tags, annotations), edit button, delete button, back button.
   - RN mapping: `src/screens/ProductDetailScreen.tsx` with `mode: 'view' | 'edit'`.

5. Add/Edit product (Android: `AddProdutos.kt`, layout `activity_editar_produtos.xml`)
   - Features: text inputs for product name, quantity numeric input, spinner dropdown for units (gr, lt, un, kg, ml), dynamic editable flavors list (`item_sabor_editavel.xml`) — add/remove flavor chips, color preview for chips (ColorsProvider), submit button.
   - RN mapping: `src/screens/ProductEditScreen.tsx`, `src/components/FlavorChipEditable.tsx`, `src/components/UnitPicker.tsx`.

6. Small components / adapter
   - `ProdutoAdapter.kt` -> `src/components/ProductList.tsx` + adapter logic (filter, updateList)

---

## Data shapes (TypeScript interfaces)

Based on `mobile/app/src/main/java/.../model/*.kt` and `server/` endpoints.

- Login / Auth
  - Login request: { email: string; senha: string } -> RN: { email: string; password: string }
  - Login response (LoginRes):

    ```ts
    interface LoginRes {
      idToken: string;
      email: string;
      // other fields present in Kotlin LoginRes if any
    }
    ```

- Product shapes

  ```ts
  export interface ResProduto {
    id: string;
    nm_produto: string;
    type_quantidade?: string | null; // unit
    val_quantidade: number;
    labels: string[]; // flavors/tags
    best_describer: string; // category/label
    anotation?: string | null;
    cluster_id?: number;
    created_at?: string;
    updated_at?: string;
  }

  export interface Produto {
    nm_produto: string;
    type_quantidade?: string | null;
    val_quantidade: number;
    labels: string[];
    anotation?: string | null;
  }
  ```

These are already added into `mobile-react/src/types/models.ts` (see file in the repo).

---

## API endpoints and RN service mapping

Android `ApiAccess.kt` uses these endpoints (base `/v1`):
- POST /v1/login -> `services/api.login()` -> returns `LoginRes`
- GET /v1/estoque -> `services/api.getInventory()` -> returns `ResProduto[]`
- GET /v1/estoque/{id} -> `services/api.getProduct(id)` -> returns `ResProduto`
- POST /v1/estoque -> `services/api.addProduct(produto)` -> returns `ResProduto`
- PUT /v1/estoque/{id} -> `services/api.updateProduct(id, produto)` -> returns `ResProduto`
- DELETE /v1/estoque/{id} -> `services/api.deleteProduct(id)` -> returns success boolean
- GET /v1/categorias -> `services/api.getCategories()` -> returns `string[]`

Implementation notes for RN:
- Use `axios` instance with baseURL from env or `server` BuildConfig equivalent. Keep token in `CredStore` (wrap AsyncStorage), and attach Authorization header to requests.
- Provide typed wrappers in `src/services/api.ts`.

---

## Reusable components (suggested)

- `LogoHeader` — logo + app name, can accept a small `onSignOut` prop.
- `RoundedTextInput` — wrapper for TextInput with label/placeholder and Material-like outline style.
- `PrimaryButton` — consistent button with loading state.
- `SearchInput` — TextInput with clear button and optional debounce.
- `ProductItem` — shows name, quantity and a colored category chip (ColorsProvider logic ported to JS).
- `ProductList` — FlatList wrapper that accepts `items: ResProduto[]`, `onItemPress(item)` and provides `filter(query)` and `refresh`.
- `FlavorChipEditable` — editable flavor chip with remove button.
- `UnitPicker` — simple RN Picker (use `@react-native-picker/picker`) or `react-native-modal-selector`.

Each component should be small and unit-testable.

---

## Navigation graph (recommended)

- RootStack:
  - Login (public)
  - MainTab or Stack (requires auth):
    - InventoryScreen (param role: 'loja' | 'fabrica')
    - ProductDetailScreen (productId)
    - ProductEditScreen (productId? null for create)

Auth flow:
- On successful login store token and navigate to Inventory depending on role (Android used hard-coded email checks; use server role field or mimic same check for now).

---

## PR-sized implementation plan (small reviewable tasks)

1. PR #1 — Project setup & Login (already done)
   - Files: `App.tsx`, `src/screens/LoginScreen.tsx`, `src/styles/theme.tsx`, `tsconfig.json`, Babel, lint configs.
   - Tests: LoginScreen render.
   - Acceptance: `expo start` loads and Login screen renders.

2. PR #2 — Types and API client
   - Files: `src/types/models.ts`, `src/services/api.ts`, `src/services/credStore.ts` (AsyncStorage wrapper)
   - Tests: unit tests for api methods mocked with msw or jest mocks.
   - Acceptance: call `getInventory()` in a simple smoke component and show mocked data.

3. PR #3 — ProductItem and ProductList components
   - Files: `src/components/ProductItem.tsx`, `src/components/ProductList.tsx`
   - Tests: snapshot for `ProductItem` and `ProductList` render with sample data.

4. PR #4 — Inventory screen (Loja)
   - Files: `src/screens/InventoryScreen.tsx`, wire `ProductList` with `api.getInventory()`, add SearchInput and Add button.
   - Acceptance: load real API when token present or fallback to mocked data.

5. PR #5 — ProductDetail and Edit screens
   - Files: `src/screens/ProductDetailScreen.tsx`, `src/screens/ProductEditScreen.tsx`, `src/components/FlavorChipEditable.tsx`, `UnitPicker.tsx`
   - Acceptance: view product and edit/save flows call API.

6. PR #6 — Assets, theme polish, colors mapping
   - Add `mobile-react/assets/*`, finalize `theme.tsx` tokens to match Android resources.

7. PR #7 — Tests & CI
   - Add test coverage for critical components and a simple GitHub Actions workflow to run lint + tests.

Each PR should be small (1–4 files) and include a short checklist in PR description: UI match (screenshot), accessibility checks, tests, and types present.

---

## Acceptance criteria per screen

- Visual parity: text sizes, spacing and colors should be within 1–2px of Android designs where possible.
- Types: all API payloads and component props typed.
- Tests: at least one render/snapshot test per new component or screen.
- Behavior: search filters locally; product clicks navigate to detail.

---

## Next immediate step (if you approve)
- I will implement PR #2 (Types + API client + cred store) and then PR #3 (ProductItem + ProductList) so the Inventory screen can be wired quickly.

If you'd like a different order, tell me which PR to implement next. Otherwise I'll start with the API client (PR #2).
