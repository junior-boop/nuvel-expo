import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import * as BibleContent from "./bible.content";

const FETCH_TIMEOUT_MS = 60_000;
const RETRY_DELAY_MS = 10_000;
const MAX_RETRIES = 3;

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

type ProgressCb = (progress: { current: number; total: number; percent: number }) => void;
type DownloadResult = { success: boolean; versesCount: number };
type QueueJob = {
  id: string;
  versionCode: string;
  book_id: string;
  onProgress: ProgressCb;
  resolve: (v: DownloadResult) => void;
  reject: (e: unknown) => void;
  attempts: number;
};

export class BibleDownloader {
  private static instance: BibleDownloader | null = null;
  private db: SQLiteDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private queue: QueueJob[] = [];
  private processing: boolean = false;

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
      if (__DEV__) console.log("✅ DB déjà initialisée");
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
      if (__DEV__) console.log("🔄 Initialisation de la base de données...");
      this.db = await openDatabaseAsync("database.db");

      if (!this.db) {
        throw new Error("Échec de l'ouverture de la base de données");
      }

      await this.createTables();
      if (__DEV__) console.log("✅ Base de données initialisée avec succès");
    } catch (error) {
      console.error("❌ Erreur d'initialisation DB:", error);
      this.db = null;
      throw error;
    }
  }

  // Garantir la connexion avant chaque opération
  private async ensureConnection() {
    if (!this.db) {
      if (__DEV__) console.log("⚠️ DB non initialisée, initialisation automatique...");
      await this.init();
    }

    if (!this.db) {
      throw new Error("Impossible de se connecter à la base de données");
    }
  }

  async createTables() {
    if (!this.db) return;

    try {
      // Schéma BibleContent géré par bible.content.ts (source unique).
      await BibleContent.createTable();
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS downloads (
          version TEXT PRIMARY KEY,
          downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          verses_count INTEGER
        );

        CREATE INDEX IF NOT EXISTS idx_version_book_chapter
        ON BibleContent(book_id, book, chapter);
      `);
      if (__DEV__) console.log("✅ Tables créées/vérifiées");
    } catch (error) {
      console.error("❌ Erreur création tables:", error);
      throw error;
    }
  }

  /**
   * Enfile un téléchargement. Si rien n'est en cours, démarre immédiatement.
   * Sinon, attend son tour (FIFO). Le Promise se résout / rejette selon le job.
   */
  downloadVersion(
    versionCode: string,
    book_id: string,
    onProgress: ProgressCb
  ): Promise<DownloadResult> {
    // Déduplication : si déjà en file ou en cours, retourner le même Promise n'est
    // pas trivial — on autorise l'enfilage multiple, INSERT OR REPLACE rend idempotent.
    return new Promise<DownloadResult>((resolve, reject) => {
      this.queue.push({
        id: `${book_id}:${Date.now()}`,
        versionCode,
        book_id,
        onProgress,
        resolve,
        reject,
        attempts: 0,
      });
      if (__DEV__) console.log(`[Queue] +1 (${this.queue.length} en attente) → ${book_id}`);
      void this.processQueue();
    });
  }

  /** Vue lecture-seule de l'état de la file (pour l'UI). */
  getQueueState() {
    return {
      processing: this.processing,
      pending: this.queue.length,
      jobs: this.queue.map((j) => ({ id: j.id, book_id: j.book_id })),
    };
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;
    try {
      while (this.queue.length > 0) {
        const job = this.queue.shift()!;
        try {
          const result = await this.runDownload(job);
          job.resolve(result);
        } catch (err) {
          job.attempts += 1;
          if (job.attempts <= MAX_RETRIES) {
            if (__DEV__) console.log(
              `[Queue] ⏳ ${job.book_id} : échec (tentative ${job.attempts}/${MAX_RETRIES}), réessai dans ${RETRY_DELAY_MS / 1000}s`
            );
            // Reprogrammer en fin de file après le délai, sans bloquer les autres jobs.
            setTimeout(() => {
              this.queue.push(job);
              void this.processQueue();
            }, RETRY_DELAY_MS);
          } else {
            if (__DEV__) console.log(`[Queue] ❌ ${job.book_id} : abandon après ${MAX_RETRIES} tentatives`);
            job.reject(err);
          }
        }
      }
    } finally {
      this.processing = false;
    }
  }

  private async runDownload(job: QueueJob): Promise<DownloadResult> {
    const { versionCode, book_id, onProgress } = job;
    await this.ensureConnection();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      if (__DEV__) console.log(`🔄 Téléchargement de ${book_id}...`);

      const response = await fetch(
        `https://nuvelserver.godigital.workers.dev/bible${versionCode}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = (await response.json()) as versets;
      clearTimeout(timeoutId);
      const verses = this.prepareVerses(book_id, data.content);

      if (__DEV__) console.log(`📝 ${verses.length} versets à insérer`);

      await this.insertBatch(book_id, verses, onProgress);

      if (__DEV__) console.log("✅ Téléchargement terminé");
      return { success: true, versesCount: verses.length };
    } catch (error) {
      // Nettoyage en cas d'échec : éviter un état partiel
      try {
        await this.db!.runAsync("DELETE FROM BibleContent WHERE book_id = ?", [book_id]);
        await this.db!.runAsync("DELETE FROM downloads WHERE version = ?", [book_id]);
      } catch {}
      console.error("❌ Erreur téléchargement:", error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
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
    book_id: string,
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

    const batchSize = 500;
    let inserted = 0;

    try {
      if (__DEV__) console.log(
        `🔄 Insertion de ${verses.length} versets par batch de ${batchSize}...`
      );

      // Transaction unique : versets + marqueur "downloads" → atomicité totale.
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
        }

        await this.db!.runAsync(
          "INSERT OR REPLACE INTO downloads (version, verses_count) VALUES (?, ?)",
          [book_id, verses.length]
        );
      });

      if (__DEV__) console.log(`✅ ${inserted} versets insérés avec succès`);
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
      if (__DEV__) console.log(`✅ Version ${book_id} supprimée`);
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
      if (__DEV__) console.log("✅ Connexion DB en bonne santé");
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
        if (__DEV__) console.log("✅ Connexion DB fermée");
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
