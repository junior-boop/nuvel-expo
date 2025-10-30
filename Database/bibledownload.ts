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
  private static instance: BibleDownloader | null = null;
  private db: SQLiteDatabase | null = null;
  private isDownloading: boolean = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  // Pattern Singleton pour garantir une seule instance
  static getInstance(): BibleDownloader {
    if (!BibleDownloader.instance) {
      BibleDownloader.instance = new BibleDownloader();
    }
    return BibleDownloader.instance;
  }

  // Initialisation avec protection contre les appels multiples
  async init() {
    // Si déjà initialisé, retourner directement
    if (this.db) {
      console.log("✅ DB déjà initialisée");
      return true;
    }

    // Si en cours d'initialisation, attendre
    if (this.initPromise) {
      await this.initPromise;
      return true;
    }

    // Nouvelle initialisation
    this.initPromise = this.performInit();
    await this.initPromise;
    this.initPromise = null;
    return true;
  }

  private async performInit() {
    try {
      console.log("🔄 Initialisation de la base de données...");
      this.db = await openDatabaseAsync("database.db");

      if (!this.db) {
        throw new Error("Échec de l'ouverture de la base de données");
      }

      await this.createTables();
      console.log("✅ Base de données initialisée avec succès");
    } catch (error) {
      console.error("❌ Erreur d'initialisation DB:", error);
      this.db = null;
      throw error;
    }
  }

  // Garantir la connexion avant chaque opération
  private async ensureConnection() {
    if (!this.db) {
      console.log("⚠️ DB non initialisée, initialisation automatique...");
      await this.init();
    }

    if (!this.db) {
      throw new Error("Impossible de se connecter à la base de données");
    }
  }

  async createTables() {
    if (!this.db) return;

    try {
      await this.db.execAsync(`
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
      console.log("✅ Tables créées/vérifiées");
    } catch (error) {
      console.error("❌ Erreur création tables:", error);
      throw error;
    }
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
    await this.ensureConnection();

    if (this.isDownloading) {
      throw new Error("Un téléchargement est déjà en cours");
    }

    this.isDownloading = true;

    try {
      console.log(`🔄 Téléchargement de ${book_id}...`);

      const response = await fetch(
        `https://nuvelserver.godigital.workers.dev/bible${versionCode}`
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = (await response.json()) as versets;
      const verses = this.prepareVerses(book_id, data.content);

      console.log(`📝 ${verses.length} versets à insérer`);

      await this.insertBatch(verses, onProgress);

      // S'assurer que la connexion est toujours active
      await this.ensureConnection();

      await this.db!.runAsync(
        "INSERT OR REPLACE INTO downloads (version, verses_count) VALUES (?, ?)",
        [book_id, verses.length]
      );

      console.log("✅ Téléchargement terminé");
      return { success: true, versesCount: verses.length };
    } catch (error) {
      console.error("❌ Erreur téléchargement:", error);
      throw error;
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
    await this.ensureConnection();

    if (!verses || verses.length === 0) {
      throw new Error("Aucune donnée à insérer");
    }

    const batchSize = 500; // Taille réduite pour plus de stabilité
    let inserted = 0;

    try {
      console.log(
        `🔄 Insertion de ${verses.length} versets par batch de ${batchSize}...`
      );

      // Transaction globale pour toute l'insertion
      await this.db!.withTransactionAsync(async () => {
        for (let i = 0; i < verses.length; i += batchSize) {
          const batch = verses.slice(i, i + batchSize);
          const placeholders = batch.map(() => "(?, ?, ?, ?, ?, ?)").join(",");
          const values = batch.flat();

          await this.db!.runAsync(
            `INSERT OR REPLACE INTO BibleContent (book_id, book_name, book, chapter, verse, text) 
             VALUES ${placeholders}`,
            values
          );

          inserted += batch.length;

          if (onProgress) {
            const current = Math.min(i + batchSize, verses.length);
            onProgress({
              current,
              total: verses.length,
              percent: Math.round((current / verses.length) * 100),
            });
          }

          // Petit délai pour laisser respirer l'UI
          if (i + batchSize < verses.length) {
            await new Promise((resolve) => setTimeout(resolve, 5));
          }
        }
      });

      console.log(`✅ ${inserted} versets insérés avec succès`);
    } catch (error) {
      console.error("❌ Erreur insertion:", error);
      throw new Error(`Échec de l'insertion après ${inserted} versets`);
    }
  }

  async getDownloadedVersions() {
    await this.ensureConnection();

    try {
      const result = await this.db!.getAllAsync("SELECT * FROM downloads");
      return result;
    } catch (error) {
      console.error("❌ Erreur lecture versions:", error);
      throw error;
    }
  }

  async deleteVersion(book_id: string) {
    await this.ensureConnection();

    if (!book_id) {
      throw new Error("book_id est requis");
    }

    try {
      await this.db!.withTransactionAsync(async () => {
        await this.db!.runAsync("DELETE FROM BibleContent WHERE book_id = ?", [
          book_id,
        ]);
        await this.db!.runAsync("DELETE FROM downloads WHERE version = ?", [
          book_id,
        ]);
      });
      console.log(`✅ Version ${book_id} supprimée`);
    } catch (error) {
      console.error("❌ Erreur suppression:", error);
      throw error;
    }
  }

  // Vérifier l'état de la connexion
  async checkHealth(): Promise<boolean> {
    try {
      await this.ensureConnection();
      await this.db!.runAsync("SELECT 1");
      console.log("✅ Connexion DB en bonne santé");
      return true;
    } catch (error) {
      console.error("❌ Connexion DB défaillante:", error);
      return false;
    }
  }

  // Fermer proprement la connexion (si nécessaire)
  async close() {
    if (this.db) {
      try {
        await this.db.closeAsync();
        console.log("✅ Connexion DB fermée");
      } catch (error) {
        console.error("❌ Erreur fermeture DB:", error);
      } finally {
        this.db = null;
      }
    }
  }
}

// Export d'une instance singleton
export const bibleDownloader = BibleDownloader.getInstance();
