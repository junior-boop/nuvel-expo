import db from ".";
import type { Groups as GroupeType } from "./db";
import { generateUUID as uuidv4 } from "./uuid";

const Groups = () => {
  const items = db.createModel<GroupeType>("groups", {
    id: "TEXT PRIMARY KEY NOT NULL",
    name: "TEXT NOT NULL",
    created: "DATETIME DEFAULT CURRENT_TIMESTAMP",
    modified: "DATETIME DEFAULT CURRENT_TIMESTAMP",
  });

  (async () => await items.createTable())();

  return items;
};

export const getall = async () => {
  const items = Groups();

  return items.findAll({
    orderBy: { column: "modified", direction: "DESC" },
  });
};

export const get = async (id: string) => {
  const items = Groups();
  return await items.findById(id);
};

export const created = async (data: Partial<GroupeType>) => {
  const items = Groups();

  console.log(data.name);

  return await items.create({
    id: uuidv4(),
    name: data.name,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
  });
};

export const updated = async (data: Partial<GroupeType>) => {
  const items = Groups();

  return await items.updateWhere(
    { id: data.id },
    { name: data.name, modified: new Date().toISOString() }
  );
};

export const deleted = async (id: string) => {
  const items = Groups();

  return await items.delete(id);
};
