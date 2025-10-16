import { v4 as uuidv4 } from "uuid";
import type { Notes as NotesType } from "./db";
import db from "./index";

const Notes = () => {
  const items = db.createModel<NotesType>("notes", {
    id: "TEXT PRIMARY KEY",
    body: "TEXT",
    html: "TEXT NULL",
    creator: "TEXT",
    pinned: "INTEGER",
    archived: "INTEGER",
    grouped: "TEXT NULL",
    created: "DATETIME DEFAULT CURRENT_TIMESTAMP",
    modified: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    version: "INT NOT NULL DEFAULT 1",
  });
  (async () => await items.createTable())();
  return items;
};

export const created = async (data: NotesType) => {
  const items = Notes();

  const result = await items.create({
    id: uuidv4(),
    body: data.body,
    html: data.html,
    grouped: data.grouped,
    creator: data.creator,
    archived: data.archived,
    pinned: data.pinned,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    version: 1,
  });

  return result;
};

export const getall = async () => {
  const items = Notes();
  const result = await items.findAll({
    orderBy: { column: "modified", direction: "DESC" },
  });
  return result;
};

export const update = async (data: Partial<NotesType>) => {
  const items = Notes();
  const result = await items.update(data.id as string, {
    body: data.body,
    html: data.html,
    modified: new Date().toISOString(),
    version: data.version + 1 || 2,
  });
  return result;
};

export async function setarchived(data: NotesType) {
  const items = Notes();
  return await items.update(data.id as string, {
    archived: data.archived,
    modified: new Date().toISOString(),
  });
}

export const deleted = async (id: string) => {
  const items = Notes();
  const result = await items.delete(id);
  return result;
};

export const setpinned = async (data: NotesType) => {
  const items = Notes();
  return await items.update(data.id as string, {
    pinned: data.pinned,
    modified: new Date().toISOString(),
  });
};
