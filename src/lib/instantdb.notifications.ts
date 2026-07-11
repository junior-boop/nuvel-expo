import { db } from './instantdb.init';

export const getNotifications = async (userId: string) => {
    try {
        const query = {
            notifications: {
                $: {
                    where: {
                        recipientUserId: userId,
                    },
                    order: {
                        createdAt: 'desc' as const,
                    },
                },
            },
        };
        const data = await db.queryOnce(query);
        return data;
    } catch (error) {
        if (__DEV__) console.log('[getNotifications] Error', error);
    }
};

export const markNotificationRead = async (notificationId: string) => {
    try {
        await db.transact(db.tx.notifications[notificationId].update({ read: true }));
    } catch (error) {
        if (__DEV__) console.log('[markNotificationRead] Error', error);
    }
};

export const markAllNotificationsRead = async (notificationIds: string[]) => {
    try {
        await db.transact(
            notificationIds.map((notificationId) =>
                db.tx.notifications[notificationId].update({ read: true })
            )
        );
    } catch (error) {
        if (__DEV__) console.log('[markAllNotificationsRead] Error', error);
    }
};
