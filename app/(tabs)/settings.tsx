import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { Stack } from 'expo-router';

import { w } from '@/constants/Colors';
import { BxsBible, FluentChevronRight32Regular } from '@/constants/icons';
import { useDatabase } from "@/context/database.context";
import { router } from "expo-router";
import { StatusBar } from 'expo-status-bar';

export default function TabTwoScreen() {
  const { usersQuery, session, biblemetadatState } = useDatabase()
  const userinfo = usersQuery?.findById(session?.iduser as string)
  const biblelist = biblemetadatState?.findAll()

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: true, headerShadowVisible: false, title: "Settings" }} />
      <ScrollView style={{ paddingHorizontal: convert(16), paddingTop: convert(16) }}>
        <Text style={{ ...styles.title, marginBottom: convert(16) }}>Account</Text>
        <View style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee' }}>
          <Text style={{ fontSize: convert(16), fontWeight: 'bold' }}>Email adress</Text>
          <Text style={{ fontSize: convert(16) }}>{userinfo?.email}</Text>
        </View>
        <View style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee' }}>
          <Text style={{ fontSize: convert(16), fontWeight: 'bold' }}>User Name</Text>
          <Text style={{ fontSize: convert(16) }}>{userinfo?.name} {userinfo?.first_name}</Text>
        </View>
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
        <View style={{ height: 40, width: 200 }} />
        <Text style={{ ...styles.title, marginBottom: convert(16) }}>Bible Downloads</Text>
        {
          biblelist?.length === 0 && (<View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: convert(16), color: "#777", fontStyle: 'italic' }}>
              No Bibles available rigth now. Just click "Add a Bible" to upload one
            </Text>
          </View>)
        }
        <View style={{ marginBottom: convert(14), gap: 8 }}>
          {
            biblelist?.map((bible, index) => (
              <View style={{ backgroundColor: '#004f9913', padding: 14 }} key={index}>
                <Text style={{ fontWeight: 'bold', fontSize: convert(16) }}>{bible.name}</Text>
              </View>))
          }
        </View>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
