import { QueryForTable } from '@/constants/Queryuilder';
import * as Groups from '@/Database/groups';
import * as Notes from '@/Database/notes';
import * as Session from '@/Database/session';
import * as User from '@/Database/users';
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import type { Groups as GroupsType, Notes as NotesType, Session as SessionType, User as UserType } from '../Database/db';

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
    isLoading: boolean;
    error: DatabaseError | null;
    addNote: (noteData: Partial<NotesType>) => Promise<NotesType | undefined>;
    adduser: (data: UserType) => Promise<UserType | undefined>
    deletedUser: (id: string) => Promise<boolean | null>;
    updateNote: (noteData: Partial<NotesType>) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    toggleNotePinned: (note: NotesType) => Promise<void>;
    toggleNoteArchived: (note: NotesType) => Promise<void>;
    addNotetoGroup: (data: { id: string, grouped: string }) => Promise<NotesType>;
    addGroup: (data: GroupsType) => Promise<GroupsType>;
    updatedGroup: (data: GroupsType) => Promise<GroupsType>;
    deletedGroup: (id: string) => Promise<Boolean>;
    clearError: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
    const [notesQuery, setNotes] = useState<QueryForTable<NotesType> | null>(null);
    const [groupsQuery, setGroups] = useState<QueryForTable<GroupsType> | null>(null);
    const [usersQuery, setUsers] = useState<QueryForTable<UserType> | null>(null);
    const [session, setSession] = useState<SessionType | null>(null);

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

    const loadInitialData = useCallback(async () => {
        setIsLoading(true);
        await Notes.createdtable();
        await Groups.createtable();
        clearError();
        try {
            const [notesResult, groupesResult, sessionResult, userResult] = await Promise.all([
                Notes.getall(),
                Groups.getall(),
                Session.get(),
                User.getAll()
            ]);
            const notesArray = new QueryForTable<NotesType>(notesResult || []);
            const groupArray = new QueryForTable<GroupsType>(groupesResult || []);
            const userArray = new QueryForTable<UserType>(userResult || []);
            console.log(userResult)

            setUsers(userArray);
            setGroups(groupArray);
            setNotes(notesArray);
            setSession(sessionResult || null);
        } catch (error) {
            handleError(error, 'initial data loading');
        } finally {
            setIsLoading(false);
        }
    }, [handleError, clearError]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);



    const addNote = useCallback(async (noteData: NotesType) => {
        clearError();
        try {
            const result = await Notes.created(noteData);
            if (result) loadInitialData();
            return result;
        } catch (error) {
            handleError(error, 'adding note');
        }
    }, [loadInitialData]);

    const updateNote = useCallback(async (noteData: { id: string, body: string, version: number, html: string }) => {
        clearError();
        try {
            const result = await Notes.update(noteData);
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
            if (result) loadInitialData();
        } catch (error) {
            handleError(error, 'toggling note archive status');
        }
    }, [loadInitialData]);

    const addNotetoGroup = useCallback(async (data: NotesType) => {
        try {
            const result = await Notes.addtogroup(data);
            if (result) loadInitialData();

            return result;
        } catch (error) {
            handleError(error, 'adding note');
        }
    }, [loadInitialData])

    const addGroup = useCallback(async (data: GroupsType) => {
        clearError();
        try {
            const result = await Groups.created(data);
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

    // Optimisation avec useMemo pour la valeur du contexte
    const contextValue = useMemo(() => ({
        notesQuery,
        groupsQuery,
        usersQuery,
        session,
        isLoading,
        error,
        addNote,
        adduser,
        deletedUser,
        updateNote,
        deleteNote,
        toggleNotePinned,
        toggleNoteArchived,
        addNotetoGroup,
        addGroup,
        updatedGroup,
        deletedGroup,
        clearError
    }), [
        notesQuery,
        groupsQuery,
        usersQuery,
        session,
        isLoading,
        error,
        addNote,
        adduser,
        deletedUser,
        updateNote,
        deleteNote,
        toggleNotePinned,
        toggleNoteArchived,
        addNotetoGroup,
        addGroup,
        updatedGroup,
        deletedGroup,
        clearError
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