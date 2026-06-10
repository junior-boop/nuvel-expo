import type { Session as SessionType, User as UserType } from "@/Database/db";
import db from ".";

const Session = db.createModel<SessionType>("session", {
  id: "TEXT PRIMARY KEY NOT NULL",
  iduser: "TEXT NOT NULL",
  name: "TEXT NULL",
  email: "TEXT NULL",
});

export const createTable = async () => {
  await Session.createTable();
};

export async function get(): Promise<SessionType | null> {
  try {
    const session = await Session.findById("sessionuser-01");
    return session;
  } catch (e) {
    return null;
  }
}

export async function set(data: UserType): Promise<SessionType | null> {
  const session = await Session.upsertWithCoalesce({
    id: "sessionuser-01",
    iduser: data.id,
    email: data.email,
    name: data.name,
  });

  return session;
}

export async function deleted(): Promise<Boolean> {
  const session = await Session.delete("sessionuser-01");
  return session;
}
