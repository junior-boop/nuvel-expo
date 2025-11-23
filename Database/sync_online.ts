import * as Groups from '@/Database/groups';
import * as Notes from '@/Database/notes';
import * as Session from '@/Database/session';
import * as Sync from '@/Database/sync_event';
import { orm } from '.';

const serveur = "https://nuvelserver.godigital.workers.dev"

const senddata = async (table_name : string , id : string) => {
  const data = table_name === "notes" ? await Notes.get(id)
  : table_name === "groups" ? await Groups.get(id) : null


  await fetch(serveur + "/" + table_name + "/" + id, {
    method : "POST",
    headers : {
      "Content-type" : "application/json"
    },
    body : JSON.stringify(data)
  })
} 

const deletedata = async (table_name : string , id : string) => {
  await fetch(serveur + "/" + table_name + "/" + id, {
    method : "DELETE",
    headers : {
      "Content-type" : "application/json"
    }
  })
}

const getOldRecords = (rows : Sync.Sync_Event[] ) => {
  // D'abord, trouver les derniers pour chaque clé
  const latestByKey = rows.reduce((acc, cur) => {
    const key = `${cur.elementid}_${cur.action}`;
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
      console.log('Aucune donnée à traiter');
      return 0;
    }

    // Garder seulement les dernières opérations par élément et action
    const latestOps = getOldRecords(rows);
    

    // IDs à garder
    const idsToKeep = latestOps.map(r => r.id);
    
    // Éviter la suppression si aucun ID à garder
    if (idsToKeep.length === 0) {
      console.log('Aucun élément à supprimer');
      return 0;
    }

    // Utiliser des paramètres pour éviter l'injection SQL
    const placeholders = idsToKeep.map(() => '?').join(',');
    const sql = `DELETE FROM sync_event WHERE id IN (${placeholders})`;
    
   const result = (await orm.run(sql, idsToKeep)).changes;
   console.log('Données sync supprimées avec succès', result)
   return result
  } catch (error) {
    console.error('Erreur lors de la suppression des données sync:', error);
    throw error;
  }
}

export const Sync_to_serveur = async () => {
  const session = await Session.get()
  const check = await fetch(serveur+"/health")
  const sync =await fetch(serveur + "/notes/sync/" + session?.iduser+'?lastupdate='+Date.now())
  const result = await sync.json()
  const allnotes = await Notes.getall()
  const allgroupes = await Groups.getall()

  
  deleteSyncData()
  const sync_event = await Sync.getAll()


  if(check.status === 200) {
    console.log("connecté")
    if(result.sync.length > 0) {
      for(let note of sync_event) {
        if(note.table_name === "notes"){
          if(note.action === "CREATE" || note.action === "UPDATE") {
            await senddata(note.table_name, note.elementid)
            await Sync.updated(note.id)
          }

          if(note.action === "DELETE"){
            await deletedata(note.table_name, note.elementid)
            await Sync.updated(note.id)
          }
        }

        if(note.table_name === "groups"){
          if(note.action === "CREATE" || note.action === "UPDATE") {
            await senddata(note.table_name, note.elementid)
            await Sync.updated(note.id)
          }

          if(note.action === "DELETE") {
            await deletedata(note.table_name, note.elementid)
            await Sync.updated(note.id)
          }
        
        }
          
      
      }
    } else {
      for(let note of allnotes){
        senddata("notes", note.id)
      }

      for(let groupe of allgroupes){
        senddata("groups", groupe.id)
      }
    }
  } else {
    console.log("deconneter")
  }

}