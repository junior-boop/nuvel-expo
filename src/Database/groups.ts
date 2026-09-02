import db from ".";
import type { Groups as GroupeType } from "./db";
import { generateUUID as uuidv4 } from "./uuid";

const Groups = db.createModel<GroupeType>("groups", {
  id: "TEXT PRIMARY KEY NOT NULL",
  name: "TEXT NOT NULL",
  created: "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
  modified: "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
});

export const createtable = async () => {
  await Groups.createTable();
};

export const getall = async () => {
  const items = Groups;

  return items.findAll({
    orderBy: { column: "modified", direction: "DESC" },
  });
};

export const get = async (id: string) => {
  const items = Groups;
  return await items.findById(id);
};

export const created = async (data: Partial<GroupeType>) => {
  const items = Groups;

  return await items.create({
    // Préserve l'id du serveur quand il est fourni (pull/first_sync), sinon en génère un nouveau (création locale).
    id: data.id ?? uuidv4(),
    name: data.name,
    created: data.created ?? new Date().toISOString(),
    modified: data.modified ?? new Date().toISOString(),
  });
};

export const updated = async (data: Partial<GroupeType>) => {
  const items = Groups;

  return await items.update(data.id as string, {
    name: data.name,
    modified: new Date().toISOString(),
  });
};

export const deleted = async (id: string) => {
  const items = Groups;

  return await items.delete(id);
};

export const deletedall = async () => {
  const allGroups = await getall();
  for (const group of allGroups) {
    await deleted(group.id);
  }
};
