# Runbook: Manual Module Ingestion (Draft)

This project intentionally uses setup-time/manual ingestion rather than scheduled scraping.

## Intended Final Flow
1. Run scraper to generate normalized module data JSON.
2. Review output diff for unexpected changes.
3. Run seed/upsert into Supabase.
4. Verify module counts and random spot-checks in UI.

## Commands (To be finalized once scripts are implemented)
```bash
# 1) Generate module data
npm run ingest:modules

# 2) Seed database
npm run seed:modules

# 3) Validate
npm run validate:modules
```

## Validation Checklist
1. Year 1/2/3/4 modules present.
2. Year 4 includes all MEng specialism offerings.
3. Module code/title/leader fields are non-empty where source provides values.
4. No duplicate module codes.

## Rollback Strategy
1. Keep versioned JSON snapshots in repository.
2. Re-run seed with previous snapshot if a bad ingestion is detected.
