# Chapter 02.3: Project Directory Structure & Organization

> **Module:** `02-application-architecture`  
> **Classification:** Approved Engineering Standard (Our Organization)  
> **Status:** Active  

---

## 1. Architectural Philosophy: Pragmatic & Lean

Our project adheres strictly to **Laravel's native structure**, augmented only by directories that genuinely serve our backend domain needs (`Services/`, `Mcp/`, and domain-grouped `Exceptions/`).

### Cardinal Rules:
1. **No Artificial Bloat:** We do **not** use unnecessary architectural layers such as `Repositories/`, `DTOs/`, `ValueObjects/`, or heavy `Domain/` modular monolith directories.
2. **Native Discoverability:** All files reside in predictable, standard locations so developers and AI assistants can navigate without searching through deep folder trees.
3. **Consistency:** All new backend features must map into the existing directories established below.

---

## 2. Standard Directory Map

Below is the authoritative directory layout of our backend application:

```text
backend/
├── app/
│   ├── Console/                 # Custom Artisan commands
│   │
│   ├── Events/                  # Domain event classes (e.g. OrderPlaced, UserRegistered)
│   │
│   ├── Exceptions/              # Domain-grouped custom exceptions
│   │   ├── AppException.php     # Base exception enforcing getStatusCode()
│   │   ├── Address/             # (AddressLimitExceededException.php)
│   │   ├── Carts/               # (EmptyCartException.php, MenuItemUnavailableException.php)
│   │   ├── Deliveries/          # (DeliveryAgentAlreadyAssignedException.php)
│   │   ├── Mcp/                 # (OrderNotFoundException.php)
│   │   ├── Order/               # (OrderAlreadyCancelledException.php)
│   │   ├── Payment/             # (PaymentAlreadyExistsException.php)
│   │   ├── Restaurant/          # (DuplicateRestaurantException.php)
│   │   └── Reviews/             # (ReviewOnlyDeliveredOrderException.php)
│   │
│   ├── Http/
│   │   ├── Controllers/         # Thin HTTP Controllers (OrderController.php, PaymentController.php)
│   │   ├── Requests/            # Form Requests enforcing array validation rules (StoreAddressRequest.php)
│   │   └── Resources/           # API Resources transforming models (OrderResource.php, AddressResource.php)
│   │
│   ├── Jobs/                    # Asynchronous Queue Jobs (AssignDeliveryJob.php, SendWelcomeEmailJob.php)
│   │
│   ├── Listeners/               # Event Listeners (SendWelcomeEmailListener.php)
│   │
│   ├── Mail/                    # Mailable notification classes
│   │
│   ├── Mcp/                     # AI Model Context Protocol integration
│   │   ├── Resources/           # MCP resource transformers (RestaurantMenuResource.php)
│   │   ├── Servers/             # Native MCP server definitions (TomatoServer.php)
│   │   └── Tools/               # AI callable tools (GetOrderTool.php, SearchRestaurantsTool.php)
│   │
│   ├── Models/                  # Eloquent models with strict relation types & casts (Order.php, Payment.php)
│   │
│   ├── Providers/               # Core bootstrap providers (AppServiceProvider.php)
│   │
│   └── Services/                # Pure domain business logic & transactions (OrderService.php, PaymentService.php)
│
├── database/
│   ├── factories/               # Model factories for testing
│   ├── migrations/              # Reversible database schema migrations
│   └── seeders/                 # Database seeders
│
└── routes/
    ├── api.php                  # Primary API route definitions (grouped under /api/v1/)
    ├── ai.php                   # Authenticated MCP server endpoints (/mcp/tomato)
    ├── console.php              # Scheduled commands & console route closures
    └── web.php                  # Web fallback / health check endpoints
```

---

## 3. Directory Purpose & Placement Rules

### `app/Services/` (Business Logic)
* **What goes here:** All domain business logic, fee calculations, multi-table transactions, and third-party SDK calls (e.g. `OrderService.php`, `PaymentService.php`, `RazorpayService.php`).
* **Rule:** Kept as a flat, single-level directory. Never nest deep subdirectories unless a domain has multiple dedicated driver strategies (e.g. `Services/Payments/`).

### `app/Exceptions/` (Domain-Grouped Exceptions)
* **What goes here:** All domain exceptions organized into subdirectories named after their business entity (`Order/`, `Payment/`, `Restaurant/`, `Address/`, `Carts/`).
* **Rule:** Every domain exception must inherit from base `AppException`.

### `app/Http/Controllers/` (Thin HTTP Dispatchers)
* **What goes here:** Controllers coordinating requests and responses (`OrderController.php`).
* **Rule:** Controllers must not contain SQL queries, transaction blocks, or business calculations.

### `app/Http/Requests/` (Form Requests)
* **What goes here:** Input validation and authorization classes (`StoreAddressRequest.php`, `VerifyPaymentRequest.php`).
* **Rule:** Always use array validation syntax. Extract validated data via `$request->validated()`.

### `app/Http/Resources/` (API Resources)
* **What goes here:** JSON transformers (`OrderResource.php`, `UserResource.php`).
* **Rule:** Guard all relationship transformations with `$this->whenLoaded()`.

### `app/Models/` (Eloquent Models)
* **What goes here:** Data persistence classes (`Order.php`, `Payment.php`, `User.php`).
* **Rule:** Always declare explicit relationship return types (`BelongsTo`, `HasMany`) and method-based `protected function casts(): array`.

### `app/Mcp/` (AI Tooling)
* **What goes here:** Native Laravel MCP server tools and endpoints that allow AI coding assistants to query backend records safely.

---

## 4. Forbidden Architectural Anti-Patterns

1. **❌ Creating Repositories:** Do not create `app/Repositories/`. Eloquent already is an Active Record ORM; wrapping it in generic repository interfaces adds file-jumping without value.
2. **❌ Creating DTO Folders:** Do not create `app/DTOs/` or `app/Data/` unless explicitly required by an approved team ADR. Use validated Form Request arrays or Eloquent models.
3. **❌ Creating Helpers:** Do not create procedural helper files (`app/Helpers/functions.php`). Logic belongs in designated Services or Models.

