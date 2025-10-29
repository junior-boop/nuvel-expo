import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

type versets = {
  shortname: string;
  year: string;
  verset: number;
  content: {
    book_name: string;
    book: number;
    chapter: number;
    verse: number;
    text: string;
  }[];
};

export class BibleDownloader {
  private db: SQLiteDatabase | null;
  private isDownloading: boolean;

  constructor() {
    this.db = null;
    this.isDownloading = false;
  }

  // Modification de l'initialisation
  async init() {
    try {
      this.db = await openDatabaseAsync("database.db");
      if (!this.db) {
        throw new Error("Échec de l'initialisation de la base de données");
      }
      await this.createTables();
      console.log("✅ Base de données initialisée");
      return true;
    } catch (error) {
      console.error("Erreur d'initialisation DB:", error);
      throw error;
    }
  }

  // Ajout d'une vérification de connexion
  private checkConnection() {
    if (!this.db) {
      throw new Error(
        "Base de données non initialisée. Appelez init() d'abord."
      );
    }
  }

  async createTables() {
    await this.db?.execAsync(`
      CREATE TABLE IF NOT EXISTS BibleContent (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id TEXT NOT NULL,
        book_name TEXT NOT NULL,
        book INTEGER NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS downloads (
        version TEXT PRIMARY KEY,
        downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        verses_count INTEGER
      );
      
      CREATE INDEX IF NOT EXISTS idx_version_book_chapter 
      ON BibleContent(book_id, book, chapter);
    `);
  }

  async downloadVersion(
    versionCode: string,
    book_id: string,
    onProgress: (progress: {
      current: number;
      total: number;
      percent: number;
    }) => void
  ) {
    this.checkConnection();
    if (this.isDownloading) {
      throw new Error("Un téléchargement est déjà en cours");
    }

    this.isDownloading = true;

    try {
      // Télécharger
      const response = await fetch(
        `https://nuvelserver.godigital.workers.dev/bible${versionCode}`
      );
      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement");
      }

      const data = (await response.json()) as versets;
      // Préparer les données
      const verses = this.prepareVerses(book_id, data.content);

      // Insérer par batch
      await this.insertBatch(verses, onProgress);

      // Marquer comme téléchargé
      await this.db?.runAsync(
        "INSERT OR REPLACE INTO downloads (version, verses_count) VALUES (?, ?)",
        [book_id, verses.length]
      );
      console.log("✅ Téléchargement terminé");
      return { success: true, versesCount: verses.length };
    } finally {
      this.isDownloading = false;
    }
  }

  prepareVerses(version: string, data: versets["content"]) {
    return data.map((verse) => [
      version,
      verse.book_name,
      verse.book,
      verse.chapter,
      verse.verse,
      verse.text,
    ]);
  }

  async insertBatch(
    verses: (string | number)[][],
    onProgress: (progress: {
      current: number;
      total: number;
      percent: number;
    }) => void
  ) {
    this.checkConnection();

    if (!verses || verses.length === 0) {
      throw new Error("Aucune donnée à insérer");
    }
    const batchSize = 2000;

    await this.db?.execAsync("PRAGMA synchronous = OFF");

    for (let i = 0; i < verses.length; i += batchSize) {
      const batch = verses.slice(i, i + batchSize);
      const placeholders = batch.map(() => "(?, ?, ?, ?, ?, ?)").join(",");
      const values = batch.flat();

      await this.db?.runAsync(
        `INSERT OR REPLACE INTO BibleContent (book_id, book_name, book, chapter, verse, text) 
         VALUES ${placeholders}`,
        values
      );

      if (onProgress) {
        onProgress({
          current: Math.min(i + batchSize, verses.length),
          total: verses.length,
          percent: Math.round(
            (Math.min(i + batchSize, verses.length) / verses.length) * 100
          ),
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    await this.db?.execAsync("PRAGMA synchronous = NORMAL");
    console.log("✅ Insertion terminée");
  }

  async getDownloadedVersions() {
    this.checkConnection();
    const result = await this.db?.getAllAsync("SELECT * FROM downloads");
    return result;
  }

  async deleteVersion(book_id: string) {
    this.checkConnection();
    if (!book_id) {
      throw new Error("book_id est requis");
    }
    await this.db?.runAsync("DELETE FROM BibleContent WHERE book_id = ?", [
      book_id,
    ]);
    await this.db?.runAsync("DELETE FROM downloads WHERE version = ?", [
      book_id,
    ]);
  }
}
