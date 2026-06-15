# Selection-Driven Property Naming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild One2X Naming around the current Figma selection, add whole-set Component Property and Variant Value normalization, and derive instance names from overridden label text.

**Architecture:** Keep string normalization pure in `naming-core.mjs`, introduce a pure selection classifier and change planner, and isolate Figma reads/writes in an adapter. `code.js` becomes message orchestration while `ui.html` renders either empty-selection batch controls or selection-specific capability cards.

**Tech Stack:** Figma Plugin API, JavaScript ES modules bundled with esbuild, Node test runner, One2X CSS tokens.

---

### Task 1: Property, Value, And Instance Naming Rules

**Files:**
- Modify: `test/naming-core.test.mjs`
- Modify: `src/naming-core.mjs`

- [ ] Add failing tests for camelCase Property names, Boolean structure names, lower/camel Variant Values, yes/no normalization, Chinese/English label-driven instance names, duplicate component-type removal, and empty-label fallback.
- [ ] Run `npm test -- test/naming-core.test.mjs` and confirm the new exports or assertions fail.
- [ ] Implement `normalizePropertyName`, `normalizeVariantValue`, and `normalizeInstanceName` as pure functions.
- [ ] Run the focused test and confirm it passes.

### Task 2: Selection Context Classifier

**Files:**
- Create: `src/selection-context.mjs`
- Create: `test/selection-context.test.mjs`

- [ ] Add failing tests for empty selection, Section, standalone Component, Variant-to-Component-Set promotion, ordinary layer, mixed selection, and duplicate Component Set removal.
- [ ] Run the focused test and confirm missing-module failure.
- [ ] Implement `buildSelectionContext(models)` returning mode, categorized targets, capability counts, and stable target IDs.
- [ ] Run the focused test and confirm it passes.

### Task 3: Component Property And Variant Planner

**Files:**
- Create: `src/change-planner.mjs`
- Create: `test/change-planner.test.mjs`

- [ ] Add failing tests for Property rename proposals, Variant Value proposals, conflict warnings, disabled capabilities, and label-derived Instance proposals.
- [ ] Run the focused test and confirm missing-module failure.
- [ ] Implement proposal planning with `kind`, owner/target IDs, before/after, reason, and conflict metadata.
- [ ] Run the focused test and confirm it passes.

### Task 4: Figma Adapter And Rollback

**Files:**
- Create: `src/figma-adapter.js`
- Create: `test/figma-adapter.test.mjs`
- Modify: `src/code.js`

- [ ] Add fake-node tests proving full old Property keys are passed to `editComponentProperty`, Variant names are rebuilt, instance label sources are collected in priority order, and failed writes restore snapshots.
- [ ] Run the focused test and confirm missing-module failure.
- [ ] Implement node serialization, target promotion, Property/Value application, ordinary rename application, and undo/rollback snapshots.
- [ ] Replace direct scan/write logic in `code.js` with adapter and planner orchestration.
- [ ] Run adapter and full unit tests.

### Task 5: Dynamic Selection-Driven UI

**Files:**
- Modify: `src/ui.html`
- Modify: `README.md`

- [ ] Replace the fixed top form with empty-selection batch mode and selection-mode capability cards.
- [ ] Show Section, Component Property/Value, instance semantic naming, and internal-layer capabilities only when applicable.
- [ ] Support mixed-selection counts, per-capability checkboxes, warnings, and the existing editable proposal preview.
- [ ] Update README behavior and safety boundaries.

### Task 6: Verification

**Files:**
- Verify: `manifest.json`
- Verify: `dist/code.js`
- Verify: `dist/ui.html`

- [ ] Run `npm run check` and require zero failures.
- [ ] Validate manifest paths and unresolved build placeholders.
- [ ] Serve `dist/` locally and visually inspect 420 x 680 empty, Section, Component, and mixed-selection fixture states.
- [ ] Check browser console warnings/errors.
- [ ] Review `git diff --check` and summarize changed files.
