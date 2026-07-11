import { PageLayout_3 } from '@/components/page';
import { Text, View } from '@/components/Themed';
import { w } from '@/constants/Colors';
import { convert } from '@/constants/convert';
import { FluentSparkle32Regular, RiMessageLine } from '@/constants/icons';
import { useDatabase } from '@/context/database.context';
import { NotificationType } from '@/lib/instantdb.init';
import { getNotifications, markNotificationRead } from '@/lib/instantdb.notifications';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet } from 'react-native';

const iconForType = (type: string) => {
  if (type === 'comment_reply') return RiMessageLine;
  return FluentSparkle32Regular;
};

const NotificationItem = ({ notification, onRead }: { notification: NotificationType; onRead: (id: string) => void }) => {
  const Icon = iconForType(notification.type);

  return (
    <Pressable
      onPress={() => !notification.read && onRead(notification.id)}
      style={{ flexDirection: 'row', gap: convert(12), paddingHorizontal: convert(16), alignItems: 'flex-start' }}
    >
      <View style={{ width: convert(40), height: convert(40), borderRadius: convert(20), backgroundColor: '#f6f9ffff', alignItems: 'center', justifyContent: 'center' }}>
        <Icon width={20} height={20} color={'#208AEF'} />
      </View>
      <View style={{ flex: 1, gap: convert(4) }}>
        <Text style={{ width: w * 0.7, fontSize: convert(15), fontWeight: 'bold' }}>{notification.title}</Text>
        <Text style={{ width: w * 0.7, fontSize: convert(14), color: '#797979' }}>{notification.body}</Text>
        <Text style={{ fontSize: convert(12), color: '#a0a0a0' }}>{moment(notification.createdAt).fromNow()}</Text>
      </View>
      {!notification.read && <View style={{ width: convert(8), height: convert(8), borderRadius: convert(4), backgroundColor: '#208AEF', marginTop: convert(6) }} />}
    </Pressable>
  );
};

export default function TabTwoScreen() {
  const { session } = useDatabase();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!session?.iduser) return;
    const data = await getNotifications(session.iduser);
    setNotifications((data?.notifications ?? []) as NotificationType[]);
  }, [session?.iduser]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadNotifications();
      setLoading(false);
    })();
  }, [loadNotifications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleRead = async (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
    await markNotificationRead(notificationId);
  };

  return (
    <PageLayout_3 addnote={false}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={{ justifyContent: 'center', height: convert(32), width: w }}></View>
        <Text style={{ ...styles.title, marginHorizontal: convert(16), marginBottom: convert(32) }}>Notifications</Text>
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: convert(32) }}>
            <ActivityIndicator size="small" color={'black'} />
          </View>
        ) : notifications.length === 0 ? (
          <View style={{ alignItems: 'center', paddingHorizontal: convert(16), paddingVertical: convert(32) }}>
            <Text style={{ fontSize: convert(14), color: '#797979' }}>Vous n'avez aucune notification pour le moment.</Text>
          </View>
        ) : (
          <View style={{ gap: convert(20) }}>
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} onRead={handleRead} />
            ))}
          </View>
        )}
      </ScrollView>
    </PageLayout_3>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
