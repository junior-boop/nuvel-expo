import { ModelFactory, SimpleORM } from "../SimpleORM";

export const orm = new SimpleORM("database.db");
const db = new ModelFactory(orm);

export default db;
