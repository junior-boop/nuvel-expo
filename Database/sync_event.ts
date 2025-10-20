import db from ".";
import { generateUUID as uuidv4 } from "./uuid";

export interface Sync_Event {
  id: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  elementid: string;
  timestamp: Date | string;
  table_name: string;
  need_sync: boolean;
}

const sync_event = db.createModel<Sync_Event>("sync_event", {
  id: "TEXT PRIMARY KEY NOT NULL",
  action: "TEXT NOT NULL",
  elementid: "TEXT NOT NULL",
  need_sync: "BOOLEAN DEFAULT 0",
  table_name: "TEXT NOT NULL",
  timestamp: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
});

export const createEvent = async () => {
  await sync_event.createTable();
};

export async function Set(data: Sync_Event) {
  const result = await sync_event.create({
    id: uuidv4(),
    action: data.action || "CREATE",
    elementid: data.elementid,
    need_sync: data.need_sync,
    table_name: data.table_name,
    timestamp: new Date().toISOString(),
  });

  return result;
}

export async function get(id: string) {
  return await sync_event.findById(id);
}

export async function getAll() {
  return await sync_event.findAll({
    orderBy: { column: "timestamp", direction: "DESC" },
    where: {
      need_sync: true,
    },
  });
}

export async function updated(id: string) {
  return await sync_event.update(id, {
    need_sync: false,
  });
}

export async function deleted(id: string) {
  return await sync_event.deleteWhere({ id: id });
}
