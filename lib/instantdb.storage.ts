import * as LocalStorage from '@/Database/localstorage';

/**
 * Custom storage adapter for InstantDB React Native
 * Utilise SQLite au lieu d'IndexedDB
 */
export class ReactNativeStorage {
    async get(key: string): Promise<any> {
        try {
            const value = await LocalStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('[InstantDB Storage] ❌ Error getting:', error);
            return null;
        }
    }

    async set(key: string, value: any): Promise<void> {
        try {
            await LocalStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('[InstantDB Storage] ❌ Error setting:', error);
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await LocalStorage.removeItem(key);
        } catch (error) {
            console.error('[InstantDB Storage] ❌ Error deleting:', error);
        }
    }

    async clear(): Promise<void> {
        console.log('[InstantDB Storage] ⚠️ Clear not implemented');
    }
}
