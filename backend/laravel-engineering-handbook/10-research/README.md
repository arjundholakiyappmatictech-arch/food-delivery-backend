# Module 10: Research, Discovery Reports & ADRs

> Historical codebase audits, architectural discovery findings, and Architecture Decision Records (ADRs) that substantiate our global engineering guidelines.

---

## 1. Directory Contents

1. **[01 - Real-World Codebase Discovery Report (RES-001)](01-food-delivery-discovery.md):**
   * Empirical audit of the backend repository across 14 architectural dimensions.
   * Identifies friction points and technical debt that motivated our global guidelines.
   * Establishes the boundary between reusable company standards and application-specific domain logic.

2. **[ADR-001: Unified API Response Envelope Specification](adr/ADR-001-unified-api-response-envelope.md):**
   * Ratifies the canonical backend JSON response contract: `is_error`, `message`, `data`, `errors`, and `pagination`.
   * Enforces core invariants: `data: null` on error (strictly banning `[]`) and mandatory root `message` on all responses including 422 validation errors.

---

## 2. Research Traceability Matrix

| Finding ID | Research Area | Codified Company Standard | Canonical Specification |
| :--- | :--- | :--- | :--- |
| **RES-001 § 1** | Routing URIs & Verbs | Strict 2-verb model (`GET`/`POST`) with explicit CRUD suffixes | [03-api-engineering/01-routing-conventions.md](../03-api-engineering/01-routing-conventions.md) |
| **RES-001 § 2** | JSON Responses | ADR-001 Unified Response Envelope (`is_error: bool`, `data: null` on error) | [10-research/adr/ADR-001](adr/ADR-001-unified-api-response-envelope.md) |
| **RES-001 § 3** | Controller Exceptions | Single `catch (Throwable $e)` delegating to `handleException($e)` | [04-business-logic/02-exception-architecture.md](../04-business-logic/02-exception-architecture.md) |
| **RES-001 § 4** | Database Errors | Mask SQL details from clients; private server-side query logging | [04-business-logic/02-exception-architecture.md](../04-business-logic/02-exception-architecture.md) |
| **RES-001 § 5** | Validation Syntax | Mandatory array validation syntax in Form Requests | [03-api-engineering/02-form-requests-and-validation.md](../03-api-engineering/02-form-requests-and-validation.md) |
| **RES-001 § 6** | Relation Serialization | Guard all relationships in API Resources with `$this->whenLoaded()` | [03-api-engineering/03-api-resources.md](../03-api-engineering/03-api-resources.md) |
| **RES-001 § 7** | Service Coupling | Inject `User $user` explicitly; strictly ban `Auth::user()` in services | [04-business-logic/01-service-layer-design.md](../04-business-logic/01-service-layer-design.md) |
| **RES-001 § 8** | Transaction Latency | Call external HTTP APIs before opening `DB::transaction()` | [04-business-logic/01-service-layer-design.md](../04-business-logic/01-service-layer-design.md) |
| **RES-001 § 9** | Queue Race Conditions | Dispatch jobs inside transactions using `->afterCommit()` | [04-business-logic/01-service-layer-design.md](../04-business-logic/01-service-layer-design.md) |
| **RES-001 § 10** | Attribute Casting | Method-based `protected function casts(): array` with backed Enums | [05-database-engineering/README.md](../05-database-engineering/README.md) |
| **RES-001 § 11** | Foreign Key Safety | `restrictOnDelete()` on financial/ledger records; ban `cascadeOnDelete()` | [05-database-engineering/README.md](../05-database-engineering/README.md) |
| **RES-001 § 13** | AI MCP Integration | Custom MCP tools located in `app/Mcp/` | [02-application-architecture/03-directory-structure-and-organization.md](../02-application-architecture/03-directory-structure-and-organization.md) |
