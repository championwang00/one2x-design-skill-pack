---
name: one2x-design-stack
description: Unified One2X/Medeo design stack entry. Use for One2X design system work, Medeo UI implementation or review, Figma MCP writing, Figma variable binding, full-page Figma assembly, design tokens, typography, components, or animation. Routes the agent to the right sibling skills in order.
---

# One2X Design Stack

Use this as the default entry for One2X / Medeo design work. It is an orchestrator skill: read this file first, then load the required sibling skills before acting.

## Always Do First

1. Read `../../../design.md` from the skill pack root.
2. If the task touches implementation tokens, read `../../../tokens/README.md` from the skill pack root.
3. Pick the route below and load the listed skills in order.

Path resolution:

- If this skill is installed inside a project, `../../../design.md` means that project's root `design.md`.
- If this skill is loaded globally through a symlink under `~/.cursor/skills`, resolve the symlink target first and use the cloned skill pack root that contains `.cursor/skills/one2x-design-stack/`.
- If the target project also has its own `design.md` / `tokens/`, prefer the target project for implementation details and use the skill pack copy as the One2X baseline.

## Routes

### Code Implementation Or Review

Use when building, reviewing, fixing, or refactoring One2X / Medeo frontend UI.

Load:

1. `../one2x-design-system/SKILL.md`
2. `../web-animation-design/SKILL.md` when the task involves hover, transition, entrance/exit motion, easing, loading states, touch interaction, or `prefers-reduced-motion`.

Rules:

- When a Figma URL or selected Figma node is the implementation source, follow the mandatory Figma-to-code workflow in `one2x-design-system`; do not implement from the screenshot alone.
- Fetch both structured design context and a screenshot before editing code. Fetch variable definitions for token-sensitive work and inspect the target repository's existing components and tokens before creating anything.
- Build a short evidence map from Figma component/style/variable names to existing project components and `tokens.css` variables. Unmapped values are exceptions to resolve, not permission to hardcode.
- Use `tokens/tokens.css` names for color, typography, spacing, radius, and font family.
- Avoid naked hex, arbitrary `font-size`, arbitrary spacing, and non-token radius values.
- Use existing project components before creating new UI primitives.
- Validate the rendered result against the same Figma node at the target viewport before completion.

### Figma MCP Write Or Edit

Use when creating, editing, syncing, inspecting, or fixing Figma nodes, components, variables, styles, Auto Layout, or screenshots through MCP.

Load:

1. `../figma-use/SKILL.md`
2. `../one2x-figma-workflow/SKILL.md`
3. `../figma-generate-design/SKILL.md` only for full-page, screen, modal, drawer, panel, or multi-section assembly from code or description.
4. `../web-animation-design/SKILL.md` if motion or transition behavior is being designed.

Rules:

- Never call `use_figma` before loading `figma-use`.
- Reuse published One2X variables, text styles, and components. Do not create duplicate local `One2X · Color` or `Shape` collections in consumer files.
- Bind all `fills`, `strokes`, and text fills to published One2X `Color` variables. Low-emphasis strokes default to `Surface/On Surface Variant` at `0.5px`; use `Schemes/*` for primary, error, and other semantic roles; use palette variables only when no semantic variable exists.
- Bind `padding*` and `itemSpacing` to `Shape/Space/s*`.
- Bind `topLeftRadius`, `topRightRadius`, `bottomLeftRadius`, and `bottomRightRadius` to `Shape/Radius/*`.
- Any rounded element must keep a concentric relationship with adjacent inner/outer rounded elements: `inner radius = outer radius - gap/padding`.
- Set `cornerSmoothing = 0.6` for non-zero rounded nodes to match One2X's default corner-shape / superellipse rendering. If a component needs standard round corners instead, annotate `corner-shape: round`.
- After writing Figma components, run the Color and Shape binding checks from `one2x-figma-workflow`.

### Design Token Or Skill Pack Maintenance

Use when updating `design.md`, `tokens/`, skill docs, or the design skill pack itself.

Load:

1. `../one2x-design-system/SKILL.md`
2. `../one2x-figma-workflow/SKILL.md` if the change affects Figma variables, components, or MCP behavior.

Rules:

- Keep Figma naming and Web naming aligned: `Radius/*` maps to `--shape-radius-*`; `Space/s*` maps to `--space-s*`.
- `Space/s*` names are scale steps, not pixel values.
- Update README guidance when the recommended usage changes.

## Quick Trigger Phrases

These should route here:

- "use One2X design system"
- "Medeo UI"
- "One2X Figma"
- "write to Figma"
- "bind variables"
- "design token"
- "tool call UI"
- "make this follow One2X"

## Completion Checks

- For code: design context and screenshot were captured when Figma was the source; Figma variables/styles/components were mapped to project tokens/components; no naked color, spacing, radius, typography, or font tokens remain unless an explicit exception exists; the rendered result was visually compared with the reference.
- For Figma: required sibling skills were loaded before tool calls, DS variables/components were reused, Color bindings and Shape bindings were verified, and rounded nodes use One2X corner smoothing.
- For docs: installation and usage instructions still point users to this stack as the default entry.
