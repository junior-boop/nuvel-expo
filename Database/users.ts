import type { User as UserType } from "@/Database/db";
import db from ".";

const Users = db.createModel<UserType>("users", {
  id: "TEXT PRIMARY KEY NOT NULL",
  name: "TEXT NOT NULL",
  first_name: "TEXT NOT NULL",
  association: "TEXT NULL",
  country: "TEXT NULL",
  biography: "TEXT NULL",
  church_status: "TEXT NOT NULL DEFAULT Member",
  email: "TEXT NOT NULL UNIQUE",
  photo: "TEXT NULL",
  lastlogin: "TEXT",
  lastlogout: "TEXT",
  created: "DATETIME DEFAULT CURRENT_TIMESTAMP",
  modified: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
});

export const createTable = async () => {
  await Users.createTable();
};

export async function created(user: UserType): Promise<UserType | null> {
  try {
    const check = await Users.findOne({ where: { email: user.email } });

    if (check) {
      return check;
    }
    const result = Users.create({
      id: user.id,
      name: user.name,
      first_name: user.first_name,
      association : user.association,
      country : user.country,
      biography: user.biography,
      church_status: user.church_status,
      photo: user.photo,
      created: user.created,
      modified: user.modified,
      email: user.email,
      lastlogin: user.lastlogin,
      lastlogout: user.lastlogout,
    });
    return result;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getAll() {
  try {
    const result = await Users.findAll({
      orderBy: { column: "modified", direction: "DESC" },
    });
    return result;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function get(id: string): Promise<UserType | null> {
  try {
    const result = await Users.findById(id);
    return result;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function updated(user: UserType): Promise<UserType | null> {
  try {
    const result = await Users.update(user.id, user);
    return result;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function deleted(id: string): Promise<boolean | null> {
  try {
    const result = await Users.delete(id);
    return result;
  } catch (e) {
    console.error(e);
    return null;
  }
}
