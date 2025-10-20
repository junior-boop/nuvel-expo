import db from ".";
import type { Articles as ArticlesType } from "./db";

const Articles = db.createModel<ArticlesType>("articles", {
  id: "TEXT PRIMARY KEY NOT NULL",
  userid: "TEXT NOT NULL",
  imageurl: "TEXT",
  noteid: "TEXT NOT NULL",
  description: "TEXT NOT NULL",
  title: "TEXT NOT NULL",
  topic: "TEXT",
  appreciation: "TEXT NOT NULL UNIQUE",
  createdAt: "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
  updatedAt: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
});

export const createTable = async () => {
  await Articles.createTable();
};

export const created = async (data: ArticlesType) => {
  const result = await Articles.create({
    id: data.id,
    userid: data.userid,
    imageurl: data.imageurl,
    noteid: data.noteid,
    description: data.description,
    title: data.title,
    topic: data.topic,
    appreciation: data.appreciation,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  });

  return result;
};

export const getall = async () => {
  return await Articles.findAll({
    orderBy: { column: "updatedAt", direction: "DESC" },
  });
};

export const get = async (id: string) => {
  return await Articles.findById(id);
};

export const deleted = async (id: string) => {
  return await Articles.delete(id);
};
