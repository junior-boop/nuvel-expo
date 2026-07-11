import AsyncStorage from '@react-native-async-storage/async-storage';
import { server_url } from '@/constants/server_url';
import NetInfo from '@react-native-community/netinfo';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { isOnline } from './network';
import { getAccessToken } from './token_system';

const QUEUE_KEY = 'error_report_queue';
const MAX_QUEUE_SIZE = 50;

type ErrorLevel = 'fatal' | 'error' | 'warning';

interface ErrorReport {
    message: string;
    stack?: string;
    level: ErrorLevel;
    platform: 'ios' | 'android' | 'web';
    appVersion?: string;
    environment: 'development' | 'production';
    screen?: string;
    extra?: Record<string, unknown>;
}

const getAppVersion = (): string | undefined => Constants.expoConfig?.version;

const getPlatform = (): ErrorReport['platform'] =>
    Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';

const buildReport = (
    error: unknown,
    level: ErrorLevel,
    context?: { screen?: string; extra?: Record<string, unknown> }
): ErrorReport => {
    const err = error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));
    return {
        message: err.message || 'Erreur inconnue',
        stack: err.stack,
        level,
        platform: getPlatform(),
        appVersion: getAppVersion(),
        environment: __DEV__ ? 'development' : 'production',
        screen: context?.screen,
        extra: context?.extra,
    };
};

const sendReports = async (reports: ErrorReport[]): Promise<boolean> => {
    try {
        const token = await getAccessToken();
        const response = await fetch(`${server_url}/errors/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ errors: reports }),
        });
        return response.ok;
    } catch {
        return false;
    }
};

const getQueue = async (): Promise<ErrorReport[]> => {
    try {
        const raw = await AsyncStorage.getItem(QUEUE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const setQueue = async (queue: ErrorReport[]) => {
    try {
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE_SIZE)));
    } catch {
        // ignore
    }
};

const enqueue = async (report: ErrorReport) => {
    const queue = await getQueue();
    queue.push(report);
    await setQueue(queue);
};

export const flushErrorQueue = async () => {
    const queue = await getQueue();
    if (queue.length === 0) return;
    if (!(await isOnline())) return;

    const sent = await sendReports(queue);
    if (sent) {
        await setQueue([]);
    }
};

export const reportError = async (
    error: unknown,
    context?: { screen?: string; extra?: Record<string, unknown>; level?: ErrorLevel }
) => {
    const report = buildReport(error, context?.level || 'error', context);
    if (__DEV__) console.error('[ErrorReporter]', report.message, report.stack);

    try {
        if (!(await isOnline())) {
            await enqueue(report);
            return;
        }
        const sent = await sendReports([report]);
        if (!sent) await enqueue(report);
    } catch {
        await enqueue(report);
    }
};

let initialized = false;

export const initErrorReporting = () => {
    if (initialized) return;
    initialized = true;

    const globalObj = global as any;
    const ErrorUtilsRef = globalObj.ErrorUtils;
    if (ErrorUtilsRef) {
        const originalHandler = ErrorUtilsRef.getGlobalHandler?.();
        ErrorUtilsRef.setGlobalHandler((error: Error, isFatal?: boolean) => {
            reportError(error, { level: isFatal ? 'fatal' : 'error', extra: { isFatal: !!isFatal } });
            originalHandler?.(error, isFatal);
        });
    }

    NetInfo.addEventListener((state) => {
        if (state.isConnected && state.isInternetReachable !== false) {
            flushErrorQueue();
        }
    });

    flushErrorQueue();
};
