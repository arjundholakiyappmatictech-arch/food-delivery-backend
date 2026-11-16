# Project Directory Structure & Organization

---

## 1. Architectural Philosophy: Pragmatic & Lean

Our project adheres strictly to **Laravel's native directory structure**, augmented only by folders that serve our backend domain needs (`Services/`, `Mcp/`, and domain-grouped `Exceptions/`).

### Cardinal Rules:
1. **Forbidden Directories (Zero Bloat):** Strictly do NOT create `app/Repositories/`, `app/DTOs/` (or `app/Data/`), `app/Actions/`, or procedural `app/Helpers/`. Business logic belongs exclusively in flat domain services (`app/Services/`).
2. **Native Discoverability:** All files reside in predictable, standard locations so developers and AI agents navigate without deep folder searching.
3. **Consistency:** All new backend features must map directly into the canonical structure established below.

---

## 2. Standard Directory Map

The authoritative directory layout of our backend application:

```text
backend/
├── app/
│   ├── Console/                 # Custom Artisan commands
│   ├── Events/                  # Domain event classes (e.g. OrderPlaced, UserRegistered)
│   ├── Exceptions/              # Domain-grouped custom exceptions (extending native Exception)
│   │   ├── Address/             # (AddressLimitExceededException.php)
│   │   ├── Carts/               # (EmptyCartException.php, MenuItemUnavailableException.php)
│   │   ├── Deliveries/          # (DeliveryAgentAlreadyAssignedException.php)
│   │   ├── Mcp/                 # (OrderNotFoundException.php)
│   │   ├── Order/               # (OrderAlreadyCancelledException.php)
│   │   ├── Payment/             # (PaymentAlreadyExistsException.php)
│   │   ├── Restaurant/          # (DuplicateRestaurantException.php)
│   │   └── Reviews/             # (ReviewOnlyDeliveredOrderException.php)
│   ├── Http/
│   │   ├── Controllers/         # Thin HTTP Controllers (<15 lines, single handleException catch)
│   │   ├── Requests/            # Form Requests enforcing array validation rules
│   │   └── Resources/           # API Resources transforming models (ADR-001 envelope)
│   ├── Jobs/                    # Asynchronous Queue Jobs (dispatched with ->afterCommit())
│   ├── Listeners/               # Event Listeners
│   ├── Mail/                    # Mailable notification classes
│   ├── Mcp/                     # AI Model Context Protocol integration
│   │   ├── Resources/           # MCP resource transformers (RestaurantMenuResource.php)
│   │   ├── Servers/             # Native MCP server definitions (TomatoServer.php)
│   │   └── Tools/               # AI callable tools (GetOrderTool.php, SearchRestaurantsTool.php)
│   ├── Models/                  # Eloquent models with strict relation types & casts(): array
│   ├── Providers/               # Core bootstrap providers (AppServiceProvider.php)
│   └── Services/                # Pure domain business logic & transactions (strictly flat)
│
├── database/
│   ├── factories/               # Model factories for testing
│   ├── migrations/              # Database schema migrations (restrictOnDelete)
│   └── seeders/                 # Database seeders
│
└── routes/
    ├── api.php                  # Primary API route definitions (strict 2-verb model, /api/v1/)
    ├── ai.php                   # Authenticated MCP server endpoints (/mcp/tomato)
    ├── console.php              # Scheduled commands & console route closures
    └── web.php                  # Web fallback / health check endpoints
```

---

## 3. Specialized Placement Rules

For the responsibilities of standard HTTP, Model, and Resource layers, see [01-layer-responsibilities.md](01-layer-responsibilities.md). The rules below govern our organization-specific directories:

### `app/Services/` (Flat Domain Logic)
* **What goes here:** All domain business logic, fee calculations, multi-table transactions, and third-party SDK calls (e.g. `OrderService.php`, `PaymentService.php`, `RazorpayService.php`).
* **Rule:** Must remain a **strictly flat, single-level directory**. Never nest subdirectories inside `app/Services/`.

### `app/Exceptions/` (Domain-Grouped Exceptions)
* **What goes here:** Domain exceptions organized into subdirectories named after their business entity (`Order/`, `Payment/`, `Restaurant/`, `Address/`, `Carts/`).
* **Rule:** Every domain exception directly extends PHP's native `Exception` with predefined HTTP status codes via `parent::__construct(message: ..., code: ...)`.

### `app/Mcp/` (AI Tooling)
* **What goes here:** Native Laravel Model Context Protocol (MCP) server tools, endpoints, and resources that allow AI coding assistants to query and inspect backend records safely.
