import { Image, StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { Stack } from 'expo-router';

import { FluentChevronRight32Regular } from '@/constants/icons';
import { useDatabase } from "@/context/database.context";
import { router } from "expo-router";

export default function TabTwoScreen() {
  const { usersQuery, session } = useDatabase()
  const userinfo = usersQuery?.findById(session?.iduser as string)

  console.log(userinfo, session)
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, headerShadowVisible: false, title: "Settings" }} />
      <View style={{ paddingHorizontal: convert(16), paddingTop: convert(16) }}>
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
              source={userinfo?.photo ? { uri: userinfo?.photo } : require("../../assets/images/avatar.png")} />
            <View style={{ width: convert(20), height: convert(20) }}>
              <FluentChevronRight32Regular width={convert(20)} height={convert(20)} />
            </View>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
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
