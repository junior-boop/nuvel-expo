import { PageLayout_3 } from '@/components/page';
import { Text, View } from '@/components/Themed';
import { w } from '@/constants/Colors';
import { convert } from '@/constants/convert';
import { FluentSparkle32Regular, RiMessageLine } from '@/constants/icons';
import { useNotificationsContext } from '@/context/notifications.context';
import { NotificationRow } from '@/lib/notifications.api';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import moment from 'moment';
import { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet } from 'react-native';

const iconForType = (type: string) => {
  if (type === 'comment_reply') return RiMessageLine;
  return FluentSparkle32Regular;
};

// Les annonces et sujets de prière ne peuvent être créés que par un admin (route /broadcast
// protégée par role === "admin") : seul comment_reply provient d'un utilisateur normal.
const isAdminNotification = (type: string) => type !== 'comment_reply';

const NotificationItem = ({ notification, onRead, onOpen }: { notification: NotificationRow; onRead: (id: string) => void; onOpen: (notification: NotificationRow) => void }) => {
  const Icon = iconForType(notification.type);

  return (
    <Pressable
      onPress={() => {
        if (!notification.read) onRead(notification.id);
        onOpen(notification);
      }}
      style={{ flexDirection: 'row', gap: convert(12), paddingHorizontal: convert(16), alignItems: 'flex-start' }}
    >
      <View style={{ width: convert(40), height: convert(40), borderRadius: convert(20), backgroundColor: '#f6f9ffff', alignItems: 'center', justifyContent: 'center' }}>
        <Icon width={20} height={20} color={'#208AEF'} />
      </View>
      <View style={{ flex: 1, gap: convert(4) }}>
        <Text style={{ width: w * 0.7, fontSize: convert(15), fontWeight: 'bold' }}>
          {isAdminNotification(notification.type) && <Text style={styles.adminTag}>  Admin  </Text>}
          <Text> </Text>{notification.title} - <Text style={{ fontSize: convert(14), color: '#a0a0a0' }}>{moment(notification.createdAt).fromNow()}</Text>
        </Text>
        <Text style={{ width: w * 0.7, fontSize: convert(14), color: '#797979' }}>{notification.body}</Text>

      </View>
      {!notification.read && <View style={{ width: convert(8), height: convert(8), borderRadius: convert(4), backgroundColor: '#208AEF', marginTop: convert(6) }} />}
    </Pressable>
  );
};

export default function TabTwoScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { notifications, loading, refresh, markRead } = useNotificationsContext();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleOpen = (notification: NotificationRow) => {
    router.push({
      pathname: '/notification',
      params: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        articleId: notification.articleId ?? '',
        createdAt: notification.createdAt,
      },
    });
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
              <NotificationItem key={notification.id} notification={notification} onRead={markRead} onOpen={handleOpen} />
            ))}
          </View>
        )}
        <View style={{ height: convert(72) }}></View>
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
  adminTag: {
    fontSize: convert(12),
    fontWeight: 'bold',
    color: '#208AEF',
    backgroundColor: '#e6f0ff',
    paddingHorizontal: convert(6),
    paddingVertical: convert(2),
    borderRadius: convert(4),
  },
});
