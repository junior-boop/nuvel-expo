import db from ".";
import { SyncEvent, SyncableTable } from "./db";
import { generateUUID as uuidv4 } from "./uuid";
import * as SyncState from "./sync_state";

/**
 * Mapping nom client → nom serveur (table_name dans sync_state).
 * Le serveur utilise "groupes" (FR) là où le client utilise "groups".
 */
const toSyncableTable = (entityType: string): SyncableTable | null => {
  switch (entityType) {
    case "notes": return "notes";
    case "groups": return "groupes";
    case "articles": return "articles";
    case "publish": return "publish";
    case "comments": return "comments";
    case "appreciations": return "appreciations";
    default: return null;
  }
};

const sync_event = db.createModel<SyncEvent>("sync_event", {
  id: "TEXT PRIMARY KEY NOT NULL",
  userId: "TEXT NOT NULL",
  deviceId: "TEXT NULL",
  entityType: "TEXT NULL",
  entityId: "TEXT NULL",
  action: "TEXT NOT NULL",
  timestamp: "TEXT NOT NULL",
  synced: "INTEGER",
  created: "DATETIME DEFAULT CURRENT_TIMESTAMP",
});

/**
 * Créer la table sync_event avec le nouveau schéma
 * 
 * ⚠️ IMPORTANT: Si vous obtenez l'erreur "no such column: synced",
 * vous devez nettoyer les données de l'application :
 * - Sur Android : Paramètres > Apps > [Votre App] > Stockage > Effacer les données
 * - Sur iOS : Désinstaller et réinstaller l'app
 * 
 * Cela supprimera l'ancienne table et créera la nouvelle avec le bon schéma.
 */
export const createEvent = async () => {
  await sync_event.createTable();
  if (__DEV__) console.log("[SyncEvent] ✅ Table sync_event créée/initialisée");
};

export async function Set(data: Partial<SyncEvent>) {
  if (__DEV__) console.log("[SyncEvent] 💾 Setting sync event", data);
  if (!data.userId || !data.entityId) {
    if (__DEV__) console.log("[SyncEvent] skip: missing userId/entityId", data);
    return null;
  }
  const timestamp = data.timestamp || new Date().toISOString();
  const result = await sync_event.create({
    id: data.id || uuidv4(),
    userId: data.userId!,
    deviceId: data.deviceId!,
    entityType: data.entityType!,
    entityId: data.entityId!,
    action: data.action!,
    timestamp,
    synced: data.synced ?? 0,
    created: new Date().toISOString(),
  });

  // Hook Phase 3 : alimenter sync_state (dirty bit) en parallele du sync_event legacy.
  try {
    const table = toSyncableTable(String(data.entityType));
    if (table && data.entityId && data.userId) {
      if (data.action === "deleted") {
        await SyncState.markDirtyDeleted(table, data.entityId, data.userId, timestamp);
      } else {
        await SyncState.markDirty(table, data.entityId, data.userId, timestamp);
      }
    }
  } catch (e) {
    if (__DEV__) console.log("[SyncEvent] markDirty failed:", e);
  }

  return result;
}

export async function get(id: string) {
  return await sync_event.findById(id);
}

export async function getAll() {
  return await sync_event.findAll({
    orderBy: { column: "timestamp", direction: "DESC" },
    where: {
      synced: 0,
    },
  });
}

export async function getAllByUser(userId: string) {
  return await sync_event.findAll({
    orderBy: { column: "timestamp", direction: "DESC" },
    where: {
      userId: userId,
      synced: 0,
    },
  });
}

export async function markAsSynced(id: string) {
  return await sync_event.update(id, {
    synced: 1,
  });
}

export async function deleted(id: string) {
  return await sync_event.deleteWhere({ id: id });
}

export const deletedall = async () => {
  const allSyncEvents = await getAll();
  for (const syncEvent of allSyncEvents) {
    await deleted(syncEvent.id);
  }
};
