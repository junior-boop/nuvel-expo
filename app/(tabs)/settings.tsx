import { Image, RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { Stack } from 'expo-router';

import { PageLayout_3 } from '@/components/page';
import { w } from '@/constants/Colors';
import { BxsBible, FluentChevronRight32Regular } from '@/constants/icons';
import { useDatabase } from "@/context/database.context";
import { HistoryType } from '@/lib/instantdb.histories';
import { router } from "expo-router";
import { StatusBar } from 'expo-status-bar';
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
                source={userinfo?.photo ? { uri: `https://${userinfo?.photo}` } : require("../../assets/images/avatar.png")} />
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
    console.log(histories)
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

const HistoryItems = ({ history }: { history: HistoryType }) => {
  return (
    <View style={{ width: convert(150) }}>
      <Image source={{ uri: `https://${history.content.image}` }} style={{ width: convert(150), marginBottom: convert(8), aspectRatio: 1, borderWidth: 1, borderColor: '#eee' }} />
      <View style={{ gap: convert(8) }}>
        <Text style={{ color: '#777', fontSize: convert(11), fontWeight: 'bold', textTransform: "uppercase" }}>{moment(history.createdAt).fromNow()}</Text>
        <Text style={{ fontSize: convert(16), fontWeight: 'semibold' }}>{history.content.title.length > 48 ? history.content.title.substring(0, 48) + '...' : history.content.title}</Text>
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


