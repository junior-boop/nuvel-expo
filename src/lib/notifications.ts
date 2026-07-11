import * as SyncMetadata from '@/Database/sync_metadata';
import { server_url } from '@/constants/server_url';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { apiRequest } from './token_system';

const DEVICE_ID_KEY = 'device_id';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const getDeviceId = async (): Promise<string> => {
    let deviceId = await SyncMetadata.get(DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = uuidv4();
        await SyncMetadata.set(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
};

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    if (!Device.isDevice) {
        if (__DEV__) console.log('[Notifications] Push notifications require a physical device');
        return null;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.DEFAULT,
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        if (__DEV__) console.log('[Notifications] Permission not granted');
        return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
        if (__DEV__) console.log('[Notifications] Missing EAS projectId');
        return null;
    }

    try {
        const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
        return token;
    } catch (error) {
        if (__DEV__) console.log('[Notifications] Error getting push token', error);
        return null;
    }
};

export const syncPushTokenWithServer = async () => {
    try {
        const token = await registerForPushNotificationsAsync();
        if (!token) return null;

        const deviceId = await getDeviceId();
        const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';

        await apiRequest(`${server_url}/notifications/register-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, platform, deviceId }),
        });

        return token;
    } catch (error) {
        if (__DEV__) console.log('[Notifications] Error syncing push token', error);
        return null;
    }
};

export const notifyServerOfCommentReply = async (params: {
    articleId: string;
    commentId: string;
    articleTitle?: string;
    content?: string;
}) => {
    try {
        await apiRequest(`${server_url}/notifications/comment-reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
    } catch (error) {
        if (__DEV__) console.log('[Notifications] Error notifying comment reply', error);
    }
};
