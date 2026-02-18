# Project Status

- **Current Focus:** Monitoring Post-Deployment
- **Status:** Deployed (v2.1.0) - Running on Google VM.
- **Target:** Maintenance / Feedback

## Context

- **Project Name:** Spellcasters Bot
- **Type:** Discord Bot
- **Data Source:** [Spellcasters Community API v2](https://terribleturtle.github.io/spellcasters-community-api/api/v2/all_data.json)
- **Status:** Feature Complete
- **Hosting:** Google VM (e2-micro)
- **Recent Milestones:**
  - **Fixed:** Hero schema `movement_speed` crash.
  - **Enriched:** Embeds now show mechanics, difficulty, etc.
  - **Added:** `/hero`, `/list`, `/compare`, `/random`, `/about`, `/help`.
  - Added support for all entities (Heroes, Units, Spells, Titans, Consumables).
  - **Enhanced Embeds:** Added images and wiki links for all entities.
  - Optimized for low-memory environment (cached search).
  - Standardized deployment via `deploy.sh`.
  - **Modernized Codebase:** Configured ESLint 9 + Prettier.
  - **Legacy Code Removal:** Deprecated "Magic Strings" for game rules.
  - **Schema Hardening:** Implemented strict Python-based validation (`build_api.py`).
  - **Data Refactor:** Promoted features (Pierce, Cleave, Homing, Knockback, Interruption) to root properties and structured conditions.
  - **Fix:** Corrected `BalanceIndex` Zod schema/types to match canonical API fields (`patch_version`/`patch_date`).
  - **API Research (2026-02-17):** Audited all 12 API endpoints. Identified field gaps (consumable `buff_target`/`stack_size`, spell `duration`/`value`/`mechanics`, hero `movement_speed` mismatch). Schema volatile until Feb 26 EA launch.
  - **Changelog Removal (2026-02-18):** Removed `changelog` field from all entity schemas, types, and data. Patch handling now managed externally.
  - **Command Consolidation (2026-02-18):** Consolidated 11 commands into 7. Added `/patch` with static data. Enhanced `/about` with stats/latency/invite.
  - **Command Display Audit (2026-02-18):** Added null-safe embed fields (`safe()` helper), fixed `/search` cold-start timeout, improved `/compare` with Rank/School/Category, fixed `/list` footer stacking, truncated `/patch` changes to 1024 chars, added server count to `/about`, deleted 4 orphaned commands.
  - **Performance Optimization (2026-02-18):** Implemented O(1) HashMap lookup in `api.ts` to replace O(N) array search, significantly improving `findEntityByName` performance.
