// types.ts
import * as SQLite from "expo-sqlite";

export interface QueryResult {
  lastID?: number;
  changes: number;
}

export interface DatabaseRow {
  [key: string]: any;
}

export interface WhereConditions {
  [key: string]: any;
}

export interface OrderByOptions {
  column: string;
  direction?: "ASC" | "DESC";
}

export interface IncludeOptions {
  model: string;
  foreignKey: string;
  localKey?: string;
  as?: string;
}

export interface QueryOptions {
  where?: WhereConditions;
  orderBy?: OrderByOptions | OrderByOptions[];
  limit?: number;
  offset?: number;
  include?: IncludeOptions | IncludeOptions[];
}

export interface TableSchema {
  [columnName: string]: string;
}

export type ModelKeys<T> = {
  [K in keyof T]: K;
};

export type ModelTypes<T> = {
  [K in keyof T]: T[K] extends string
    ? "string"
    : T[K] extends number
    ? "number"
    : T[K] extends boolean
    ? "boolean"
    : T[K] extends Date
    ? "date"
    : "any";
};

export interface ModelWithMeta<T extends DatabaseRow> {
  keys: ModelKeys<T>;
  types: ModelTypes<T>;
  tableName: string;
}

export interface QueryBuilder<T extends DatabaseRow> {
  where(conditions: WhereConditions): QueryBuilder<T>;
  orderBy(column: string, direction?: "ASC" | "DESC"): QueryBuilder<T>;
  limit(limit: number): QueryBuilder<T>;
  offset(offset: number): QueryBuilder<T>;
  include(options: IncludeOptions | IncludeOptions[]): QueryBuilder<T>;
  findAll(): Promise<T[]>;
  findOne(): Promise<T | null>;
  count(): Promise<number>;
}

export interface ModelInstance<T extends DatabaseRow> extends Partial<T> {
  save(): Promise<T>;
  delete(): Promise<boolean>;
}

export interface ModelClass<T extends DatabaseRow> extends ModelWithMeta<T> {
  new (data?: Partial<T>): ModelInstance<T>;
  createTable(): Promise<QueryResult>;
  create(data: Partial<T>): Promise<T>;
  findAll(options?: QueryOptions): Promise<T[]>;
  findById(
    id: string | number,
    options?: { include?: IncludeOptions | IncludeOptions[] }
  ): Promise<T | null>;
  findOne(options: QueryOptions): Promise<T | null>;
  update(id: string | number, data: Partial<T>): Promise<T | null>;
  delete(id: string | number): Promise<boolean>;
  deleteWhere(conditions: WhereConditions): Promise<number>;
  upsert(data: Partial<T>): Promise<T>;
  where(conditions: WhereConditions): QueryBuilder<T>;
  orderBy(column: string, direction?: "ASC" | "DESC"): QueryBuilder<T>;
  limit(limit: number): QueryBuilder<T>;
  offset(offset: number): QueryBuilder<T>;
  include(options: IncludeOptions | IncludeOptions[]): QueryBuilder<T>;
  orm: SimpleORM;
}

type text = "TEXT";
type primaryKey = "PRIMARY KEY";
type notNull = "NOT NULL";
type real = "REAL";
type integer = "INTEGER" | "INT";
type blob = "BLOB";
type Null = "NULL";
type foreignKey = "FOREIGN KEY";
type Default = "DEFAULT" | "DEFAULT";
type time = "TIME";
type timestamp = "TIMESTAMP";
type current = "CURRENT_TIMESTAMP";
type datetime = "DATETIME";

type TextWithSuffix =
  | text
  | primaryKey
  | notNull
  | real
  | integer
  | blob
  | Null
  | foreignKey
  | Default
  | "UNIQUE"
  | `${text | integer | real | blob} ${
      | primaryKey
      | foreignKey
      | notNull
      | Null
      | "UNIQUE"
      | "AUTOINCREMENT"}`
  | `${text | integer | real} ${primaryKey | foreignKey | notNull | Null} ${
      | notNull
      | Null
      | Default
      | "UNIQUE"
      | "AUTOINCREMENT"}`
  | `${datetime | time | timestamp}`
  | `${datetime | time | timestamp} ${notNull | null}`
  | `${datetime | time | timestamp} ${notNull | null | Default} ${current}`
  | `${datetime | time | timestamp} ${notNull | null} ${
      | current
      | Default} ${current}`;

// SimpleORM.ts
export class SimpleORM {
  private db: SQLite.SQLiteDatabase;

  constructor(dbName: string) {
    this.db = SQLite.openDatabaseSync(dbName);
  }

  // Méthode pour exécuter des requêtes SQL brutes
  async query<T = DatabaseRow>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const result = await this.db.getAllAsync<T>(sql, params);
      return result || [];
    } catch (err) {
      throw err;
    }
  }

  // Méthode pour exécuter des requêtes qui ne retournent pas de données
  async run(sql: string, params: any[] = []): Promise<QueryResult> {
    try {
      const result = await this.db.runAsync(sql, params);
      return {
        lastID: result.lastInsertRowId,
        changes: result.changes,
      };
    } catch (err) {
      throw err;
    }
  }

  // Fermer la connexion
  async close(): Promise<void> {
    await this.db.closeAsync();
  }

  // Obtenir l'instance de la base de données
  getDatabase(): SQLite.SQLiteDatabase {
    return this.db;
  }
}

export abstract class Model {
  protected tableName: string;
  protected orm: SimpleORM;
  protected attributes: DatabaseRow;

  constructor(tableName: string, orm: SimpleORM) {
    this.tableName = tableName;
    this.orm = orm;
    this.attributes = {};
  }

  // Créer la table
  static async createTable(
    tableName: string,
    columns: TableSchema,
    orm: SimpleORM
  ): Promise<QueryResult> {
    const columnDefs = Object.entries(columns)
      .map(([name, type]) => `${name} ${type}`)
      .join(", ");

    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs})`;
    return orm.run(sql);
  }

  // Insérer un nouvel enregistrement
  static async create<T extends DatabaseRow>(
    tableName: string,
    data: Partial<T>,
    orm: SimpleORM
  ): Promise<T> {
    const columns = Object.keys(data).join(", ");
    const placeholders = Object.keys(data)
      .map(() => "?")
      .join(", ");
    const values = Object.values(data);

    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    const result = await orm.run(sql, values);

    return { id: result.lastID, ...data } as T;
  }

  // Trouver tous les enregistrements avec options avancées
  static async findAll<T extends DatabaseRow>(
    tableName: string,
    orm: SimpleORM,
    options: QueryOptions = {}
  ): Promise<T[]> {
    const { where = {}, orderBy, limit, offset, include } = options;

    let sql = `SELECT * FROM ${tableName}`;
    let params: any[] = [];

    // WHERE clause
    if (Object.keys(where).length > 0) {
      const whereClause = Object.keys(where)
        .map((key) => `${key} = ?`)
        .join(" AND ");
      sql += ` WHERE ${whereClause}`;
      params = Object.values(where);
    }

    // ORDER BY clause
    if (orderBy) {
      const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
      const orderClauses = orderByArray
        .map((order) => `${order.column} ${order.direction || "ASC"}`)
        .join(", ");
      sql += ` ORDER BY ${orderClauses}`;
    }

    // LIMIT clause
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }

    // OFFSET clause
    if (offset) {
      sql += ` OFFSET ${offset}`;
    }

    let results = await orm.query<T>(sql, params);

    // Handle includes (relations)
    if (include && results.length > 0) {
      results = await this.handleIncludes<T>(tableName, results, include, orm);
    }

    return results;
  }

  // Trouver un enregistrement par ID avec options
  static async findById<T extends DatabaseRow>(
    tableName: string,
    id: string | number,
    orm: SimpleORM,
    options: { include?: IncludeOptions | IncludeOptions[] } = {}
  ): Promise<T | null> {
    const { include } = options;

    const sql = `SELECT * FROM ${tableName} WHERE id = ?`;
    const rows = await orm.query<T>(sql, [id]);
    let result = rows[0] || null;

    // Handle includes
    if (result && include) {
      const results = await this.handleIncludes<T>(
        tableName,
        [result],
        include,
        orm
      );
      result = results[0];
    }

    return result;
  }

  // Trouver un seul enregistrement avec options
  static async findOne<T extends DatabaseRow>(
    tableName: string,
    options: QueryOptions,
    orm: SimpleORM
  ): Promise<T | null> {
    const { where = {}, orderBy, include } = options;

    const whereClause = Object.keys(where)
      .map((key) => `${key} = ?`)
      .join(" AND ");
    let sql = `SELECT * FROM ${tableName} WHERE ${whereClause}`;
    const params = Object.values(where);

    // ORDER BY clause
    if (orderBy) {
      const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
      const orderClauses = orderByArray
        .map((order) => `${order.column} ${order.direction || "ASC"}`)
        .join(", ");
      sql += ` ORDER BY ${orderClauses}`;
    }

    sql += " LIMIT 1";

    const rows = await orm.query<T>(sql, params);
    let result = rows[0] || null;

    // Handle includes
    if (result && include) {
      const results = await this.handleIncludes<T>(
        tableName,
        [result],
        include,
        orm
      );
      result = results[0];
    }

    return result;
  }

  // Mettre à jour un enregistrement
  static async update<T extends DatabaseRow>(
    tableName: string,
    id: string | number,
    data: Partial<T>,
    orm: SimpleORM
  ): Promise<T | null> {
    const setClause = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(", ");
    const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
    const params = [...Object.values(data), id];

    await orm.run(sql, params);
    return await this.findById<T>(tableName, id, orm);
  }

  // Supprimer un enregistrement
  static async delete(
    tableName: string,
    id: string | number,
    orm: SimpleORM
  ): Promise<boolean> {
    const sql = `DELETE FROM ${tableName} WHERE id = ?`;
    const result = await orm.run(sql, [id]);
    return result.changes > 0;
  }

  // Supprimer avec conditions
  static async deleteWhere(
    tableName: string,
    conditions: WhereConditions,
    orm: SimpleORM
  ): Promise<number> {
    const whereClause = Object.keys(conditions)
      .map((key) => `${key} = ?`)
      .join(" AND ");
    const sql = `DELETE FROM ${tableName} WHERE ${whereClause}`;
    const params = Object.values(conditions);

    const result = await orm.run(sql, params);
    return result.changes;
  }

  // INSERT OR REPLACE (Upsert)
  static async upsert<T extends DatabaseRow>(
    tableName: string,
    data: Partial<T>,
    orm: SimpleORM
  ): Promise<T> {
    const columns = Object.keys(data).join(", ");
    const placeholders = Object.keys(data)
      .map(() => "?")
      .join(", ");
    const values = Object.values(data);

    const sql = `INSERT OR REPLACE INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    const result = await orm.run(sql, values);

    return { id: result.lastID || (data as any).id, ...data } as T;
  }

  // Méthode pour gérer les relations (includes)
  static async handleIncludes<T extends DatabaseRow>(
    tableName: string,
    results: T[],
    include: IncludeOptions | IncludeOptions[],
    orm: SimpleORM
  ): Promise<T[]> {
    const includeArray = Array.isArray(include) ? include : [include];

    for (const includeOption of includeArray) {
      const {
        model: includeTable,
        foreignKey,
        localKey = "id",
        as,
      } = includeOption;
      const relationName = as || includeTable;

      // Récupérer les IDs uniques pour éviter les requêtes multiples (optimisation N+1)
      const ids = [
        ...new Set(
          results.map((row) => (row as any)[localKey]).filter(Boolean)
        ),
      ];

      if (ids.length === 0) continue;

      // Requête pour récupérer les données liées
      const placeholders = ids.map(() => "?").join(", ");
      const relatedSql = `SELECT * FROM ${includeTable} WHERE ${foreignKey} IN (${placeholders})`;
      const relatedData = await orm.query(relatedSql, ids);

      // Grouper les données liées par foreign key
      const relatedMap = new Map();
      relatedData.forEach((item) => {
        const key = (item as any)[foreignKey];
        if (!relatedMap.has(key)) {
          relatedMap.set(key, []);
        }
        relatedMap.get(key).push(item);
      });

      // Attacher les données liées aux résultats principaux
      results.forEach((row) => {
        const localId = (row as any)[localKey];
        (row as any)[relationName] = relatedMap.get(localId) || [];
      });
    }

    return results;
  }
}

type Schema<T extends TableSchema> = {
  [K in keyof T]: TextWithSuffix;
};

// Classe pour créer des modèles spécifiques avec métadonnées et Query Builder
export class ModelFactory {
  private orm: SimpleORM;

  constructor(orm: SimpleORM) {
    this.orm = orm;
  }

  createModel<T extends DatabaseRow>(
    tableName: string,
    schema: Schema<T>,
    sampleData?: T
  ): ModelClass<T> {
    const orm = this.orm;

    // Générer les métadonnées à partir du schéma ou des données d'exemple
    const generateMetadata = (): {
      keys: ModelKeys<T>;
      types: ModelTypes<T>;
    } => {
      const keys = {} as ModelKeys<T>;
      const types = {} as ModelTypes<T>;

      // Utiliser les clés du schéma si disponible
      if (Object.keys(schema).length > 0) {
        Object.keys(schema).forEach((key) => {
          (keys as any)[key] = key;

          // Inférer le type à partir du schéma SQL
          const sqlType = schema[key].toUpperCase();
          if (sqlType.includes("INTEGER") || sqlType.includes("INT")) {
            (types as any)[key] = "number";
          } else if (sqlType.includes("TEXT") || sqlType.includes("VARCHAR")) {
            (types as any)[key] = "string";
          } else if (sqlType.includes("BOOLEAN") || sqlType.includes("BOOL")) {
            (types as any)[key] = "boolean";
          } else if (sqlType.includes("DATE") || sqlType.includes("TIME")) {
            (types as any)[key] = "date";
          } else {
            (types as any)[key] = "any";
          }
        });
      }

      // Utiliser les données d'exemple si fournies
      if (sampleData) {
        Object.keys(sampleData).forEach((key) => {
          (keys as any)[key] = key;

          const value = (sampleData as any)[key];
          if (typeof value === "string") {
            (types as any)[key] = "string";
          } else if (typeof value === "number") {
            (types as any)[key] = "number";
          } else if (typeof value === "boolean") {
            (types as any)[key] = "boolean";
          } else if (value instanceof Date) {
            (types as any)[key] = "date";
          } else {
            (types as any)[key] = "any";
          }
        });
      }

      return { keys, types };
    };

    const metadata = generateMetadata();

    // Query Builder Implementation
    class QueryBuilderImpl implements QueryBuilder<T> {
      private options: QueryOptions = {};

      constructor(private tableName: string, private orm: SimpleORM) {}

      where(conditions: WhereConditions): QueryBuilder<T> {
        this.options.where = { ...this.options.where, ...conditions };
        return this;
      }

      orderBy(
        column: string,
        direction: "ASC" | "DESC" = "ASC"
      ): QueryBuilder<T> {
        const orderBy = { column, direction };
        if (this.options.orderBy) {
          this.options.orderBy = Array.isArray(this.options.orderBy)
            ? [...this.options.orderBy, orderBy]
            : [this.options.orderBy, orderBy];
        } else {
          this.options.orderBy = orderBy;
        }
        return this;
      }

      limit(limit: number): QueryBuilder<T> {
        this.options.limit = limit;
        return this;
      }

      offset(offset: number): QueryBuilder<T> {
        this.options.offset = offset;
        return this;
      }

      include(options: IncludeOptions | IncludeOptions[]): QueryBuilder<T> {
        if (this.options.include) {
          const currentIncludes = Array.isArray(this.options.include)
            ? this.options.include
            : [this.options.include];
          const newIncludes = Array.isArray(options) ? options : [options];
          this.options.include = [...currentIncludes, ...newIncludes];
        } else {
          this.options.include = options;
        }
        return this;
      }

      async findAll(): Promise<T[]> {
        return await Model.findAll<T>(this.tableName, this.orm, this.options);
      }

      async findOne(): Promise<T | null> {
        return await Model.findOne<T>(this.tableName, this.options, this.orm);
      }

      async count(): Promise<number> {
        const { where = {} } = this.options;
        let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
        let params: any[] = [];

        if (Object.keys(where).length > 0) {
          const whereClause = Object.keys(where)
            .map((key) => `${key} = ?`)
            .join(" AND ");
          sql += ` WHERE ${whereClause}`;
          params = Object.values(where);
        }

        const result = await this.orm.query<{ count: number }>(sql, params);
        return result[0]?.count || 0;
      }
    }

    // Classe de modèle générée
    class GeneratedModel implements ModelInstance<T> {
      [key: string]: any;

      constructor(data: Partial<T> = {}) {
        Object.assign(this, data);
      }

      // Méthodes d'instance
      async save(): Promise<T> {
        if (this.id) {
          const result = await Model.update<T>(
            tableName,
            this.id,
            this as Partial<T>,
            orm
          );
          Object.assign(this, result);
          return result!;
        } else {
          const result = await Model.create<T>(
            tableName,
            this as Partial<T>,
            orm
          );
          this.id = result.id;
          Object.assign(this, result);
          return result;
        }
      }

      async delete(): Promise<boolean> {
        if (this.id) {
          return await Model.delete(tableName, this.id, orm);
        }
        return false;
      }

      // Méthodes statiques - CRUD de base
      static async createTable(): Promise<QueryResult> {
        return await Model.createTable(tableName, schema, orm);
      }

      static async create(data: Partial<T>): Promise<T> {
        return await Model.create<T>(tableName, data, orm);
      }

      static async findAll(options: QueryOptions = {}): Promise<T[]> {
        return await Model.findAll<T>(tableName, orm, options);
      }

      static async findById(
        id: string | number,
        options: { include?: IncludeOptions | IncludeOptions[] } = {}
      ): Promise<T | null> {
        return await Model.findById<T>(tableName, id, orm, options);
      }

      static async findOne(options: QueryOptions): Promise<T | null> {
        return await Model.findOne<T>(tableName, options, orm);
      }

      static async update(
        id: string | number,
        data: Partial<T>
      ): Promise<T | null> {
        return await Model.update<T>(tableName, id, data, orm);
      }

      static async delete(id: string | number): Promise<boolean> {
        return await Model.delete(tableName, id, orm);
      }

      static async deleteWhere(conditions: WhereConditions): Promise<number> {
        return await Model.deleteWhere(tableName, conditions, orm);
      }

      static async upsert(data: Partial<T>): Promise<T> {
        return await Model.upsert<T>(tableName, data, orm);
      }

      // Query Builder methods - Méthodes fluides
      static where(conditions: WhereConditions): QueryBuilder<T> {
        return new QueryBuilderImpl(tableName, orm).where(conditions);
      }

      static orderBy(
        column: string,
        direction: "ASC" | "DESC" = "ASC"
      ): QueryBuilder<T> {
        return new QueryBuilderImpl(tableName, orm).orderBy(column, direction);
      }

      static limit(limit: number): QueryBuilder<T> {
        return new QueryBuilderImpl(tableName, orm).limit(limit);
      }

      static offset(offset: number): QueryBuilder<T> {
        return new QueryBuilderImpl(tableName, orm).offset(offset);
      }

      static include(
        options: IncludeOptions | IncludeOptions[]
      ): QueryBuilder<T> {
        return new QueryBuilderImpl(tableName, orm).include(options);
      }

      // Métadonnées exportées
      static keys = metadata.keys;
      static types = metadata.types;
      static tableName = tableName;
      static orm = orm;
    }

    return GeneratedModel as any;
  }
}

/*
EXEMPLE D'UTILISATION AVEC EXPO-SQLITE:

// types/models.ts
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  created_at: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  userId: number;
  created_at: string;
}

interface Comment {
  id: number;
  content: string;
  postId: number;
  userId: number;
  created_at: string;
}

// database/setup.ts
import { SimpleORM, ModelFactory } from './orm';

const orm = new SimpleORM('myapp.db');
const factory = new ModelFactory(orm);

export const UserModel = factory.createModel<User>('users', {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  name: 'TEXT NOT NULL',
  email: 'TEXT UNIQUE NOT NULL',
  isActive: 'INTEGER DEFAULT 1',
  created_at: 'TEXT DEFAULT CURRENT_TIMESTAMP'
});

export const PostModel = factory.createModel<Post>('posts', {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  title: 'TEXT NOT NULL',
  content: 'TEXT',
  userId: 'INTEGER',
  created_at: 'TEXT DEFAULT CURRENT_TIMESTAMP'
});

export const CommentModel = factory.createModel<Comment>('comments', {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  content: 'TEXT NOT NULL',
  postId: 'INTEGER',
  userId: 'INTEGER',
  created_at: 'TEXT DEFAULT CURRENT_TIMESTAMP'
});

// Initialiser les tables
export async function initDatabase() {
  await UserModel.createTable();
  await PostModel.createTable();
  await CommentModel.createTable();
}

// EXEMPLES D'UTILISATION:

async function examples() {
  // Initialiser la base de données
  await initDatabase();

  // 1. Query Builder fluide
  const activeUsers = await UserModel
    .where({ isActive: 1 })
    .orderBy('created_at', 'DESC')
    .limit(10)
    .findAll();

  // 2. Relations complexes
  const postsWithAll = await PostModel
    .include([
      { model: 'users', foreignKey: 'id', localKey: 'userId', as: 'author' },
      { model: 'comments', foreignKey: 'postId', as: 'comments' }
    ])
    .orderBy('created_at', 'DESC')
    .findAll();

  // 3. Pagination
  const page2 = await UserModel
    .where({ isActive: 1 })
    .orderBy('name', 'ASC')
    .limit(20)
    .offset(20)
    .findAll();

  // 4. Comptage
  const activeUserCount = await UserModel
    .where({ isActive: 1 })
    .count();

  // 5. Recherche avec options complètes
  const recentPosts = await PostModel.findAll({
    where: { userId: 1 },
    orderBy: [
      { column: 'created_at', direction: 'DESC' },
      { column: 'title', direction: 'ASC' }
    ],
    limit: 5,
    include: { model: 'comments', foreignKey: 'postId', as: 'comments' }
  });

  // 6. CRUD de base
  const user = await UserModel.create({
    name: 'John Doe',
    email: 'john@example.com',
    isActive: 1
  });

  // 7. Update
  await UserModel.update(user.id, { name: 'Jane Doe' });

  // 8. Upsert
  const session = await UserModel.upsert({
    id: 1,
    name: 'Updated User',
    email: 'updated@example.com'
  });

  // 9. Delete
  await UserModel.delete(user.id);

  // 10. Métadonnées
  console.log('User keys:', UserModel.keys);
  console.log('User types:', UserModel.types);
  console.log('Table name:', UserModel.tableName);
}
*/
