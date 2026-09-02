import * as Groups from '@/Database/groups';
import * as Notes from '@/Database/notes';
import * as Session from '@/Database/session';
import * as Sync from '@/Database/sync_event';
import * as SyncState from '@/Database/sync_state';
import { isOnline } from '@/lib/network';
import { safeFetch } from '@/lib/safeFetch';
import { SyncableTable } from './db';


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


const serveur = "https://nuvelserver.godigital.workers.dev";

// Serialise toutes les operations de sync (pull/push) : plusieurs mutations locales
// declenchent chacune un syncToServer() en arriere-plan sans s'attendre entre elles,
// ce qui pouvait faire courir deux pullTable('groupes', ...) en parallele et dupliquer
// le travail d'upsert local. Une seule sync s'execute a la fois, les autres attendent leur tour.
let syncChain: Promise<unknown> = Promise.resolve();
const withSyncLock = <T,>(fn: () => Promise<T>): Promise<T> => {
  const run = syncChain.then(fn, fn);
  syncChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
};

export type SyncOutcome = {
  ok: boolean;
  skipped?: 'offline' | 'no_session' | 'server_down';
  pushed?: number;
  pulled?: number;
  error?: string;
};

const deletedata = async (table_name: string, id: string): Promise<boolean> => {
  const res = await safeFetch(serveur + "/" + table_name + "/" + id, {
    method: "DELETE",
    headers: { "Content-type": "application/json" },
  }, { parse: 'none' });
  // 404 = la ressource n'existe pas/plus cote serveur : DELETE idempotent → on considere succes.
  if (res.ok || res.status === 404) {
    if (!res.ok && __DEV__) console.log('[sync] delete', table_name, id, '404 (already gone) — treated as success');
    return true;
  }
  if (__DEV__) console.log('[sync] delete failed', table_name, id, res.error || res.status);
  return false;
};

/**
 * Pull versionne : pour chaque table syncable, recupere les rows dont
 * sync_state.version > maxKnownVersion local, applique au store local,
 * met a jour sync_state local via applyServerVersion.
 */
const pullTable = async (
  table: SyncableTable,
  session: { iduser: string }
): Promise<number> => {
  const since = await SyncState.getMaxKnownVersion(table);
  const url = serveur + "/sync-state/full?table=" + table + "&since=" + since + "&limit=200";
  const res = await safeFetch<{ rows: any[]; maxVersion: number }>(url);
  if (!res.ok || !res.data?.rows) {
    if (__DEV__) console.log('[sync] pull', table, 'failed', res.error || res.status);
    return 0;
  }
  let applied = 0;
  for (const row of res.data.rows) {
    const elementId = row.element_id as string;
    const serverVersion = row.version as number;
    const updatedAt = row.syncUpdatedAt as string;
    const updatedBy = row.updatedBy as string;
    const deleted = (row.deleted as 0 | 1) ?? 0;

    try {
      if (deleted === 1) {
        if (table === 'notes') await Notes.deleted(elementId);
        else if (table === 'groupes') await Groups.deleted(elementId);
      } else if (row.id) {
        // upsert local : strategie simple — delete + create. Le sync_state lui
        // arbitre le dirty bit, on n'ecrase pas une mutation locale plus recente.
        if (table === 'notes') {
          try { await Notes.deleted(elementId); } catch {}
          await Notes.created({
            id: row.id,
            body: row.body,
            html: row.html,
            grouped: row.grouped,
            creator: row.creator,
            archived: row.archived,
            pinned: row.pinned,
            created: row.created,
            modified: row.modified,
            version: row.version,
            publishId: row.publishId ?? null,
          } as any);
        } else if (table === 'groupes') {
          try { await Groups.deleted(elementId); } catch {}
          await Groups.created({
            id: row.id,
            name: row.name,
            created: row.created,
            modified: row.modified,
            userid: session.iduser,
          } as any);
        }
      }
      await SyncState.applyServerVersion(table, elementId, serverVersion, updatedAt, updatedBy, deleted);
      applied++;
    } catch (e) {
      if (__DEV__) console.log('[sync] pull row failed', table, elementId, e);
    }
  }
  if (__DEV__ && applied > 0) console.log('[sync] pulled', applied, table);
  return applied;
};

/**
 * Push versionne : pour chaque ligne sync_state.dirty=1, POST vers le serveur
 * avec _updatedAt + version. Si serveur gagne (LWW), adopte canonical localement.
 */
const pushDirty = async (session: { iduser: string }): Promise<number> => {
  const dirtyRows = await SyncState.getDirty();
  if (dirtyRows.length === 0) return 0;
  let pushed = 0;

  for (const row of dirtyRows) {
    const tableClient = row.table_name === 'groupes' ? 'groups' : row.table_name;
    const elementId = row.element_id;
    const url = serveur + '/' + tableClient + '/' + elementId;

    try {
      let payload: any = null;
      if (row.deleted === 1) {
        const ok = await deletedata(tableClient, elementId);
        if (ok) {
          await SyncState.markClean(row.table_name as SyncableTable, elementId, row.version);
          pushed++;
        } else {
          await SyncState.incrementPushAttempts(row.table_name as SyncableTable, elementId);
        }
        continue;
      }

      if (tableClient === 'notes') {
        const note = await Notes.get(elementId);
        if (!note) continue;
        payload = { ...note, _updatedAt: row.updatedAt };
      } else if (tableClient === 'groups') {
        const group = await Groups.get(elementId);
        if (!group) continue;
        payload = { ...group, userid: session.iduser, _updatedAt: row.updatedAt };
      } else {
        continue;
      }

      const res = await safeFetch<{ applied?: string; syncVersion?: number; currentVersion?: number; canonical?: any }>(
        url,
        {
          method: 'POST',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok || !res.data) {
        if (__DEV__) console.log('[sync] push failed', tableClient, elementId, res.error || res.status);
        await SyncState.incrementPushAttempts(row.table_name as SyncableTable, elementId);
        continue;
      }

      if (res.data.applied === 'server' && res.data.canonical) {
        // Serveur gagne : on adopte sa version
        const c = res.data.canonical;
        if (tableClient === 'notes') {
          try { await Notes.deleted(elementId); } catch {}
          await Notes.created({ ...c } as any);
        } else if (tableClient === 'groups') {
          try { await Groups.deleted(elementId); } catch {}
          await Groups.created({ ...c, userid: session.iduser } as any);
        }
        await SyncState.markClean(row.table_name as SyncableTable, elementId, res.data.currentVersion ?? row.version);
      } else {
        await SyncState.markClean(row.table_name as SyncableTable, elementId, res.data.syncVersion ?? row.version);
      }
      pushed++;
    } catch (e) {
      if (__DEV__) console.log('[sync] push exception', tableClient, elementId, e);
      await SyncState.incrementPushAttempts(row.table_name as SyncableTable, elementId);
    }
  }
  return pushed;
};

/**
 * Flow versionne : PULL d'abord (pour eviter d'ecraser une mise a jour serveur
 * plus recente), PUSH ensuite (LWW serveur tranche au cas par cas).
 */
const runPullThenPush = async (): Promise<SyncOutcome> => {
  if (!(await isOnline())) return { ok: false, skipped: 'offline' };
  const session = await Session.get();
  if (!session?.iduser) return { ok: false, skipped: 'no_session' };

  const health = await safeFetch(serveur + '/health', {}, { parse: 'none', timeoutMs: 4000 });
  if (!health.ok) return { ok: false, skipped: 'server_down' };

  let pulled = 0;
  pulled += await pullTable('notes', session as { iduser: string });
  pulled += await pullTable('groupes', session as { iduser: string });

  const pushed = await pushDirty(session as { iduser: string });

  if (__DEV__) console.log('[sync] pullThenPush done — pulled:', pulled, 'pushed:', pushed);
  return { ok: true, pulled, pushed };
};

export const pullThenPush = (): Promise<SyncOutcome> => withSyncLock(runPullThenPush);

/**
 * Entree principale — alias historique vers pullThenPush.
 * Toutes les mutations passent desormais par sync_state (dirty bit) ;
 * sync_event reste en audit log seul.
 */
export const Sync_to_serveur = pullThenPush;

const runFirstSync = async (): Promise<SyncOutcome> => {
  if (!(await isOnline())) {
    if (__DEV__) console.log('[sync] first_sync skipped: offline');
    return { ok: false, skipped: 'offline' };
  }

  const session = await Session.get();
  if (!session?.iduser) return { ok: false, skipped: 'no_session' };

  const check_sync = await Sync.getAll();
  const check_notes = await Notes.getall();
  const check_groups = await Groups.getall();

  let pulled = 0;

  const sync_note = await safeFetch<{ data: NotesType[] }>(
    serveur + "/notes/" + session.iduser
  );
  if (sync_note.ok && sync_note.data?.data && check_sync.length === 0 && check_notes.length === 0) {
    for (const note of sync_note.data.data) {
      try {
        // Garde-fou : si une note avec le meme id existe deja (retry, ancien run partiel),
        // on saute pour eviter le UNIQUE constraint failure.
        const existing = await Notes.get(note.id);
        if (existing) continue;
        await Notes.created({
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
          publishId: note.publishId,
        } as any);
        pulled++;
      } catch (e) {
        if (__DEV__) console.log('[sync] first_sync note insert failed', note.id, e);
      }
    }
  }

  const sync_group = await safeFetch<{ data: GroupsType[] }>(
    serveur + "/groups/" + session.iduser
  );
  if (sync_group.ok && sync_group.data?.data && check_sync.length === 0 && check_groups.length === 0) {
    for (const group of sync_group.data.data) {
      try {
        const existing = await Groups.get(group.id);
        if (existing) continue;
        await Groups.created({
          id: group.id,
          name: group.name,
          created: group.created,
          modified: group.modified,
        } as any);
        pulled++;
      } catch (e) {
        if (__DEV__) console.log('[sync] first_sync group insert failed', group.id, e);
      }
    }
  }

  if (__DEV__) console.log('[sync] first_sync done — pulled:', pulled);
  return { ok: true, pulled };
};

export const first_sync = (): Promise<SyncOutcome> => withSyncLock(runFirstSync);
