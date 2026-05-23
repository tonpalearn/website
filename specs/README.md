# TONPALEARN · Spec Index

Specs for each subsystem of `tonpalearn.com`. Master overview spec = [`/SPEC.md`](../SPEC.md).

## Backoffice (Admin tools)

| Module | Spec | Status | Owner |
|--------|------|--------|-------|
| Billing + Accounting | [BACKOFFICE-billing.md](./BACKOFFICE-billing.md) | v0.x live · v1 TFRS-compliant in scope | ต้น |
| Certificate Generator | [BACKOFFICE-certificate.md](./BACKOFFICE-certificate.md) | v1 live (May 2026) | ต้น |
| Services Proposal Builder | [BACKOFFICE-services.md](./BACKOFFICE-services.md) | v1 = static page · v2 = proposal builder spec | ต้น |

## Frontoffice (Public)

| Module | Spec | Status | Owner |
|--------|------|--------|-------|
| Landing + Profile + Demos | [FRONTOFFICE.md](./FRONTOFFICE.md) | Landing v2 + chaiwat live · `/demos/` = new | ต้น |

## Spec format

Each spec follows: Problem → Goals → Non-Goals → User Stories → Requirements (P0/P1/P2) → Data Model → Success Metrics → Open Questions → Timeline → Action Checklist.

## Quick navigation

**By priority:**
- P0 must-have for next ship: see "Phase 1" in each spec
- Action items needing user decision: bottom checklist of each spec

**By dependency:**
- `BACKOFFICE-billing.md` is **foundation** — both certificate (enrollment link) and services (convert-to-quote) depend on its v1 schema landing
- `FRONTOFFICE/demos` is independent — can ship in parallel

## Change log
- 2026-05-23: Initial set of 4 specs created (billing, cert, services, frontoffice)
