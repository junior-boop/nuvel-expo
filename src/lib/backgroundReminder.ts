import { server_url } from '@/constants/server_url';
import * as Session from '@/Database/session';
import * as Users from '@/Database/users';
import * as BackgroundTask from 'expo-background-task';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import type { NotificationRow } from './notifications.api';
import { buildReminder, resolveLanguage } from './reminderMessages';
import { safeFetch } from './safeFetch';

export const HOURLY_REMINDER_TASK = 'nuvel-hourly-notifications-reminder';

// En minutes. L'OS ne traite cette valeur que comme un plancher : il peut
// espacer davantage les exécutions selon la batterie et l'usage de l'app.
const INTERVAL_MINUTES = 60;

type ArticleStatRow = { article?: { title?: string | null } | null };

const fetchUnreadCount = async (userId: string): Promise<number | null> => {
    const res = await safeFetch<{ notifications: NotificationRow[] }>(
        `${server_url}/notifications/${userId}`
    );
    if (!res.ok || !Array.isArray(res.data?.notifications)) return null;
    return res.data.notifications.filter((n) => !n.read).length;
};

const fetchSuggestedArticleTitle = async (): Promise<string | null> => {
    const res = await safeFetch<{ stats: ArticleStatRow[] }>(`${server_url}/articles/stats`);
    if (!res.ok || !Array.isArray(res.data?.stats)) return null;

    const titles = res.data.stats
        .map((stat) => stat.article?.title)
        .filter((title): title is string => !!title);
    if (titles.length === 0) return null;

    return titles[Math.floor(Math.random() * titles.length)];
};

TaskManager.defineTask(HOURLY_REMINDER_TASK, async () => {
    try {
        const session = await Session.get();
        // Déconnecté : rien à rappeler, mais la tâche reste enregistrée pour la
        // prochaine session sans avoir à la ré-enregistrer.
        if (!session?.iduser) return BackgroundTask.BackgroundTaskResult.Success;

        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') return BackgroundTask.BackgroundTaskResult.Success;

        const unreadCount = await fetchUnreadCount(session.iduser);
        if (unreadCount === null) return BackgroundTask.BackgroundTaskResult.Failed;

        const user = await Users.get(session.iduser);
        const language = resolveLanguage(user?.language);
        const articleTitle = unreadCount === 0 ? await fetchSuggestedArticleTitle() : null;
        const { title, body, data } = buildReminder(language, unreadCount, articleTitle);

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.DEFAULT,
            });
        }

        await Notifications.scheduleNotificationAsync({
            content: { title, body, data },
            trigger: null,
        });

        return BackgroundTask.BackgroundTaskResult.Success;
    } catch (error) {
        if (__DEV__) console.log('[BackgroundReminder] Erreur pendant la tâche', error);
        return BackgroundTask.BackgroundTaskResult.Failed;
    }
});

export const registerHourlyReminder = async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;

    try {
        const status = await BackgroundTask.getStatusAsync();
        if (status === BackgroundTask.BackgroundTaskStatus.Restricted) {
            if (__DEV__) console.log('[BackgroundReminder] Tâches de fond désactivées sur cet appareil');
            return false;
        }

        if (await TaskManager.isTaskRegisteredAsync(HOURLY_REMINDER_TASK)) return true;

        await BackgroundTask.registerTaskAsync(HOURLY_REMINDER_TASK, {
            minimumInterval: INTERVAL_MINUTES,
        });
        return true;
    } catch (error) {
        if (__DEV__) console.log('[BackgroundReminder] Enregistrement échoué', error);
        return false;
    }
};

export const unregisterHourlyReminder = async (): Promise<void> => {
    try {
        if (await TaskManager.isTaskRegisteredAsync(HOURLY_REMINDER_TASK)) {
            await BackgroundTask.unregisterTaskAsync(HOURLY_REMINDER_TASK);
        }
    } catch (error) {
        if (__DEV__) console.log('[BackgroundReminder] Désenregistrement échoué', error);
    }
};
