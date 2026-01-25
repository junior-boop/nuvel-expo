import db from ".";
import { generateUUID as uuidv4 } from "./uuid";

export interface Sync_Metadata {
  id: string;
  key: string;
  value: string;
  updated_at: Date | string;
}

const SyncMetadata = db.createModel<Sync_Metadata>("sync_metadata", {
  id: "TEXT PRIMARY KEY NOT NULL",
  key: "TEXT NOT NULL UNIQUE",
  value: "TEXT NOT NULL",
  updated_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
});

export const createTable = async () => {
  await SyncMetadata.createTable();
};

/**
 * Définir une valeur de métadonnée
 */
export async function set(key: string, value: string) {
  try {
    // Chercher si la clé existe déjà
    const existing = await SyncMetadata.findOne({ where: { key } });

    if (existing) {
      // Mettre à jour
      return await SyncMetadata.update(existing.id, {
        value,
        updated_at: new Date().toISOString(),
      });
    } else {
      // Créer
      return await SyncMetadata.create({
        id: uuidv4(),
        key,
        value,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("[SyncMetadata] Erreur set:", error);
    return null;
  }
}

/**
 * Récupérer une valeur de métadonnée
 */
export async function get(key: string): Promise<string | null> {
  try {
    const result = await SyncMetadata.findOne({ where: { key } });
    return result ? result.value : null;
  } catch (error) {
    console.error("[SyncMetadata] Erreur get:", error);
    return null;
  }
}

/**
 * Supprimer une valeur de métadonnée
 */
export async function remove(key: string) {
  try {
    const existing = await SyncMetadata.findOne({ where: { key } });
    if (existing) {
      return await SyncMetadata.delete(existing.id);
    }
    return true;
  } catch (error) {
    console.error("[SyncMetadata] Erreur remove:", error);
    return false;
  }
}

/**
 * Obtenir toutes les métadonnées
 */
export async function getAll() {
  try {
    return await SyncMetadata.findAll();
  } catch (error) {
    console.error("[SyncMetadata] Erreur getAll:", error);
    return [];
  }
}
