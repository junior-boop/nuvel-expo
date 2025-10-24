// Types et interfaces de base
interface BaseEntity {
  id: string;
}

interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: SortOptions;
}

interface SortOptions<T = any> {
  field: keyof T;
  direction: "asc" | "desc";
}

interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface StatsResult {
  min: number;
  max: number;
  avg: number;
  sum: number;
  count: number;
}

type PredicateFunction<T> = (item: T) => boolean;
type UpdateData<T> = Partial<Omit<T, "id">>;

// Classe principale avec typage amélioré
export class QueryForTable<T extends BaseEntity> {
  private dataMap: Map<string, T>;
  private lastQuery: T[] | null = null;

  constructor(array: T[] = []) {
    this.dataMap = new Map(array.map((item) => [item.id, item]));
  }

  // Méthodes de base avec typage
  findAll(): T[] {
    this.lastQuery = Array.from(this.dataMap.values());
    return this.lastQuery;
  }

  // Retourner le dernier résultat de requête
  getLastQuery(): T[] | null {
    return this.lastQuery;
  }

  // Trouver plusieurs éléments par IDs
  findByIds(ids: string[]): T[] {
    return ids
      .map((id) => this.dataMap.get(id))
      .filter((item): item is T => item !== undefined);
  }

  // Recherche avec regex
  search(property: keyof T, regex: RegExp): T[] {
    return this.where((item) => {
      const value = item[property];
      return typeof value === "string" && regex.test(value);
    });
  }

  // Grouper par propriété
  groupBy<K extends keyof T>(property: K): Map<T[K], T[]> {
    const groups = new Map<T[K], T[]>();
    this.findAll().forEach((item) => {
      const key = item[property];
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(item);
    });
    return groups;
  }

  // Pagination avec interface de résultat
  paginate(page: number, itemsPerPage: number): PaginationResult<T> {
    const total = this.count();
    const totalPages = Math.ceil(total / itemsPerPage);
    const start = (page - 1) * itemsPerPage;
    const data = this.findAll().slice(start, start + itemsPerPage);

    return {
      data,
      total,
      page,
      limit: itemsPerPage,
      totalPages,
    };
  }

  // Agrégations avec typage strict
  sum(property: keyof T): number {
    return this.findAll().reduce((acc, item) => {
      const value = item[property];
      return acc + (typeof value === "number" ? value : 0);
    }, 0);
  }

  // Trouver les doublons
  findDuplicates(property: keyof T): T[] {
    const groups = this.groupBy(property);
    const duplicates: T[] = [];
    groups.forEach((group) => {
      if (group.length > 1) {
        duplicates.push(...group);
      }
    });
    return duplicates;
  }

  // Opérations de mise à jour avec typage strict
  updateMany(predicate: PredicateFunction<T>, data: UpdateData<T>): number {
    let count = 0;
    this.where(predicate).forEach((item) => {
      if (this.update(item.id, data)) {
        count++;
      }
    });
    return count;
  }

  // Supprimer plusieurs éléments
  deleteMany(predicate: PredicateFunction<T>): number {
    let count = 0;
    this.where(predicate).forEach((item) => {
      if (this.delete(item.id)) {
        count++;
      }
    });
    return count;
  }

  // Vérifier si tous les éléments respectent une condition
  every(predicate: PredicateFunction<T>): boolean {
    return this.findAll().every(predicate);
  }

  // Vérifier si au moins un élément respecte une condition
  some(predicate: PredicateFunction<T>): boolean {
    return this.findAll().some(predicate);
  }

  // Statistiques avec interface de résultat
  stats(property: keyof T): StatsResult {
    const numbers = this.findAll()
      .map((item) => item[property])
      .filter((value): value is number => typeof value === "number");

    if (numbers.length === 0) {
      return { min: 0, max: 0, avg: 0, sum: 0, count: 0 };
    }

    return {
      min: Math.min(...numbers),
      max: Math.max(...numbers),
      avg: numbers.reduce((a, b) => a + b, 0) / numbers.length,
      sum: numbers.reduce((a, b) => a + b, 0),
      count: numbers.length,
    };
  }

  // Convertir en Map (retourne une copie)
  toMap(): Map<string, T> {
    return new Map(this.dataMap);
  }

  // Accès direct à la Map interne (attention: modifications directes possibles)
  getMap(): Map<string, T> {
    return this.dataMap;
  }

  // Fusionner avec une autre instance de QueryBuilder
  merge(other: QueryForTable<T>): QueryForTable<T> {
    const mergedArray = [...this.findAll(), ...other.findAll()];
    return new QueryForTable(mergedArray);
  }

  // Vider la collection
  clear(): void {
    this.dataMap.clear();
    this.lastQuery = null;
  }

  // Trouver par ID
  findById(id: string): T | undefined {
    return this.dataMap.get(id);
  }

  // Filtrer avec un prédicat personnalisé
  where(predicate: PredicateFunction<T>): T[] {
    return this.findAll().filter(predicate);
  }

  // Rechercher par propriété
  findBy<K extends keyof T>(property: K, value: T[K]): T[] {
    return this.where((item) => item[property] === value);
  }

  // Trier par propriété
  orderBy<K extends keyof T>(
    property: K,
    direction: "asc" | "desc" = "asc"
  ): T[] {
    return this.findAll().sort((a, b) => {
      const modifier = direction === "asc" ? 1 : -1;
      return a[property] > b[property] ? modifier : -modifier;
    });
  }

  // Limiter le nombre de résultats
  limit(count: number): T[] {
    return this.findAll().slice(0, count);
  }

  // Ajouter un élément
  add(item: T): void {
    // Ajouter timestamps automatiquement si pas présents
    const now = new Date();
    const itemWithTimestamps = {
      ...item,
    };

    this.dataMap.set(item.id, itemWithTimestamps);
  }

  // Ajouter plusieurs éléments
  addMany(items: T[]): void {
    items.forEach((item) => this.add(item));
  }

  // Ajouter ou mettre à jour (upsert)
  upsert(item: T): boolean {
    const exists = this.dataMap.has(item.id);

    if (exists) {
      // Mettre à jour
      const existingItem = this.dataMap.get(item.id)!;
      const updatedItem = {
        ...existingItem,
        ...item,
      };
      this.dataMap.set(item.id, updatedItem);
    } else {
      // Ajouter
      this.add(item);
    }

    return !exists; // Retourne true si c'était un ajout, false si c'était une mise à jour
  }

  // Mettre à jour un élément
  update(id: string, data: UpdateData<T>): boolean {
    const item = this.dataMap.get(id);
    if (item) {
      const updatedItem = {
        ...item,
        ...data,
      };
      this.dataMap.set(id, updatedItem);
      return true;
    }
    return false;
  }

  // Supprimer un élément
  delete(id: string): boolean {
    return this.dataMap.delete(id);
  }

  // Obtenir la taille de la collection
  count(): number {
    return this.dataMap.size;
  }

  // Vérifier si un élément existe
  has(id: string): boolean {
    return this.dataMap.has(id);
  }

  // Obtenir toutes les clés (IDs)
  keys(): string[] {
    return Array.from(this.dataMap.keys());
  }

  // Obtenir toutes les valeurs
  values(): T[] {
    return Array.from(this.dataMap.values());
  }

  // Obtenir toutes les entrées [id, item]
  entries(): [string, T][] {
    return Array.from(this.dataMap.entries());
  }

  // Itération avec forEach
  forEach(
    callback: (value: T, key: string, map: Map<string, T>) => void
  ): void {
    this.dataMap.forEach(callback);
  }

  // Créer un nouvel QueryBuilder à partir d'un sous-ensemble
  filter(predicate: PredicateFunction<T>): QueryForTable<T> {
    const filteredItems = this.where(predicate);
    return new QueryForTable(filteredItems);
  }

  // Transformer les données
  map<U extends BaseEntity>(
    callback: (item: T, index: number, array: T[]) => U
  ): QueryForTable<U> {
    const transformedItems = this.findAll().map(callback);
    return new QueryForTable(transformedItems);
  }

  // Réduire la collection à une valeur
  reduce<U>(
    callback: (
      accumulator: U,
      currentValue: T,
      currentIndex: number,
      array: T[]
    ) => U,
    initialValue: U
  ): U {
    return this.findAll().reduce(callback, initialValue);
  }

  // Obtenir un échantillon aléatoire
  sample(size: number): T[] {
    const all = this.findAll();
    if (size >= all.length) return all;

    const shuffled = [...all].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, size);
  }

  // Obtenir un élément aléatoire
  random(): T | undefined {
    const all = this.findAll();
    if (all.length === 0) return undefined;
    return all[Math.floor(Math.random() * all.length)];
  }
}

// Types exportés pour utilisation externe
export type {
  BaseEntity,
  PaginationResult,
  PredicateFunction,
  QueryOptions,
  SortOptions,
  StatsResult,
  UpdateData,
};
