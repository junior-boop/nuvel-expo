import type { Notes as NotesType } from "./db";
import db from "./index";

const Notes = db.createModel<NotesType>("notes", {
  id: "TEXT PRIMARY KEY",
  body: "TEXT",
  html: "TEXT NULL",
  creator: "TEXT",
  pinned: "INTEGER",
  archived: "INTEGER",
  grouped: "TEXT NULL",
  created: "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
  modified: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
  publishId : "TEXT NULL",
  version: "INTEGER NOT NULL DEFAULT 1",
});

export const createdtable = async () => {
  await Notes.createTable();
};

export const created = async (data: NotesType) => {
  const items = Notes;

  const result = await items.create({
    id: data.id,
    body: data.body,
    html: data.html,
    grouped: data.grouped,
    creator: data.creator,
    archived: data.archived,
    pinned: data.pinned,
    created: data.created,
    modified: data.modified,
    version: data.version,
  });

  return result;
};

export const getall = async () => {
  const result = await Notes.findAll({
    orderBy: { column: "modified", direction: "DESC" },
  });
  return result;
};

export const get = async (id: string) => {
  const result = await Notes.findById(id);
  return result;
}

export const update = async (data: Partial<NotesType>) => {
  const items = Notes;
  const result = await items.update(data.id as string, {
    body: data.body,
    html: data.html,
    modified: new Date().toISOString(),
    version: data.version + 1 || 2,
  });
  return result;
};

export async function addtogroup(data: NotesType) {
  const items = Notes;

  return await items.update(data.id, {
    grouped: data.grouped,
    modified: new Date().toISOString(),
  });
}

export async function setarchived(data: NotesType) {
  const items = Notes;
  return await items.update(data.id as string, {
    archived: data.archived,
    modified: new Date().toISOString(),
  });
}

export const deleted = async (id: string) => {
  const items = Notes;
  const result = await items.delete(id);
  return result;
};

export const setpinned = async (data: NotesType) => {
  const items = Notes;
  return await items.update(data.id as string, {
    pinned: data.pinned,
    modified: new Date().toISOString(),
  });
};
