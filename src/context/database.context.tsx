import { QueryForTable } from '@/constants/Queryuilder';
import * as AiStore from '@/Database/ai';
import * as Articles from '@/Database/articles';
import * as BibleMetadata from "@/Database/bible.metadata";
import * as Groups from '@/Database/groups';

import * as LocalStorage from '@/Database/localstorage';
import * as Notes from '@/Database/notes';
import * as Session from '@/Database/session';
import * as Sync from '@/Database/sync_event';
import { first_sync, Sync_to_serveur } from '@/Database/sync_online';
import * as User from '@/Database/users';
import { generateUUID as uuidv4 } from '@/Database/uuid';
import { getHistoryForUser, HistoryType } from '@/lib/instantdb.histories';
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import { Alert } from 'react-native';
import type { AiHistoryType, Articles as ArticlesType, BibleMetadata as BibleMetadataType, Groups as GroupsType, Notes as NotesType, Session as SessionType, SyncEvent, User as UserType } from '../Database/db';

// Définition d'un type pour les erreurs de base de données
type DatabaseError = {
    message: string;
    code: string;
    details?: unknown;
};

// Interface améliorée avec gestion d'erreurs
interface DatabaseContextType {
    notesQuery: QueryForTable<NotesType> | null;
    setNotes: (notes: QueryForTable<NotesType>) => void;
    groupsQuery: QueryForTable<GroupsType> | null;
    setGroups: (groups: QueryForTable<GroupsType>) => void;
    session: SessionType | null;
    usersQuery: QueryForTable<UserType> | null;
    biblemetadatState: QueryForTable<BibleMetadataType> | null;
    articlesQuery: QueryForTable<ArticlesType> | null;
    isLoading: boolean;
    error: DatabaseError | null;
    addNote: (noteData: Partial<NotesType>) => Promise<NotesType | undefined>;
    adduser: (data: UserType) => Promise<UserType | undefined>
    updatedUser: (data: UserType) => Promise<UserType | undefined>
    deletedUser: (id: string) => Promise<boolean | null>;
    updateNote: (noteData: Partial<NotesType>) => Promise<void>;
    publishNote: (noteData: { id: string, publishId: string, version: number }) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    clearAllUserData: () => Promise<boolean>;
    toggleNotePinned: (note: NotesType) => Promise<void>;
    toggleNoteArchived: (note: NotesType) => Promise<void>;
    addNotetoGroup: (data: { id: string, grouped: string }) => Promise<NotesType>;
    addGroup: (data: GroupsType, userid: string) => Promise<GroupsType>;
    updatedGroup: (data: GroupsType) => Promise<GroupsType>;
    deletedGroup: (id: string, userid: string) => Promise<Boolean>;
    addBible: (data: BibleMetadataType) => Promise<Partial<BibleMetadataType> | undefined>;
    deletedBible: (id: string) => Promise<void>;
    clearError: () => void;
    getAiHistory: (id: string) => AiHistoryType[];
    setAiHistory: (data: {
        iduser: string,
        role: string,
        content: string,
    }) => AiHistoryType[],
    addArticle: (data: ArticlesType) => Promise<ArticlesType | undefined>,
    getallArticle: () => ArticlesType[],
    deletedArticle: (id: string) => Promise<void>,
    historyQuery: QueryForTable<HistoryType> | null,
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
    const [notesQuery, setNotes] = useState<QueryForTable<NotesType> | null>(null);
    const [groupsQuery, setGroups] = useState<QueryForTable<GroupsType> | null>(null);
    const [usersQuery, setUsers] = useState<QueryForTable<UserType> | null>(null);
    const [session, setSession] = useState<SessionType | null>(null);
    const [biblemetadatState, setBibleMetadataState] = useState<QueryForTable<BibleMetadataType> | null>(null);
    const [articlesQuery, setArticles] = useState<QueryForTable<ArticlesType> | null>(null);
    const [historyQuery, setHistory] = useState<QueryForTable<HistoryType> | null>(null);


    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<DatabaseError | null>(null);


    const handleError = useCallback((error: unknown, operation: string) => {
        const dbError: DatabaseError = {
            message: `Error during ${operation}`,
            code: 'DB_ERROR',
            details: error
        };
        setError(dbError);
        console.error(`Database error during ${operation}:`, error);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Sync best-effort en arrière-plan. Ne jamais throw, ne jamais bloquer l'UI.
    const syncToServer = useCallback(() => {
        Session.get().then(session => {
            if (!session) return;
            Sync_to_serveur().catch(e => { if (__DEV__) console.log('[Database] sync background error:', e); });
        }).catch(() => {});
    }, []);

    const firstSync = useCallback(() => {
        Session.get().then(session => {
            if (!session) return;
            first_sync().catch(e => { if (__DEV__) console.log('[Database] first_sync background error:', e); });
        }).catch(() => {});
    }, []);

    // Recharge uniquement depuis SQLite — n'appelle JAMAIS le réseau.
    const refreshLocalData = useCallback(async () => {
        try {
            const [notesResult, groupesResult, sessionResult, userResult, bibleMetadataResult, articlesResult] = await Promise.all([
                Notes.getall(),
                Groups.getall(),
                Session.get(),
                User.getAll(),
                BibleMetadata.getall(),
                Articles.getall(),
            ]);
            setNotes(new QueryForTable<NotesType>(notesResult || []));
            setGroups(new QueryForTable<GroupsType>(groupesResult || []));
            setUsers(new QueryForTable<UserType>(userResult || []));
            setBibleMetadataState(new QueryForTable<BibleMetadataType>(bibleMetadataResult || []));
            setArticles(new QueryForTable<ArticlesType>(articlesResult || []));
            setSession(sessionResult || null);
        } catch (error) {
            handleError(error, 'local data refresh');
        }
    }, [handleError]);

    const loadInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            await Notes.createdtable();
            await Groups.createtable();
            await User.createTable();
            await Session.createTable();
            await BibleMetadata.createTable();
            await AiStore.createTable();
            await Sync.createEvent();
            await Articles.createTable();
            await LocalStorage.createTable();

            try {
                const { createTable } = await import('@/Database/sync_metadata');
                await createTable();
                if (__DEV__) console.log('[Database] ✅ sync_metadata table initialized');
            } catch (error) {
                if (__DEV__) console.log('[Database] sync_metadata table creation skipped:', error);
            }

            try {
                const { createTable } = await import('@/Database/sync_state');
                await createTable();
                if (__DEV__) console.log('[Database] ✅ sync_state table initialized');
            } catch (error) {
                if (__DEV__) console.log('[Database] sync_state table creation skipped:', error);
            }

            // Phase 5 — migration one-shot: seed sync_state depuis notes/groups existants.
            try {
                const SyncMetadata = await import('@/Database/sync_metadata');
                const flag = await SyncMetadata.get('sync_state.seeded');
                if (flag !== '1') {
                    const sessionResult = await Session.get();
                    const uid = sessionResult?.iduser;
                    if (uid) {
                        const { seedFromExisting } = await import('@/Database/sync_state');
                        const counts = await seedFromExisting(uid);
                        await SyncMetadata.set('sync_state.seeded', '1');
                        if (__DEV__) console.log('[Database] ✅ sync_state seeded', counts);
                    } else if (__DEV__) {
                        console.log('[Database] sync_state seed skipped: no session');
                    }
                }
            } catch (error) {
                if (__DEV__) console.log('[Database] sync_state seed skipped:', error);
            }

            clearError();

            // 1. Charger les données locales en premier — UI prête immédiatement, même offline.
            await refreshLocalData();

            // 2. Charger l'historique distant en best-effort, sans bloquer.
            try {
                const sessionResult = await Session.get();
                if (sessionResult?.iduser) {
                    getHistoryForUser(sessionResult.iduser)
                        .then(historyResponse => {
                            setHistory(new QueryForTable<HistoryType>(historyResponse?.data?.histories || []));
                        })
                        .catch(e => { if (__DEV__) console.log('[Database] history fetch failed:', e); });
                }
            } catch (e) {
                if (__DEV__) console.log('[Database] history step skipped:', e);
            }

            // 3. Déclencher la sync serveur en arrière-plan, jamais bloquante.
            firstSync();
            syncToServer();
        } catch (error) {
            handleError(error, 'initial data loading');
        } finally {
            setIsLoading(false);
        }
    }, [handleError, clearError, refreshLocalData, firstSync, syncToServer]);


    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);




    const addNote = useCallback(async (noteData: NotesType) => {
        clearError();
        try {
            const objdata = {
                id: uuidv4(),
                body: noteData.body,
                html: noteData.html,
                creator: noteData.creator,
                pinned: noteData.pinned,
                archived: noteData.archived,
                grouped: noteData.grouped,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                version: 1
            }
            setNotes(new QueryForTable(notesQuery?.add(objdata)))

            const objet: Partial<SyncEvent> = {
                userId: noteData.creator || session?.iduser,
                entityId: objdata.id,
                entityType: "notes",
                deviceId: null,
                action: "created",
                synced: 1,
            }
            const sync = await Sync.Set(objet)
            if (__DEV__) console.log(`Sync_event ${objdata.id}`, sync)
            const result = await Notes.created(objdata);
            if (result) { refreshLocalData(); syncToServer(); }
            return objdata;
        } catch (error) {
            handleError(error, 'adding note');
        }
    }, [loadInitialData]);

    const updateNote = useCallback(async (noteData: { id: string, body: string, version: number, html: string, userId: string }) => {
        clearError();
        try {
            const result = await Notes.update(noteData);
            const objet: Partial<SyncEvent> = {
                userId: noteData.userId,
                entityId: noteData.id,
                entityType: "notes",
                deviceId: null,
                action: "updated",
                synced: 1,
            }
            const sync = await Sync.Set(objet)
            if (__DEV__) console.log(`Sync_event updated ${noteData.id}`, sync)
            if (result) { refreshLocalData(); syncToServer(); }
        } catch (error) {
            handleError(error, 'updating note');
        }
    }, [loadInitialData]);

    const publishNote = useCallback(async (noteData: { id: string, body: string, version: number, html: string, userId: string }) => {
        clearError();
        try {
            const result = await Notes.publish(noteData);
            const objet: Partial<SyncEvent> = {
                userId: noteData.userId,
                entityId: noteData.id,
                entityType: "notes",
                deviceId: null,
                action: "updated",
                synced: 1,
            }
            const sync = await Sync.Set(objet)
            if (__DEV__) console.log(`Sync_event updated ${noteData.id}`, sync)
            if (result) { refreshLocalData(); syncToServer(); }
        } catch (error) {
            handleError(error, 'updating note');
        }
    }, [loadInitialData]);

    // Modifier deleteNote
    const deleteNote = useCallback(async (id: string) => {
        clearError();
        try {
            const result = await Notes.deleted(id);
            setNotes(new QueryForTable(notesQuery?.delete(id)))
            const objet: Partial<SyncEvent> = {
                userId: session?.iduser,
                entityId: id,
                entityType: "notes",
                deviceId: null,
                action: "deleted",
                synced: 1,
            }
            const sync = await Sync.Set(objet)
            if (__DEV__) console.log(`Sync_event deleted ${id}`, sync)
            if (result) { refreshLocalData(); syncToServer(); }
        } catch (error) {
            handleError(error, 'deleting note');
        }
    }, [handleError, clearError, loadInitialData, session, notesQuery]);

    const clearAllUserData = useCallback(async (): Promise<boolean> => {
        try {
            // 1. Afficher une confirmation
            Alert.alert("Are you sure?", "This operation will delete all your data in your device", [
                {
                    text: "Cancel",
                    onPress: () => { if (__DEV__) console.log("Cancel"); },
                    style: "cancel",
                },
                {
                    text: "Delete",
                    onPress: async () => {
                        // 2. Supprimer toutes les notes
                        await Notes.deletedall()

                        // 3. Supprimer tous les groupes
                        await Groups.deletedall()

                        // 4. Supprimer les sync events (optionnel)
                        await Sync.deletedall()

                        // 5. Rafraîchir les états
                        setNotes(new QueryForTable([]))
                        setGroups(new QueryForTable([]))

                        // 6. Log success
                        if (__DEV__) console.log('[Database] ✅ Toutes les données utilisateur supprimées')
                    }
                }
            ])


            return true
        } catch (error) {
            console.error('[Database] ❌ Erreur lors de la suppression:', error)
            return false
        }
    }, []);

    // Modifier toggleNotePinned
    const toggleNotePinned = useCallback(async (note: NotesType) => {
        try {
            const updatedNote = { ...note, pinned: note.pinned };
            const result = await Notes.setpinned(updatedNote);
            const objet: Partial<SyncEvent> = {
                userId: note.creator,
                entityId: note.id,
                entityType: "notes",
                deviceId: null,
                action: "updated",
                synced: 1,
            }
            const sync = await Sync.Set(objet)
            if (__DEV__) console.log(`Sync_event updated ${note.id}`, sync)
            if (result) { refreshLocalData(); syncToServer(); }

        } catch (error) {
            handleError(error, 'toggling note pin status');
        }
    }, [loadInitialData]);

    // Modifier toggleNoteArchived
    const toggleNoteArchived = useCallback(async (note: NotesType) => {
        clearError();
        try {
            const updatedNote = { ...note, archived: note.archived };
            const result = await Notes.update(updatedNote);
            const objet: Partial<SyncEvent> = {
                userId: note.creator,
                entityId: note.id,
                entityType: "notes",
                deviceId: null,
                action: "updated",
                synced: 1,
            }
            const sync = await Sync.Set(objet)
            if (__DEV__) console.log(`Sync_event updated ${note.id}`, sync)
            if (result) { refreshLocalData(); syncToServer(); }
        } catch (error) {
            handleError(error, 'toggling note archive status');
        }
    }, [loadInitialData]);

    const addNotetoGroup = useCallback(async (data: NotesType) => {
        try {
            const result = await Notes.addtogroup(data);
            if (result) { refreshLocalData(); syncToServer(); }
            const objet: Partial<SyncEvent> = {
                userId: data.creator,
                entityId: result?.id,
                entityType: "notes",
                deviceId: null,
                action: "updated",
                synced: 1,
            }
            const sync = await Sync.Set(objet)
            if (__DEV__) console.log(`Sync_event updated ${result?.id}`, sync)
            return result;
        } catch (error) {
            handleError(error, 'adding note');
        }
    }, [loadInitialData])

    const addGroup = useCallback(async (data: GroupsType, userid: string) => {
        if (__DEV__) console.log('loadInitialData')
        loadInitialData()
        clearError();
        try {
            const result = await Groups.created(data);
            const objet: Partial<SyncEvent> = {
                userId: userid,
                entityId: result.id,
                entityType: "groups",
                deviceId: null,
                action: "created",
                synced: 1,
            }
            const sync = await Sync.Set(objet)
            if (__DEV__) console.log(`Sync_event created ${result.id}`, sync)
            if (result) { refreshLocalData(); syncToServer(); }
            return result;
        } catch (error) {
            handleError(error, 'adding note');
        }
    }, [loadInitialData])

    const updatedGroup = useCallback(async (data: { id: string, name: string }) => {
        clearError();
        try {
            const result = await Groups.updated(data);
            const objet: Partial<SyncEvent> = {
                userId: session?.iduser,
                entityId: result?.id,
                entityType: "groups",
                deviceId: null,
                action: "updated",
                synced: 1,
            }
            const sync = await Sync.Set(objet)
            if (__DEV__) console.log(`Sync_event updated ${result?.id}`, sync)
            if (result) { refreshLocalData(); syncToServer(); }
            return result;
        } catch (error) {
            handleError(error, 'adding note');
        }
    }, [loadInitialData])

    const deletedGroup = useCallback(async (id: string, userid: string) => {
        clearError();
        try {
            const result = await Groups.deleted(id);
            const objet: Partial<SyncEvent> = {
                userId: userid,
                entityId: id,
                entityType: "groups",
                deviceId: null,
                action: "deleted",
                synced: 1,
            }
            const sync = await Sync.Set(objet)
            if (__DEV__) console.log(`Sync_event deleted ${id}`, sync)
            if (result) { refreshLocalData(); syncToServer(); }
            return result;
        } catch (error) {
            handleError(error, 'adding note');
        }
    }, [loadInitialData])

    const adduser = useCallback(async (data: UserType) => {
        clearError();
        try {
            await Session.set(data)
            const result = await User.created(data);
            if (result) loadInitialData()

            return result;
        }
        catch (error) {
            handleError(error, 'adding note');
        }
    }, [loadInitialData])

    const updatedUser = useCallback(async (data: UserType) => {
        clearError();
        try {
            const result = await User.updated(data);
            if (result) loadInitialData()

            return result;
        }
        catch (error) {
            handleError(error, 'adding note');
        }
    }, [loadInitialData])

    const deletedUser = useCallback(async (id: string) => {
        clearError();
        try {
            await Session.deleted()
            const result = await User.deleted(id);
            if (result) loadInitialData()

            return result;
        }
        catch (error) {
            handleError(error, 'adding note');
        }
    }, [loadInitialData])

    const addBible = useCallback(async (data: BibleMetadataType) => {
        clearError();
        try {
            const result = await BibleMetadata.created(data);
            if (result) { refreshLocalData(); syncToServer(); }
            return result;
        } catch (error) {
            handleError(error, 'adding bible');
        }
    }, [loadInitialData])

    const deletedBible = useCallback(async (id: string) => {
        clearError();
        try {
            const result = await BibleMetadata.deleted(id);
            if (result) { refreshLocalData(); syncToServer(); }
            return result
        } catch (error) {
            handleError(error, 'deleting bible');
        }
    }, [loadInitialData])

    const getAiHistory = useCallback(async (id: string) => {
        clearError();
        try {
            const result = await AiStore.get(id)
            return result
        } catch (error) {
            if (__DEV__) console.log(error)
            handleError(error, 'deleting bible');
        }


    }, [loadInitialData, handleError])

    const setAiHistory = useCallback(async (id: string) => {

        clearError();
        try {
            const result = await AiStore.get(id)
            return result
        } catch (error) {
            if (__DEV__) console.log(error)
            handleError(error, 'deleting bible');
        }


    }, [loadInitialData, handleError])


    const addArticle = useCallback(async (data: ArticlesType) => {
        clearError();
        try {
            const result = await Articles.created({ ...data, user: JSON.stringify(data.user) });

            if (result) { refreshLocalData(); syncToServer(); }
            return result;
        } catch (error) {
            handleError(error, 'adding article');
        }
    }, [loadInitialData])

    const getallArticle = useCallback(async () => {
        clearError();
        try {
            const result = await Articles.getall();
            if (result) { refreshLocalData(); syncToServer(); }
            return result;
        } catch (error) {
            handleError(error, 'adding article');
        }
    }, [loadInitialData])

    const deletedArticle = useCallback(async (id: string) => {
        clearError();
        try {
            const result = await Articles.deleted(id);
            if (result) { refreshLocalData(); syncToServer(); }
            return result;
        } catch (error) {
            handleError(error, 'adding article');
        }
    }, [loadInitialData])

    // Optimisation avec useMemo pour la valeur du contexte
    const contextValue = useMemo(() => ({
        notesQuery,
        setNotes,
        groupsQuery,
        setGroups,
        usersQuery,
        biblemetadatState,
        session,
        isLoading,
        error,
        addNote,
        adduser,
        updatedUser,
        deletedUser,
        updateNote,
        publishNote,
        deleteNote,
        clearAllUserData,
        toggleNotePinned,
        toggleNoteArchived,
        addNotetoGroup,
        addGroup,
        addBible,
        deletedBible,
        updatedGroup,
        deletedGroup,
        clearError,
        getAiHistory,
        setAiHistory,
        addArticle,
        getallArticle,
        deletedArticle,
        articlesQuery,
        historyQuery
    }), [
        notesQuery,
        setNotes,
        groupsQuery,
        setGroups,
        usersQuery,
        biblemetadatState,
        session,
        isLoading,
        error,
        addNote,
        adduser,
        updatedUser,
        deletedUser,
        updateNote,
        publishNote,
        deleteNote,
        clearAllUserData,
        toggleNotePinned,
        toggleNoteArchived,
        addNotetoGroup,
        addGroup,
        addBible,
        deletedBible,
        updatedGroup,
        deletedGroup,
        clearError,
        getAiHistory,
        setAiHistory,
        addArticle,
        getallArticle,
        deletedArticle,
        articlesQuery,
        historyQuery
    ]);

    return (
        <DatabaseContext.Provider value={contextValue}>
            {children}
        </DatabaseContext.Provider>
    );
};

export const useDatabase = () => {
    const context = useContext(DatabaseContext);
    if (context === undefined) {
        throw new Error('useDatabase must be used within a DatabaseProvider');
    }
    return context;
};