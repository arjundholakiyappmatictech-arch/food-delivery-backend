# Contributing to the Laravel Engineering Handbook

> **Guidelines for proposing, reviewing, and updating engineering standards across our Laravel applications.**

---

## 1. Principles of Standards Evolution

The standards in this handbook are living documents, but they must remain stable, battle-tested, and consistent.

When proposing a change:
1. **Prove with Real Code:** Do not propose theoretical patterns. Base proposals on actual project implementations, measurable benchmarks, or verified Laravel ecosystem updates.
2. **Explicit Trade-Offs:** Every architectural choice has trade-offs (e.g. simplicity vs abstraction, performance vs developer velocity). Document both pros and cons.
3. **Never Present Optional as Mandatory:** Distinguish between mandatory organizational rules and optional situational patterns.
4. **Preserve Backwards Compatibility:** Clearly indicate which PHP and Laravel framework versions support the standard.

---

## 2. Architecture Decision Records (ADRs)

Any significant change to our approved standards (e.g., adopting a new DTO library, altering the JSON response envelope, introducing modular monolith directories) must be proposed via an **Architecture Decision Record (ADR)**.

### ADR Format
Create a new file in `12-research/adr/` named `ADR-XXX-short-title.md` using this template:

```markdown
# ADR-XXX: Title of Decision

* **Status:** Proposed | Accepted | Deprecated | Superseded
* **Date:** YYYY-MM-DD
* **Author:** Name / Role
* **Deciders:** Engineering Lead, Backend Team

## 1. Context and Problem Statement
What technical problem or architectural tension are we addressing?

## 2. Considered Options
* Option 1: ...
* Option 2: ...
* Option 3: ...

## 3. Decision Outcome
Chosen option and justification.

### Positive Consequences
* ...

### Negative Consequences / Trade-offs
* ...

## 4. Pros and Cons of Options
Detailed comparison matrix.

## 5. Implementation & Migration Plan
How existing projects adopt this decision without breaking regressions.
```

---

## 3. Review & Approval Process

1. **Draft Proposal:** Create a branch or draft document with proposed changes.
2. **Peer Review:** Review by the Backend Engineering Lead and at least one Senior Backend Engineer.
3. **Verification:** Validate code snippets using Laravel Pint (`pint --test`) and PHPStan / Larastan.
4. **Merge & Version Bump:** Update `CHANGELOG.md` with a semantic version increment.
5. **Update AI Directives:** If the change alters core rules, update `GUIDELINES.md` and verify that Antigravity's global agent prompt reflects the new standard.

