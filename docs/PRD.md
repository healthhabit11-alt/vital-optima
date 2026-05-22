# VitalOptima PRD

Source of truth: `VitalOptima_PRD.md` on the maintainer desktop (v2.0, May 2026).

## MVP UI scope (this prototype)

| PRD module | Screen | Reference pattern |
|------------|--------|-------------------|
| Dashboard | `(tabs)/index` | Taco Bell home: header toggle, greeting, insight hero, carousel, CTA |
| Medications | `(tabs)/meds` | Taco Bell menu: search header, quick filters, horizontal due list, categories |
| Glucose | `(tabs)/glucose` | TheFork discover: tabs, trend chart, quick actions, hypo promo |
| Settings | `(tabs)/settings` | Profile + PRD settings: dark mode, export, delete |
| Dose detail | `medication/[id]` | Taco Bell PDP: hero, log CTA, customize rows, sticky bar |
| Visit report | `report` | TheFork booking slots: range picker, generate CTA |

## Not in this UI pass

- Onboarding, PIN auth, SQLite, notifications, hypo modal logic
- Nutrition v1.1, AI companion v1.2

Implementation must follow layer rules in the full PRD before shipping production code.
