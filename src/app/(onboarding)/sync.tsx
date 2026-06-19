import { Text, View } from "@/components/Themed";
import { FluentCloudArrowDown48Regular } from "@/constants/icons";
import { QueryForTable } from "@/constants/Queryuilder";
import { server_url } from "@/constants/server_url";
import { useDatabase } from "@/context/database.context";
import { Groups, Notes, User } from "@/Database/db";
import * as Group from '@/Database/groups';
import * as Note from '@/Database/notes';
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

export default function SyncNoteGroup() {
    const { usersQuery, setNotes, setGroups } = useDatabase()
    const { id } = useLocalSearchParams()
    const user = usersQuery?.findById(id as string)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const gerNotes = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`${server_url}/users/${user?.id}/notes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const result = await response.json() as User & { notes: { count: number, results: Notes[] }, groups: { count: number, results: Groups[] } }

            // Synchroniser les notes avec un délai de 300ms entre chaque
            const tabNotes = []
            for (const note of result.notes.results) {
                if (__DEV__) console.log(note.id)
                tabNotes.push(note)
                await SyncNote(note)
                // Attendre 300ms avant la prochaine note
                await new Promise(resolve => setTimeout(resolve, 200))
            }
            const notesArray = new QueryForTable<Notes>(tabNotes);
            setNotes(notesArray);

            const tabGroups = []
            for (const group of result.groups.results) {
                if (__DEV__) console.log(group.id)
                tabGroups.push(group)
                await SyncGroup(group)
                // Attendre 300ms avant la prochaine note
                await new Promise(resolve => setTimeout(resolve, 200))
            }
            const groupsArray = new QueryForTable<Groups>(tabGroups);
            setGroups(groupsArray);
            setTimeout(() => setIsLoading(false), 2000)
            navigateToHome()
        } catch (error) {
            if (__DEV__) console.log(error)
            setIsLoading(false)
        }
    }, [user])

    const SyncNote = useCallback(async (note: Notes) => {
        try {
            const check = await Note.get(note.id)
            if (check) {
                return
            }
            const t = await Note.created(note)
        } catch (error) {
            if (__DEV__) console.log(error)
        }
    }, [])
    const SyncGroup = useCallback(async (group: Groups) => {
        try {
            const check = await Group.get(group.id)
            if (check) {
                return
            }
            const t = await Group.created(group)
        } catch (error) {
            if (__DEV__) console.log(error)
        }
    }, [])

    useEffect(() => {
        if (user) {
            setTimeout(() => {
                gerNotes()
            }, 1000)
        }
    }, [user])



    const navigateToHome = useCallback(() => {
        const params = {
            id: user?.id,
            name: user?.name,
            first_name: user?.first_name,
            email: user?.email
        }
        router.replace('/(tabs)', params)
    }, [])
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <View>
                <FluentCloudArrowDown48Regular width={72} height={72} color={'black'} />
            </View>
            <Text style={{ fontSize: 16, width: 180, textAlign: 'center', padding: 10 }}>Synchronizing notes and groups</Text>

            <View style={{ position: 'absolute', bottom: 20 }}>
                {
                    isLoading ? (
                        <ActivityIndicator size="large" color="black" />
                    ) : (
                        <Text style={{ fontSize: 16, width: 180, textAlign: 'center', padding: 10 }}>Syncronized</Text>
                    )
                }
            </View>
        </View>
    )
}