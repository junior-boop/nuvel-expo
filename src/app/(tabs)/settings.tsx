import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { Stack } from 'expo-router';

import { PageLayout_3 } from '@/components/page';
import { w } from '@/constants/Colors';
import { BxsBible, FluentChevronRight32Regular } from '@/constants/icons';
import { useDatabase } from "@/context/database.context";
import type { Notes as NotesType } from '@/Database/db';
import * as SyncMetadata from '@/Database/sync_metadata';
import { Sync_to_serveur } from '@/Database/sync_online';
import { HistoryType } from '@/lib/instantdb.histories';
import * as Clipboard from 'expo-clipboard';
import { router } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';

export default function TabTwoScreen() {
  const { usersQuery, session, biblemetadatState } = useDatabase()
  const userinfo = usersQuery?.findById(session?.iduser as string)
  const biblelist = biblemetadatState?.findAll()
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <PageLayout_3>

      <StatusBar style="dark" backgroundColor='white' />
      <Stack.Screen options={{ headerShown: false, headerShadowVisible: false, title: "Settings" }} />

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} size={"default"} />}>
        <View style={{ justifyContent: 'center', height: convert(32), width: w }}></View>
        <Text style={{ ...styles.headerTitle, marginHorizontal: convert(16), marginBottom: convert(16) }}>Settings</Text>
        <Text style={{ ...styles.title, marginBottom: convert(16), paddingHorizontal: convert(16) }}>Account</Text>
        <View style={{ paddingHorizontal: convert(16) }}>
          <View style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee' }}>
            <Text style={{ fontSize: convert(16), fontWeight: 'bold' }}>Email adress</Text>
            <Text style={{ fontSize: convert(16) }}>{userinfo?.email}</Text>
          </View>
        </View>
        <View style={{ paddingHorizontal: convert(16) }}>
          <View style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee' }}>
            <Text style={{ fontSize: convert(16), fontWeight: 'bold' }}>User Name</Text>
            <Text style={{ fontSize: convert(16) }}>{userinfo?.name} {userinfo?.first_name}</Text>
          </View>
        </View>
        <View style={{ paddingHorizontal: convert(16) }}>
          <TouchableOpacity onPress={() => router.navigate('/profils')} style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee', flexDirection: 'row', alignItems: 'center', justifyContent: "space-between" }}>
            <View>
              <Text style={{ fontSize: convert(16), fontWeight: 'bold' }}>Profils information</Text>
              <Text style={{ fontSize: convert(16) }}>Edit your name, bio, photo, etc...</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "space-between", gap: convert(6) }}>
              <Image
                style={{ width: convert(32), height: convert(32), borderRadius: convert(16), borderWidth: 1, borderColor: '#eee' }}
                source={userinfo?.photo ? { uri: `https://${userinfo?.photo}` } : require("../../../assets/images/avatar.png")} />
              <View style={{ width: convert(20), height: convert(20) }}>
                <FluentChevronRight32Regular width={convert(20)} height={convert(20)} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40, width: 200, paddingHorizontal: convert(16) }} />
        <Text style={{ ...styles.title, marginBottom: convert(16), paddingHorizontal: convert(16) }}>History</Text>
        <History />
        <View style={{ height: 40, width: 200, paddingHorizontal: convert(16) }} />
        <Text style={{ ...styles.title, marginBottom: convert(16), paddingHorizontal: convert(16) }}>App</Text>
        <UpdatesSection />
        <View style={{ height: 40, width: 200, paddingHorizontal: convert(16) }} />
        <Text style={{ ...styles.title, marginBottom: convert(16), paddingHorizontal: convert(16) }}>Data</Text>
        <DataSection />
        <View style={{ height: 40, width: 200, paddingHorizontal: convert(16) }} />
        <Text style={{ ...styles.title, marginBottom: convert(16), paddingHorizontal: convert(16) }}>Bible Downloads</Text>
        {
          biblelist?.length === 0 && (<View style={{ paddingHorizontal: convert(16) }}>
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: convert(16), color: "#777", fontStyle: 'italic' }}>
                No Bibles available rigth now. Just click "Add a Bible" to upload one
              </Text>
            </View>
          </View>)
        }
        <View style={{ marginBottom: convert(14), gap: 8, paddingHorizontal: convert(16) }}>
          {
            biblelist?.map((bible, index) => (
              <View style={{ backgroundColor: '#004f9913', padding: 14 }} key={index}>
                <Text style={{ fontWeight: 'bold', fontSize: convert(16) }}>{bible.name}</Text>
              </View>))
          }
        </View>
        <View style={{ paddingHorizontal: convert(16) }}>
          <TouchableOpacity onPress={() => router.navigate('/biblepage')} style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee', flexDirection: 'row', alignItems: 'center', justifyContent: "space-between" }}>
            <View>
              <Text style={{ fontSize: convert(16), fontWeight: 'bold' }}>Add a Bible</Text>
              <Text style={{ fontSize: convert(16), width: convert(w * 70 / 100) }}>Download the version you'll use in your notes</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "space-between", gap: convert(6) }}>
              <BxsBible width={convert(28)} height={convert(28)} color={'#333'} />
              <FluentChevronRight32Regular width={convert(20)} height={convert(20)} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ height: convert(16) }} />
      </ScrollView>
    </PageLayout_3>
  );
}



const History = () => {
  const { historyQuery } = useDatabase()

  const histories = historyQuery?.limit(5)

  useEffect(() => {
    if (__DEV__) console.log("histories", histories)
  }, [histories])
  return (
    <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: convert(16), gap: convert(12) }}>
      {
        histories?.map((history, index) => (
          <HistoryItems key={index} history={history} />
        ))
      }
      <TouchableOpacity onPress={() => router.navigate('/history')} style={{ width: convert(150), aspectRatio: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: convert(8), backgroundColor: '#004f9909', flexDirection: "row", gap: convert(8) }}>
        <Text style={{ fontSize: convert(16), fontWeight: 'bold' }}>See more</Text>
        <FluentChevronRight32Regular width={convert(20)} height={convert(20)} />
      </TouchableOpacity>
    </ScrollView>
  )
}

const stripHtml = (html: string) =>
  (html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

const noteTitle = (n: NotesType) => {
  const text = stripHtml(n.html || n.body || '')
  return text ? text.slice(0, 60) : 'Untitled'
}

type UpdateStatus = 'idle' | 'checking' | 'up-to-date' | 'downloading' | 'ready' | 'error'

const UpdatesSection = () => {
  const [status, setStatus] = useState<UpdateStatus>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const currentInfo = Updates.isEmbeddedLaunch
    ? 'Version intégrée au build (aucune mise à jour OTA appliquée pour le moment).'
    : Updates.createdAt
      ? `Mise à jour installée le ${moment(Updates.createdAt).format('DD/MM/YYYY [à] HH:mm')}.`
      : 'Version actuelle inconnue.'

  const handleCheck = async () => {
    if (!Updates.isEnabled) {
      Alert.alert('Indisponible', "Les mises à jour OTA ne sont pas actives dans cet environnement (build de développement).")
      return
    }
    setErrorMsg(null)
    setStatus('checking')
    try {
      const result = await Updates.checkForUpdateAsync()
      if (!result.isAvailable) {
        setStatus('up-to-date')
        return
      }
      setStatus('downloading')
      await Updates.fetchUpdateAsync()
      setStatus('ready')
    } catch (e) {
      if (__DEV__) console.log('[Updates] erreur vérification:', e)
      setErrorMsg("Impossible de vérifier les mises à jour. Vérifiez votre connexion.")
      setStatus('error')
    }
  }

  const handleRestart = async () => {
    try {
      await Updates.reloadAsync()
    } catch (e) {
      if (__DEV__) console.log('[Updates] erreur redémarrage:', e)
      Alert.alert('Erreur', "Impossible de redémarrer l'application. Redémarrez-la manuellement.")
    }
  }

  const subtitle = () => {
    switch (status) {
      case 'checking': return 'Vérification en cours...'
      case 'up-to-date': return "Vous utilisez déjà la dernière version disponible."
      case 'downloading': return 'Téléchargement de la mise à jour...'
      case 'ready': return 'Mise à jour téléchargée. Appuyez pour redémarrer et l\'appliquer.'
      case 'error': return errorMsg ?? 'Une erreur est survenue.'
      default: return currentInfo
    }
  }

  const busy = status === 'checking' || status === 'downloading'

  return (
    <View style={{ paddingHorizontal: convert(16) }}>
      <TouchableOpacity
        disabled={busy}
        onPress={status === 'ready' ? handleRestart : handleCheck}
        style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee', flexDirection: 'row', alignItems: 'center', justifyContent: "space-between" }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: convert(16), fontWeight: 'bold' }}>{status === 'ready' ? 'Redémarrer pour appliquer' : 'Rechercher une mise à jour'}</Text>
          <Text style={{ fontSize: convert(14), color: '#777' }}>{subtitle()}</Text>
        </View>
        <View style={{ width: convert(20), height: convert(20) }}>
          {busy
            ? <ActivityIndicator size={'small'} color={'#048effff'} />
            : <FluentChevronRight32Regular width={convert(20)} height={convert(20)} />}
        </View>
      </TouchableOpacity>
    </View>
  )
}

const DataSection = () => {
  const { notesQuery, groupsQuery } = useDatabase()
  const notes = notesQuery?.findAll() ?? []
  const groups = groupsQuery?.findAll() ?? []
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  const loadLastSync = useCallback(async () => {
    const v = await SyncMetadata.get('last_sync')
    setLastSync(v)
  }, [])

  useEffect(() => { loadLastSync() }, [loadLastSync])

  const buildJson = () => JSON.stringify({
    exportedAt: new Date().toISOString(),
    notes,
    groups,
  }, null, 2)

  const buildMarkdown = () => {
    const lines: string[] = [`# Notes export`, `_${new Date().toISOString()}_`, '']
    for (const g of groups) {
      lines.push(`## ${(g as any).name ?? 'Group'}`, '')
      const ofGroup = notes.filter(n => n.grouped === (g as any).id)
      for (const n of ofGroup) {
        lines.push(`### ${noteTitle(n)}`, '', stripHtml(n.html || n.body || ''), '')
      }
    }
    const ungrouped = notes.filter(n => !n.grouped)
    if (ungrouped.length) {
      lines.push(`## Ungrouped`, '')
      for (const n of ungrouped) {
        lines.push(`### ${noteTitle(n)}`, '', stripHtml(n.html || n.body || ''), '')
      }
    }
    return lines.join('\n')
  }

  const exportTo = async (kind: 'json' | 'md') => {
    try {
      const payload = kind === 'json' ? buildJson() : buildMarkdown()
      await Clipboard.setStringAsync(payload)
      Alert.alert('Exported', `${notes.length} notes copied to clipboard as ${kind.toUpperCase()}.`)
    } catch (e) {
      console.error('[Settings] export error:', e)
      Alert.alert('Error', 'Could not export notes.')
    }
  }

  const forceSync = async () => {
    try {
      setSyncing(true)
      await Sync_to_serveur()
      const now = new Date().toISOString()
      await SyncMetadata.set('last_sync', now)
      setLastSync(now)
      Alert.alert('Sync', 'Sync completed.')
    } catch (e) {
      console.error('[Settings] force sync error:', e)
      Alert.alert('Error', 'Sync failed. Please try again.')
    } finally {
      setSyncing(false)
    }
  }

  const Row = ({ title, subtitle, onPress, disabled, loading }: { title: string, subtitle: string, onPress: () => void, disabled?: boolean, loading?: boolean }) => (
    <TouchableOpacity disabled={disabled} onPress={onPress} style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee', flexDirection: 'row', alignItems: 'center', justifyContent: "space-between" }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: convert(16), fontWeight: 'bold' }}>{title}</Text>
        <Text style={{ fontSize: convert(16) }}>{subtitle}</Text>
      </View>
      <View style={{ width: convert(20), height: convert(20) }}>
        {loading
          ? <ActivityIndicator size={'small'} color={'#048effff'} />
          : <FluentChevronRight32Regular width={convert(20)} height={convert(20)} />}
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={{ paddingHorizontal: convert(16) }}>
      <View style={{ flexDirection: 'row', gap: convert(12), marginBottom: convert(16) }}>
        <View style={{ flex: 1, justifyContent: 'space-between', backgroundColor: '#004f9913', padding: convert(12), aspectRatio: 1 }}>
          <Text style={{ fontSize: convert(11), fontWeight: 'bold', color: '#777', textTransform: 'uppercase' }}>Notes</Text>
          <Text style={{ fontSize: convert(36), fontWeight: 'bold' }}>{notes.length}</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'space-between', backgroundColor: '#004f9913', padding: convert(12), aspectRatio: 1 }}>
          <Text style={{ fontSize: convert(11), fontWeight: 'bold', color: '#777', textTransform: 'uppercase' }}>Groups</Text>
          <Text style={{ fontSize: convert(36), fontWeight: 'bold' }}>{groups.length}</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'space-between', backgroundColor: '#004f9913', padding: convert(12), aspectRatio: 1 }}>
          <Text style={{ fontSize: convert(11), fontWeight: 'bold', color: '#777', textTransform: 'uppercase' }}>Last sync</Text>
          <Text style={{ fontSize: convert(20), fontWeight: 'bold' }}>{lastSync ? moment(lastSync).fromNow() : '—'}</Text>
        </View>
      </View>
      <Row title="Export notes (JSON)" subtitle="Copy a full backup to clipboard" onPress={() => exportTo('json')} />
      <Row title="Export notes (Markdown)" subtitle="Copy a readable version to clipboard" onPress={() => exportTo('md')} />
      <Row title="Force sync" subtitle="Push local changes to the server now" onPress={forceSync} disabled={syncing} loading={syncing} />
    </View>
  )
}

const HistoryItems = ({ history }: { history: HistoryType }) => {
  return (
    <View style={{ width: convert(150) }}>
      <Image source={{ uri: `https://${history.content.image}` }} style={{ width: convert(150), marginBottom: convert(8), aspectRatio: 1, borderWidth: 1, borderColor: '#eee' }} />
      <View style={{ gap: convert(2) }}>
        <Text style={{ fontSize: convert(16), fontWeight: 'semibold' }}>{history.content.title.length > 48 ? history.content.title.substring(0, 48) + '...' : history.content.title}</Text>
        <Text style={{ color: '#777', fontSize: convert(11), fontWeight: 'bold', textTransform: "uppercase" }}>{moment(history.createdAt).fromNow()}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});


