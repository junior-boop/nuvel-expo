import { QueryForTable } from '@/constants/Queryuilder';
import * as AiStore from '@/Database/ai';
import * as BibleMetadata from "@/Database/bible.metadata";
import * as Groups from '@/Database/groups';
import * as Notes from '@/Database/notes';
import * as Session from '@/Database/session';
import * as Sync from '@/Database/sync_event';
import { first_sync, Sync_to_serveur } from '@/Database/sync_online';
import * as User from '@/Database/users';
import { generateUUID as uuidv4 } from '@/Database/uuid';
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import type { AiHistoryType, BibleMetadata as BibleMetadataType, Groups as GroupsType, Notes as NotesType, Session as SessionType, User as UserType } from '../Database/db';

// Définition d'un type pour les erreurs de base de données
type DatabaseError = {
    message: string;
    code: string;
    details?: unknown;
};

// Interface améliorée avec gestion d'erreurs
interface DatabaseContextType {
    notesQuery: QueryForTable<NotesType> | null;
    groupsQuery: QueryForTable<GroupsType> | null;
    session: SessionType | null;
    usersQuery: QueryForTable<UserType> | null;
    biblemetadatState: QueryForTable<BibleMetadataType> | null;
    isLoading: boolean;
    error: DatabaseError | null;
    addNote: (noteData: Partial<NotesType>) => Promise<NotesType | undefined>;
    adduser: (data: UserType) => Promise<UserType | undefined>
    deletedUser: (id: string) => Promise<boolean | null>;
    updateNote: (noteData: Partial<NotesType>) => Promise<void>;
    publishNote: (noteData: { id: string, publishId: string, version: number }) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    toggleNotePinned: (note: NotesType) => Promise<void>;
    toggleNoteArchived: (note: NotesType) => Promise<void>;
    addNotetoGroup: (data: { id: string, grouped: string }) => Promise<NotesType>;
    addGroup: (data: GroupsType) => Promise<GroupsType>;
    updatedGroup: (data: GroupsType) => Promise<GroupsType>;
    deletedGroup: (id: string) => Promise<Boolean>;
    addBible: (data: BibleMetadataType) => Promise<Partial<BibleMetadataType> | undefined>;
    deletedBible: (id: string) => Promise<void>;
    clearError: () => void;
    getAiHistory: (id: string) => AiHistoryType[];
    setAiHistory: (data: {
        iduser: string,
        role: string,
        content: string,
    }) => AiHistoryType[]
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
    const [notesQuery, setNotes] = useState<QueryForTable<NotesType> | null>(null);
    const [groupsQuery, setGroups] = useState<QueryForTable<GroupsType> | null>(null);
    const [usersQuery, setUsers] = useState<QueryForTable<UserType> | null>(null);
    const [session, setSession] = useState<SessionType | null>(null);
    const [biblemetadatState, setBibleMetadataState] = useState<QueryForTable<BibleMetadataType> | null>(null);


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

    const syncToServer = useCallback(async () => {
        const session = await Session.get()
        if (session) {
            Sync_to_serveur()
        }

    }, [])

    const firstSync = useCallback(async () => {
        const session = await Session.get()
        if (session) {
            first_sync()
        }

    }, [])


    const loadInitialData = useCallback(async () => {
        setIsLoading(true);
        await Notes.createdtable()
        await Groups.createtable()
        await User.createTable()
        await Session.createTable()
        await BibleMetadata.createTable()
        await AiStore.createTable()
        await Sync.createEvent()

        await syncToServer()
        clearError();
        try {
            const [notesResult, groupesResult, sessionResult, userResult, bibleMetadataResult, Sync_EventResult] = await Promise.all([
                Notes.getall(),
                Groups.getall(),
                Session.get(),
                User.getAll(),
                BibleMetadata.getall(),
                Sync.getAll()
            ]);
            const notesArray = new QueryForTable<NotesType>(notesResult || []);
            const groupArray = new QueryForTable<GroupsType>(groupesResult || []);
            const userArray = new QueryForTable<UserType>(userResult || []);
            const bibleMetadataArray = new QueryForTable<BibleMetadataType>(bibleMetadataResult || []);

            console.log("Note length:", notesResult.length)
            console.log("Sync_event :", Sync_EventResult.length)

            setUsers(userArray);
            setGroups(groupArray);
            setNotes(notesArray);
            setSession(sessionResult || null);
            setBibleMetadataState(bibleMetadataArray)
        } catch (error) {
            handleError(error, 'initial data loading');
        } finally {
            setIsLoading(false);
        }
    }, [handleError, clearError]);



    useEffect(() => {
        firstSync()
        loadInitialData()
    }, [loadInitialData])

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

            const objet: Partial<Sync.Sync_Event> = {
                elementid: objdata.id,
                action: "CREATE",
                need_sync: true,
                table_name: "notes",
            }
            const sync = await Sync.Set(objet)
            console.log(`Sync_event ${objdata.id}`, sync)
            const result = await Notes.created(objdata);
            if (result) loadInitialData();
            return objdata;
        } catch (error) {
            handleError(error, 'adding note');
        }
    }, [loadInitialData]);

    const updateNote = useCallback(async (noteData: { id: string, body: string, version: number, html: string }) => {
        clearError();
        try {
            const result = await Notes.update(noteData);
            const objet: Partial<Sync.Sync_Event> = {
                elementid: noteData.id,
                action: "UPDATE",
                need_sync: true,
                table_name: "notes",
            }
            const sync = await Sync.Set(objet)
            console.log(`Sync_event updated ${noteData.id}`, sync)
            if (result) loadInitialData();
        } catch (error) {
            handleError(error, 'updating note');
        }
    }, [loadInitialData]);

    const publishNote = useCallback(async (noteData: { id: string, publishId: string, version: number }) => {
        clearError();
        try {
            const result = await Notes.publish(noteData);
            const objet: Partial<Sync.Sync_Event> = {
                elementid: noteData.id,
                action: "UPDATE",
                need_sync: true,
                table_name: "notes",
            }
            const sync = await Sync.Set(objet)
            console.log(`Sync_event updated ${noteData.id}`, sync)
            if (result) loadInitialData();
        } catch (error) {
            handleError(error, 'updating note');
        }
    }, [loadInitialData]);

    // Modifier deleteNote
    const deleteNote = useCallback(async (id: string) => {
        clearError();
        try {
            const result = await Notes.deleted(id);
            const objet: Partial<Sync.Sync_Event> = {
                elementid: id,
                action: "DELETE",
                need_sync: true,
                table_name: "notes",
            }
            const sync = await Sync.Set(objet)
            console.log(`Sync_event deleted ${id}`, sync)
            setNotes(new QueryForTable(notesQuery?.delete(id)))
            if (result) loadInitialData();
        } catch (error) {
            handleError(error, 'deleting note');
        }
    }, [handleError, clearError, loadInitialData]);

    // Modifier toggleNotePinned
    const toggleNotePinned = useCallback(async (note: NotesType) => {
        try {
            const updatedNote = { ...note, pinned: note.pinned };
            const result = await Notes.setpinned(updatedNote);
            const objet: Partial<Sync.Sync_Event> = {
                elementid: note.id,
                action: "UPDATE",
                need_sync: true,
                table_name: "notes",
            }
            const sync = await Sync.Set(objet)
            console.log(`Sync_event updated ${note.id}`, sync)
            if (result) loadInitialData();

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
            const objet: Partial<Sync.Sync_Event> = {
                elementid: note.id,
                action: "UPDATE",
                need_sync: true,
                table_name: "notes",
            }
            const sync = await Sync.Set(objet)
            console.log(`Sync_event updated ${note.id}`, sync)
            if (result) loadInitialData();
        } catch (error) {
            handleError(error, 'toggling note archive status');
        }
    }, [loadInitialData]);

    const addNotetoGroup = useCallback(async (data: NotesType) => {
        try {
            const result = await Notes.addtogroup(data);
            if (result) loadInitialData();
            const objet: Partial<Sync.Sync_Event> = {
                elementid: result?.id,
                action: "UPDATE",
                need_sync: true,
                table_name: "notes",
            }
            const sync = await Sync.Set(objet)
            console.log(`Sync_event updated ${result?.id}`, sync)
            return result;
        } catch (error) {
            handleError(error, 'adding note');
        }
    }, [loadInitialData])

    const addGroup = useCallback(async (data: GroupsType) => {
        clearError();
        try {
            const result = await Groups.created(data);
            const objet: Partial<Sync.Sync_Event> = {
                elementid: result.id,
                action: "CREATE",
                need_sync: true,
                table_name: "groups",
            }
            const sync = await Sync.Set(objet)
            console.log(`Sync_event created ${result.id}`, sync)
            if (result) loadInitialData();
            return result;
        } catch (error) {
            handleError(error, 'adding note');
        }
    }, [loadInitialData])

    const updatedGroup = useCallback(async (data: { id: string, name: string }) => {
        clearError();
        try {
            const result = await Groups.updated(data);
            const objet: Partial<Sync.Sync_Event> = {
                elementid: result?.id,
                action: "UPDATE",
                need_sync: true,
                table_name: "groups",
            }
            const sync = await Sync.Set(objet)
            console.log(`Sync_event updated ${result?.id}`, sync)
            if (result) loadInitialData();
            return result;
        } catch (error) {
            handleError(error, 'adding note');
        }
    }, [loadInitialData])

    const deletedGroup = useCallback(async (id: string) => {
        clearError();
        try {
            const result = await Groups.deleted(id);
            const objet: Partial<Sync.Sync_Event> = {
                elementid: id,
                action: "DELETE",
                need_sync: true,
                table_name: "groups",
            }
            const sync = await Sync.Set(objet)
            console.log(`Sync_event deleted ${id}`, sync)
            if (result) loadInitialData();
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
            if (result) loadInitialData();
            return result;
        } catch (error) {
            handleError(error, 'adding bible');
        }
    }, [loadInitialData])

    const deletedBible = useCallback(async (id: string) => {
        clearError();
        try {
            const result = await BibleMetadata.deleted(id);
            if (result) loadInitialData();
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
            console.log(error)
            handleError(error, 'deleting bible');
        }


    }, [loadInitialData, handleError])

    const setAiHistory = useCallback(async (id: string) => {

        clearError();
        try {
            const result = await AiStore.get(id)
            return result
        } catch (error) {
            console.log(error)
            handleError(error, 'deleting bible');
        }


    }, [loadInitialData, handleError])


    // Optimisation avec useMemo pour la valeur du contexte
    const contextValue = useMemo(() => ({
        notesQuery,
        groupsQuery,
        usersQuery,
        biblemetadatState,
        session,
        isLoading,
        error,
        addNote,
        adduser,
        deletedUser,
        updateNote,
        publishNote,
        deleteNote,
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
        setAiHistory
    }), [
        notesQuery,
        groupsQuery,
        usersQuery,
        biblemetadatState,
        session,
        isLoading,
        error,
        addNote,
        adduser,
        deletedUser,
        updateNote,
        publishNote,
        deleteNote,
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
        setAiHistory
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