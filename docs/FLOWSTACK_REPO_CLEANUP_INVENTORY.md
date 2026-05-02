# FlowStack Repo Cleanup Inventory

Created: 2026-05-02

Purpose: identify stale or legacy artifacts before removal. This document is an approval checklist, not a deletion script.

## Cleanup Rules

- Do not delete files without explicit approval.
- Do not remove user work in progress.
- Do not remove generated folders that are required to run the local app.
- Prefer moving useful historical notes into `docs/archive/` before deletion.
- Keep product docs that describe the current audit-first FlowStack direction.

## Likely Generated Runtime Artifacts

| Path | Why It Looks Generated | Recommended Action |
|---|---|---|
| `.ralph-loop/vite-output.txt` | Validation output file | Ignore in git or regenerate only during validation |
| `dist/` | Vite build output | Do not commit; safe to regenerate |
| `node_modules/` | Package install output | Do not commit; keep locally |
| `build_output.txt` | Old captured build output | Archive or delete after approval |

## Likely Legacy Reports

| Path | Current Risk | Recommended Action |
|---|---|---|
| `AUDIT_REPORT.md` | May describe old audit meaning | Review, then archive if stale |
| `DATABASE_COMPLETION_REPORT.md` | Historical implementation report | Move to `docs/archive/` if still useful |
| `REPUTATION_MODULE_IMPLEMENTATION_REPORT.md` | Historical module report | Move to `docs/archive/` if still useful |
| `UNTITLED_UI_INTEGRATION_REPORT.md` | Historical UI integration report | Move to `docs/archive/` if still useful |
| `WORKFLOW_ARCHITECTURE.md` | May still contain useful architecture | Review before moving |
| `WORKFLOW_IMPLEMENTATION_REPORT.md` | Historical implementation report | Move to `docs/archive/` if stale |
| `WORKFLOW_QUICK_REFERENCE.md` | Could still be useful | Review before moving |
| `WORKFLOW_SYSTEM.md` | Could still be useful | Review before moving |
| `WORKFLOWS_EDITOR_REPORT.md` | Historical implementation report | Move to `docs/archive/` if stale |

## Likely Temporary Source Imports

| Path | Current Risk | Recommended Action |
|---|---|---|
| `temp-untitledui-starter/` | Large copied starter may pollute lint/build context | Confirm no imports depend on it, then delete after approval |

## Scanner Cleanup Candidates

| Path | Current Risk | Recommended Action |
|---|---|---|
| `src/lib/scanner/patterns.ts` | Tool/language-first naming leaks old positioning | Keep, but make secondary to structure snapshot |
| `supabase/functions/scan-project/index.ts` | Duplicates scanner pattern logic and hides dot folders from root summary | Refactor, then later dedupe pattern definitions |

## Approval Checklist

- [ ] Confirm which legacy reports remain useful.
- [ ] Confirm whether `temp-untitledui-starter/` is still needed.
- [ ] Confirm whether root-level reports should move to `docs/archive/`.
- [ ] Add `.ralph-loop/vite-output.txt`, `build_output.txt`, `dist/`, and temp folders to `.gitignore` if they are not intentionally tracked.
- [ ] Run `npm run web:build` after any deletion or archive move.
