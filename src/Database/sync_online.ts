import * as Groups from '@/Database/groups';
import * as Notes from '@/Database/notes';
import * as Session from '@/Database/session';
import * as Sync from '@/Database/sync_event';
import { orm } from '.';
import { SyncEvent } from './db';


type NotesType = {
  id: string;
  body: string;
  creator: string;
  pinned: 0 | 1;
  archived: 0 | 1;
  grouped: string | null;
  html: string;
  created: Date;
  modified: Date;
  clientversion: number;
  lastSyncUpdate: string | Date;
  version: number;
  publishId: string | null;
};

type GroupsType = {
  id: string;
  name: string;
  userid: string;
  created: Date;
  modified: Date;
  lastSyncUpdate: string | Date;
  version: number;
};


const serveur = "https://nuvelserver.godigital.workers.dev"

const senddata = async (table_name: string, id: string) => {
  const data = table_name === "notes" ? await Notes.get(id)
    : table_name === "groups" ? { ...(await Groups.get(id)), userid: (await Session.get())?.iduser } : null

  if (__DEV__) console.log(table_name, id)

  try {
    const req = await fetch(serveur + "/" + table_name + "/" + id, {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify(data)


    })
    if (table_name === 'groups') {
      if (__DEV__) console.log("groups : ", await req.text())
    }
    await req.text()
  } catch (error) {
    if (__DEV__) console.log(error)
  } finally {
    if (__DEV__) console.log("updated done!")
  }

}

const deletedata = async (table_name: string, id: string) => {
  await fetch(serveur + "/" + table_name + "/" + id, {
    method: "DELETE",
    headers: {
      "Content-type": "application/json"
    }
  })
}

const getOldRecords = (rows: SyncEvent[]) => {
  // D'abord, trouver les derniers pour chaque clé
  const latestByKey = rows.reduce((acc, cur) => {
    const key = `${cur.entityId}_${cur.action}`;
    if (!acc[key] || new Date(cur.timestamp) > new Date(acc[key].timestamp)) {
      acc[key] = cur;
    }
    return acc;
  }, {});

  // Ensuite, filtrer pour garder seulement les anciens
  const latestIds = Object.values(latestByKey).map(row => row.id);
  const oldRecords = rows.filter(row => !latestIds.includes(row.id));

  return oldRecords;
};

const deleteSyncData = async () => {
  try {
    const rows = await Sync.getAll();

    // Vérifier qu'on a des données
    if (!rows || rows.length === 0) {
      if (__DEV__) console.log('Aucune donnée à traiter');
      return 0;
    }

    // Garder seulement les dernières opérations par élément et action
    const latestOps = getOldRecords(rows);


    // IDs à garder
    const idsToKeep = latestOps.map(r => r.id);

    // Éviter la suppression si aucun ID à garder
    if (idsToKeep.length === 0) {
      if (__DEV__) console.log('Aucun élément à supprimer');
      return 0;
    }

    // Utiliser des paramètres pour éviter l'injection SQL
    const placeholders = idsToKeep.map(() => '?').join(',');
    const sql = `DELETE FROM sync_event WHERE id IN (${placeholders})`;

    const result = (await orm.run(sql, idsToKeep)).changes;
    if (__DEV__) console.log('Données sync supprimées avec succès', result)
    return result
  } catch (error) {
    console.error('Erreur lors de la suppression des données sync:', error);
    throw error;
  }
}

export const Sync_to_serveur = async () => {
  const session = await Session.get()
  const check = await fetch(serveur + "/health")
  const sync = await fetch(serveur + "/notes/sync/" + session?.iduser + '?lastupdate=' + Date.now())
  const result = await sync.json()
  const allnotes = await Notes.getall()
  const allgroupes = await Groups.getall()

  deleteSyncData()
  const sync_event = await Sync.getAll()

  if (check.status === 200) {
    if (result.data.length > 0) {
      for (let note of sync_event) {
        if (note.entityType === "notes") {
          if (note.action === "created" || note.action === "updated") {
            await senddata(note.entityType, note.entityId)
            await Sync.markAsSynced(note.id)
          }

          if (note.action === "deleted") {
            await deletedata(note.entityType, note.entityId)
            await Sync.markAsSynced(note.id)
          }
        }

        if (note.entityType === "groups") {
          if (note.action === "created" || note.action === "updated") {
            await senddata(note.entityType, note.entityId)
            await Sync.markAsSynced(note.id)
          }

          if (note.action === "deleted") {
            await deletedata(note.entityType, note.entityId)
            await Sync.markAsSynced(note.id)
          }

        }


      }
    } else if (result.data.length === 0) {
      for (let note of allnotes) {
        senddata("notes", note.id)
      }

      for (let groupe of allgroupes) {
        senddata("groups", groupe.id)
      }
    }
  } else {
    if (__DEV__) console.log("deconneter")
  }

}

export const first_sync = async () => {
  const check_sync = await Sync.getAll()
  const check_notes = await Notes.getall()
  const check_groups = await Groups.getall()
  const session = await Session.get()

  // note sync
  const sync_note = await fetch(serveur + "/notes/" + session?.iduser)
  const result_note = await sync_note.json() as { data: NotesType[] }

  if (check_sync.length === 0 && check_notes.length === 0) {
    for (let note of result_note.data) {
      const n = await Notes.created({
        id: note.id,
        body: note.body,
        html: note.html,
        creator: note.creator,
        pinned: note.pinned,
        archived: note.archived,
        grouped: note.grouped,
        created: note.created,
        modified: note.modified,
        version: note.clientversion,
        publishId: note.publishId
      })
    }
  }

  // group sync
  const sync_group = await fetch(serveur + "/groups/" + session?.iduser)
  const result_group = await sync_group.json() as { data: GroupsType[] }

  if (check_sync.length === 0 && check_groups.length === 0) {
    for (let group of result_group.data) {
      const g = await Groups.created({
        id: group.id,
        name: group.name,
        created: group.created,
        modified: group.modified,
      })
    }
  }
}