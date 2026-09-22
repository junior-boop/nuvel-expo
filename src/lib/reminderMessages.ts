// Messages des rappels envoyés par la background task horaire.
// Volontairement autonome (aucun hook, aucun contexte) : la tâche s'exécute
// en mode headless, sans arbre React monté.

export type AppLanguage = 'fr' | 'en' | 'es';

export type ReminderContent = {
    title: string;
    body: string;
    data: { type: 'unread_reminder' | 'reading_reminder' };
};

type LanguagePack = {
    unreadTitle: string;
    unread: (count: number) => string;
    readingTitle: string;
    reading: string;
    readingWithArticle: (articleTitle: string) => string;
};

const PACKS: Record<AppLanguage, LanguagePack> = {
    fr: {
        unreadTitle: 'Notifications non lues',
        unread: (count) =>
            count === 1
                ? 'Vous avez 1 notification non lue.'
                : `Vous avez ${count} notifications non lues.`,
        readingTitle: 'Un article vous attend',
        reading: 'Prenez un moment pour lire un article aujourd’hui.',
        readingWithArticle: (articleTitle) => `« ${articleTitle} » vous attend. Prenez un moment pour le lire.`,
    },
    en: {
        unreadTitle: 'Unread notifications',
        unread: (count) =>
            count === 1
                ? 'You have 1 unread notification.'
                : `You have ${count} unread notifications.`,
        readingTitle: 'An article is waiting for you',
        reading: 'Take a moment to read an article today.',
        readingWithArticle: (articleTitle) => `“${articleTitle}” is waiting for you. Take a moment to read it.`,
    },
    es: {
        unreadTitle: 'Notificaciones sin leer',
        unread: (count) =>
            count === 1
                ? 'Tienes 1 notificación sin leer.'
                : `Tienes ${count} notificaciones sin leer.`,
        readingTitle: 'Un artículo te espera',
        reading: 'Tómate un momento para leer un artículo hoy.',
        readingWithArticle: (articleTitle) => `«${articleTitle}» te espera. Tómate un momento para leerlo.`,
    },
};

export const resolveLanguage = (language?: string | null): AppLanguage =>
    language === 'en' || language === 'es' ? language : 'fr';

export const buildReminder = (
    language: AppLanguage,
    unreadCount: number,
    articleTitle?: string | null
): ReminderContent => {
    const pack = PACKS[language];

    if (unreadCount > 0) {
        return {
            title: pack.unreadTitle,
            body: pack.unread(unreadCount),
            data: { type: 'unread_reminder' },
        };
    }

    return {
        title: pack.readingTitle,
        body: articleTitle ? pack.readingWithArticle(articleTitle) : pack.reading,
        data: { type: 'reading_reminder' },
    };
};
