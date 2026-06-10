import db from ".";
import type { BibleMetadata as BibleMetadataType } from "./db";
import { generateUUID as uuidv4 } from "./uuid";

const BibleMetadata = db.createModel<BibleMetadataType>("BibleMetadata", {
  id: "TEXT PRIMARY KEY",
  name: "TEXT NOT NULL UNIQUE",
  shortname: "TEXT NOT NULL UNIQUE",
  module: "TEXT NOT NULL UNIQUE",
  year: "TEXT NOT NULL",
  description: "TEXT NOT NULL UNIQUE",
  lang: "TEXT NOT NULL",
  lang_short: "TEXT NOT NULL",
  copyright: "INT NOT NULL",
  copyright_statement: "TEXT NOT NULL",
  createdAt: "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
});

export const createTable = async () => {
  await BibleMetadata.createTable();
};

export const created = async (data: BibleMetadataType) => {
  const result = await BibleMetadata.create({
    id: uuidv4(),
    name: data.name,
    shortname: data.shortname,
    module: data.module,
    year: data.year,
    description: data.description,
    lang: data.lang,
    lang_short: data.lang_short,
    copyright: data.copyright,
    copyright_statement: data.copyright_statement,
    createdAt: new Date().toISOString(),
  });

  return result;
};

export const getall = async () => {
  return await BibleMetadata.findAll({
    orderBy: { column: "createdAt", direction: "DESC" },
  });
};

export const get = async (id: string) => {
  return await BibleMetadata.findById(id);
};

export const deleted = async (id: string) => {
  return await BibleMetadata.delete(id);
};
