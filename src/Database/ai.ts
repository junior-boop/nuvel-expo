import db from ".";
import type { AiHistoryType } from "./db";
import { generateUUID as uuidv4 } from "./uuid";

const AIhistory = db.createModel<AiHistoryType>("aihistory", {
  id: "TEXT PRIMARY KEY NOT NULL",
  iduser: "TEXT NOT NULL",
  role: "TEXT NOT NULL",
  content: "TEXT NOT NULL",
  created: "DATETIME DEFAULT CURRENT_TIMESTAMP",
  modified: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
});

export const createTable = async () => {
  await AIhistory.createTable();
};

export async function get(id: string): Promise<AiHistoryType[] | null | []> {
  try {
    const result = await AIhistory.findAll({
      where: { iduser: id },
    });
    if (!result) return [];
    return result;
  } catch (e) {
    return null;
  }
}

export async function set(
  data: Partial<AiHistoryType>
): Promise<AiHistoryType | null> {
  const history = await AIhistory.create({
    id: uuidv4() as string,
    iduser: data.iduser as string,
    role: data.role,
    content: data.content,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
  });

  return history;
}

export function deleted(id: string) {
  return AIhistory.delete(id);
}
