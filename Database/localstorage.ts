import type { localStorage as localStorageType } from "@/Database/db";
import db from ".";

const localStorage = db.createModel<localStorageType>("localStorage", {
    id: "TEXT PRIMARY KEY NOT NULL",
    value: "TEXT NULL",
});

export const createTable = async () => {
    await localStorage.createTable();
};

const checkLocalStorage = async () => {
    const session = await localStorage.findAll();
    if (session) {
        console.log("Local storage", JSON.stringify(session));
    }
    return false;
}

export async function getItem(key: string): Promise<string | null> {
    try {
        const session = await localStorage.findById(key);
        return session?.value;
    } catch (e) {
        return null;
    }
}

export async function setItem(key: string, value: string): Promise<localStorageType | null> {
    const session = await localStorage.upsertWithCoalesce({
        id: key,
        value: value,
    });

    return session;
}

export async function removeItem(key: string): Promise<Boolean> {
    const session = await localStorage.delete(key);
    return session;
}


checkLocalStorage()
