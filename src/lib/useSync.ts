import { Groups as GroupsType, Notes as NotesType, SyncEvent } from '@/Database/db';
import * as Groups from '@/Database/groups';
import * as Notes from '@/Database/notes';
import * as SyncEventDB from '@/Database/sync_event';
import * as SyncMetadata from '@/Database/sync_metadata';
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'device_id';
const LAST_SYNC_KEY = 'last_sync_timestamp';

interface SyncResult {
    success: boolean;
    conflicts?: any[];
    error?: any;
}

interface SyncChange {
    id: string;
    entityType: 'note' | 'group';
    entityId: string;
    action: 'created' | 'updated' | 'deleted';
    data: any;
    timestamp: string;
}

/**
 * Hook de synchronisation avec le serveur
 * 
 * Utilise SQLite pour stocker les métadonnées de sync (device_id, last_sync)
 * et la table sync_event pour gérer les changements locaux
 * 
 * @param apiBase - URL de base de l'API
 * @param userId - ID de l'utilisateur courant
 * 
 * @example
 * const { sync, syncing, lastSync, queueChange } = useSync('https://api.example.com', 'user_123');
 * 
 * // Synchroniser
 * await sync();
 * 
 * // Ajouter un changement à la queue
 * await queueChange({
 *   id: 'sync_event_123',
 *   entityType: 'note',
 *   entityId: 'note_123',
 *   action: 'created',
 *   data: noteData,
 *   timestamp: new Date().toISOString()
 * });
 */
export const useSync = (
    apiBase: string = 'https://nuvelserver.godigital.workers.dev',
    userId: string
) => {
    const [syncing, setSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);

    /**
     * Obtenir ou créer device ID (stocké dans SQLite)
     */
    const getDeviceId = useCallback(async (): Promise<string> => {
        let deviceId = await SyncMetadata.get(DEVICE_ID_KEY);
        if (!deviceId) {
            deviceId = uuidv4();
            await SyncMetadata.set(DEVICE_ID_KEY, deviceId);
            if (__DEV__) console.log('[Sync] 🆔 Nouveau device ID créé:', deviceId);
        }
        return deviceId;
    }, []);

    /**
     * Ajouter un changement à la queue de synchronisation
     * Utilise la table sync_event avec le nouveau format
     */
    const queueChange = useCallback(async (change: SyncChange) => {
        try {
            const deviceId = await getDeviceId();
            
            const syncEvent: Partial<SyncEvent> = {
                id: uuidv4(),
                userId: userId,
                deviceId: deviceId,
                entityType: change.entityType,
                entityId: change.entityId,
                action: change.action,
                data: JSON.stringify(change.data), // Stocker en JSON string
                timestamp: change.timestamp,
                synced: 0, // Pas encore synchronisé
                created: new Date().toISOString(),
            };

            await SyncEventDB.Set(syncEvent);
            if (__DEV__) console.log('[Sync] ✅ Changement ajouté à la queue:', change.entityType, change.action);
        } catch (error) {
            console.error('[Sync] ❌ Erreur ajout à la queue:', error);
        }
    }, [userId, getDeviceId]);

    /**
     * Récupérer tous les changements en attente pour cet utilisateur
     */
    const getPendingChanges = useCallback(async (): Promise<SyncChange[]> => {
        try {
            const pendingEvents = await SyncEventDB.getAllByUser(userId);
            const changes: SyncChange[] = [];

            for (const event of pendingEvents) {
                if (event.synced === 1) continue; // Déjà synchronisé

                let data = null;

                // Parser les données JSON
                try {
                    data = JSON.parse(event.data);
                } catch (e) {
                    console.error('[Sync] Erreur parsing data:', e);
                    continue;
                }

                changes.push({
                    id: event.id,
                    entityType: event.entityType,
                    entityId: event.entityId,
                    action: event.action,
                    data: data,
                    timestamp: event.timestamp,
                });
            }

            return changes;
        } catch (error) {
            console.error('[Sync] ❌ Erreur récupération changes:', error);
            return [];
        }
    }, [userId]);

    /**
     * Synchroniser avec le serveur
     */
    const sync = useCallback(async (): Promise<SyncResult> => {
        try {
            setSyncing(true);
            if (__DEV__) console.log('[Sync] 🔄 Début de la synchronisation...');

            const deviceId = await getDeviceId();
            const lastSyncTimestamp = await SyncMetadata.get(LAST_SYNC_KEY);
            const changes = await getPendingChanges();

            if (__DEV__) console.log('[Sync] 📦 Changements à envoyer:', changes.length);

            // Envoyer les changements au serveur
            const response = await fetch(`${apiBase}/sync/push`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    deviceId,
                    lastSyncTimestamp,
                    changes,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                if (__DEV__) console.log('[Sync] ✅ Synchronisation réussie');

                // Marquer les changements comme synchronisés
                const pendingEvents = await SyncEventDB.getAllByUser(userId);
                for (const event of pendingEvents) {
                    if (event.synced === 0) {
                        await SyncEventDB.markAsSynced(event.id);
                    }
                }

                // Mettre à jour le dernier timestamp de sync dans SQLite
                const now = new Date().toISOString();
                await SyncMetadata.set(LAST_SYNC_KEY, now);
                setLastSync(now);

                // Appliquer les changements du serveur
                if (result.serverChanges && result.serverChanges.length > 0) {
                    if (__DEV__) console.log('[Sync] 📥 Changements serveur à appliquer:', result.serverChanges.length);
                    for (const change of result.serverChanges) {
                        await applyServerChange(change);
                    }
                }

                return {
                    success: true,
                    conflicts: result.conflicts || [],
                };
            }

            return { success: false };

        } catch (error) {
            console.error('[Sync] ❌ Erreur de synchronisation:', error);
            return { success: false, error };
        } finally {
            setSyncing(false);
        }
    }, [apiBase, userId, getDeviceId, getPendingChanges]);

    /**
     * Appliquer un changement du serveur localement
     */
    const applyServerChange = useCallback(async (change: SyncChange) => {
        try {
            if (__DEV__) console.log('[Sync] 📥 Application changement serveur:', change.entityType, change.action);

            if (change.entityType === 'note') {
                if (change.action === 'created' || change.action === 'updated') {
                    await Notes.created(change.data as NotesType);
                } else if (change.action === 'deleted') {
                    await Notes.deleted(change.entityId);
                }
            } else if (change.entityType === 'group') {
                if (change.action === 'created' || change.action === 'updated') {
                    await Groups.created(change.data as GroupsType);
                } else if (change.action === 'deleted') {
                    await Groups.deleted(change.entityId);
                }
            }

            if (__DEV__) console.log('[Sync] ✅ Changement appliqué:', change.entityId);
        } catch (error) {
            console.error('[Sync] ❌ Erreur application changement:', error);
        }
    }, []);

    /**
     * Charger le dernier timestamp de sync au montage (depuis SQLite)
     */
    useEffect(() => {
        const loadLastSync = async () => {
            const timestamp = await SyncMetadata.get(LAST_SYNC_KEY);
            if (timestamp) {
                setLastSync(timestamp);
            }
        };
        loadLastSync();
    }, []);

    return {
        sync,
        queueChange,
        syncing,
        lastSync,
        getDeviceId,
        getPendingChanges,
    };
};
