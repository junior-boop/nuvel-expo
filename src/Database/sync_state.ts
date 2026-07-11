import { orm } from ".";
import type { SyncStateRow, SyncableTable } from "./db";

/**
 * Table locale `sync_state` — miroir client de l'index de versions serveur.
 *
 * Schema :
 *  - (table_name, element_id) composite PK
 *  - version       : derniere version connue cote serveur (0 si jamais sync)
 *  - clientVersion : compteur local incremente a chaque mutation locale
 *  - updatedAt / updatedBy : marque de la derniere mutation locale
 *  - deleted       : 0/1 tombstone
 *  - dirty         : 0/1 — 1 = il faut pusher au prochain sync
 *
 * Hooks :
 *  - `markDirty(table, id, updatedBy)` apres chaque create/update local
 *  - `markDirtyDeleted(table, id, updatedBy)` apres chaque delete local
 *  - `markClean(table, id, serverVersion)` apres push reussi
 *  - `getDirty(table?)` liste les rows a pusher
 *  - `applyServerVersion(table, id, version, updatedAt, updatedBy, deleted)` apres pull
 */

export const createTable = async () => {
  await orm.run(
    `CREATE TABLE IF NOT EXISTS sync_state (
       table_name TEXT NOT NULL,
       element_id TEXT NOT NULL,
       version INTEGER NOT NULL DEFAULT 0,
       clientVersion INTEGER NOT NULL DEFAULT 0,
       updatedAt TEXT NOT NULL,
       updatedBy TEXT NOT NULL,
       deleted INTEGER NOT NULL DEFAULT 0,
       dirty INTEGER NOT NULL DEFAULT 0,
       PRIMARY KEY (table_name, element_id)
     )`
  );
  await orm.run(
    `CREATE INDEX IF NOT EXISTS idx_sync_state_dirty ON sync_state(dirty)`
  );
  await orm.run(
    `CREATE INDEX IF NOT EXISTS idx_sync_state_table ON sync_state(table_name)`
  );
  // Migration: ajout de pushAttempts pour stopper le spam apres N echecs.
  try {
    await orm.run(`ALTER TABLE sync_state ADD COLUMN pushAttempts INTEGER NOT NULL DEFAULT 0`);
  } catch {
    // colonne deja presente
  }
  if (__DEV__) console.log("[sync_state] table prete");
};

export const MAX_PUSH_ATTEMPTS = 5;

export const incrementPushAttempts = async (
  table: SyncableTable,
  elementId: string
) => {
  await orm.run(
    `UPDATE sync_state SET pushAttempts = COALESCE(pushAttempts, 0) + 1
     WHERE table_name = ? AND element_id = ?`,
    [table, elementId]
  );
};

export const resetPushAttempts = async (
  table: SyncableTable,
  elementId: string
) => {
  await orm.run(
    `UPDATE sync_state SET pushAttempts = 0
     WHERE table_name = ? AND element_id = ?`,
    [table, elementId]
  );
};

export const get = async (
  table: SyncableTable,
  elementId: string
): Promise<SyncStateRow | null> => {
  const rows = await orm.query<SyncStateRow>(
    `SELECT * FROM sync_state WHERE table_name = ? AND element_id = ?`,
    [table, elementId]
  );
  return rows[0] ?? null;
};

export const markDirty = async (
  table: SyncableTable,
  elementId: string,
  updatedBy: string,
  updatedAt: string = new Date().toISOString()
) => {
  await orm.run(
    `INSERT INTO sync_state (table_name, element_id, version, clientVersion, updatedAt, updatedBy, deleted, dirty, pushAttempts)
     VALUES (?, ?, 0, 1, ?, ?, 0, 1, 0)
     ON CONFLICT(table_name, element_id) DO UPDATE SET
       clientVersion = clientVersion + 1,
       updatedAt = excluded.updatedAt,
       updatedBy = excluded.updatedBy,
       deleted = 0,
       dirty = 1,
       pushAttempts = 0`,
    [table, elementId, updatedAt, updatedBy]
  );
};

export const markDirtyDeleted = async (
  table: SyncableTable,
  elementId: string,
  updatedBy: string,
  updatedAt: string = new Date().toISOString()
) => {
  await orm.run(
    `INSERT INTO sync_state (table_name, element_id, version, clientVersion, updatedAt, updatedBy, deleted, dirty, pushAttempts)
     VALUES (?, ?, 0, 1, ?, ?, 1, 1, 0)
     ON CONFLICT(table_name, element_id) DO UPDATE SET
       clientVersion = clientVersion + 1,
       updatedAt = excluded.updatedAt,
       updatedBy = excluded.updatedBy,
       deleted = 1,
       dirty = 1,
       pushAttempts = 0`,
    [table, elementId, updatedAt, updatedBy]
  );
};

export const markClean = async (
  table: SyncableTable,
  elementId: string,
  serverVersion: number
) => {
  await orm.run(
    `UPDATE sync_state SET dirty = 0, version = ?, pushAttempts = 0
     WHERE table_name = ? AND element_id = ?`,
    [serverVersion, table, elementId]
  );
};

/**
 * Applique l'etat serveur recu via pull. Ne touche pas `dirty` si la ligne
 * locale est plus recente (le client doit gagner et repush).
 */
export const applyServerVersion = async (
  table: SyncableTable,
  elementId: string,
  serverVersion: number,
  updatedAt: string,
  updatedBy: string,
  deleted: 0 | 1
) => {
  const existing = await get(table, elementId);
  if (existing && existing.dirty === 1 && existing.updatedAt > updatedAt) {
    // Mutation locale plus recente : on garde dirty=1, mais on note la version serveur connue.
    await orm.run(
      `UPDATE sync_state SET version = ? WHERE table_name = ? AND element_id = ?`,
      [serverVersion, table, elementId]
    );
    return;
  }
  await orm.run(
    `INSERT INTO sync_state (table_name, element_id, version, clientVersion, updatedAt, updatedBy, deleted, dirty)
     VALUES (?, ?, ?, 0, ?, ?, ?, 0)
     ON CONFLICT(table_name, element_id) DO UPDATE SET
       version = excluded.version,
       updatedAt = excluded.updatedAt,
       updatedBy = excluded.updatedBy,
       deleted = excluded.deleted,
       dirty = 0`,
    [table, elementId, serverVersion, updatedAt, updatedBy, deleted]
  );
};

export const getDirty = async (
  table?: SyncableTable
): Promise<SyncStateRow[]> => {
  if (table) {
    return await orm.query<SyncStateRow>(
      `SELECT * FROM sync_state WHERE dirty = 1 AND table_name = ? AND COALESCE(pushAttempts, 0) < ? ORDER BY updatedAt ASC`,
      [table, MAX_PUSH_ATTEMPTS]
    );
  }
  return await orm.query<SyncStateRow>(
    `SELECT * FROM sync_state WHERE dirty = 1 AND COALESCE(pushAttempts, 0) < ? ORDER BY updatedAt ASC`,
    [MAX_PUSH_ATTEMPTS]
  );
};

/**
 * Migration Phase 5 — Seed `sync_state` depuis les tables existantes (notes, groups)
 * pour les installs antérieures à Phase 3. Marque chaque row en `dirty=1` afin que
 * le prochain `pushDirty()` les remonte au serveur.
 *
 * Idempotent : ne touche pas les rows déjà présentes dans `sync_state` (ON CONFLICT DO NOTHING).
 * Sûr à appeler plusieurs fois ; protégé en amont par un flag `sync_state.seeded` dans `sync_metadata`.
 */
export const seedFromExisting = async (
  userId: string
): Promise<{ notes: number; groups: number }> => {
  const nowIso = new Date().toISOString();
  let notesCount = 0;
  let groupsCount = 0;

  try {
    const notes = await orm.query<{ id: string; modified: string; creator: string }>(
      `SELECT id, modified, creator FROM notes`
    );
    for (const n of notes) {
      const updatedAt = n.modified || nowIso;
      const updatedBy = n.creator || userId;
      const res = await orm.run(
        `INSERT INTO sync_state (table_name, element_id, version, clientVersion, updatedAt, updatedBy, deleted, dirty)
         VALUES ('notes', ?, 0, 1, ?, ?, 0, 1)
         ON CONFLICT(table_name, element_id) DO NOTHING`,
        [n.id, updatedAt, updatedBy]
      );
      if ((res as any)?.rowsAffected ?? (res as any)?.changes ?? 0) notesCount++;
    }
  } catch (e) {
    if (__DEV__) console.log("[sync_state] seed notes failed:", e);
  }

  try {
    const groups = await orm.query<{ id: string; modified: string }>(
      `SELECT id, modified FROM groups`
    );
    for (const g of groups) {
      const updatedAt = g.modified || nowIso;
      const res = await orm.run(
        `INSERT INTO sync_state (table_name, element_id, version, clientVersion, updatedAt, updatedBy, deleted, dirty)
         VALUES ('groupes', ?, 0, 1, ?, ?, 0, 1)
         ON CONFLICT(table_name, element_id) DO NOTHING`,
        [g.id, updatedAt, userId]
      );
      if ((res as any)?.rowsAffected ?? (res as any)?.changes ?? 0) groupsCount++;
    }
  } catch (e) {
    if (__DEV__) console.log("[sync_state] seed groups failed:", e);
  }

  if (__DEV__) console.log(`[sync_state] seeded: notes=${notesCount}, groups=${groupsCount}`);
  return { notes: notesCount, groups: groupsCount };
};

export const getMaxKnownVersion = async (
  table?: SyncableTable
): Promise<number> => {
  const rows = table
    ? await orm.query<{ v: number }>(
        `SELECT COALESCE(MAX(version), 0) as v FROM sync_state WHERE table_name = ?`,
        [table]
      )
    : await orm.query<{ v: number }>(
        `SELECT COALESCE(MAX(version), 0) as v FROM sync_state`
      );
  return rows[0]?.v ?? 0;
};
