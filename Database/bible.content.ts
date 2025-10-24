import db from ".";
import type { BibleVerse as BibleVerseType } from "./db";

const Bible = db.createModel<Partial<BibleVerseType>>("BibleContent", {
  id: "INTEGER PRIMARY KEY AUTOINCREMENT",
  book_id: "TEXT NOT NULL",
  book_name: "TEXT NOT NULL",
  book: "INTEGER NOT NULL",
  chapter: "INTEGER NOT NULL",
  verse: "INTEGER NOT NULL",
  text: "TEXT NOT NULL",
});

export const createTable = async () => {
  await Bible.createTable();
};

export const created = async (data: BibleVerseType) => {
  const result = await Bible.create({
    ...data,
  });

  return result;
};

export const getall = async () => {
  return await Bible.findAll();
};

export const get = async (id: string) => {
  return await Bible.findAll();
};

export const deleted = async (id: string) => {
  return await Bible.delete(id);
};
