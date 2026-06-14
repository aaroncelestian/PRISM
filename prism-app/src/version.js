export const APP_VERSION = "1.0.1";

// Bump COLLECTION_SCHEMA when the shape of a collection record changes.
// Old saved files will be migrated up via migrateCollectionRecord().
export const COLLECTION_SCHEMA = 1;

// Bump COMPS_SCHEMA when the shape of a research comp changes.
// Old saved files will be migrated up via migrateComp().
export const COMPS_SCHEMA = 1;
