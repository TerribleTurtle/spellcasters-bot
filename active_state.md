# Project Status

- **Current Focus:** Deployment & Verification
- **Status:** Phase 1-5 Complete. Added `npm run pack` for deployment packaging.
- **Target:** Release v2.1.0

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
  - **Config:** Added `GUILD_ID` support for instant deploying.
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
