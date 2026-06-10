import ArticlesItems from '@/components/articlesItems';
import { PageLayout_3 } from '@/components/page';
import { View } from '@/components/Themed';
import { w } from '@/constants/Colors';
import { convert } from '@/constants/convert';
import { useDatabase } from '@/context/database.context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default function TabTwoScreen() {
  const { articlesQuery } = useDatabase()
  const articles = articlesQuery?.findAll()
  return (
    <PageLayout_3 addnote={false}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container}>
        <View style={{ justifyContent: 'center', height: convert(32), width: w }}>

        </View>
        <Text style={{ ...styles.title, marginHorizontal: convert(16), marginBottom: convert(32) }}>Articles saved</Text>
        <View style={{ gap: convert(16) }}>
          {articles?.map((article) => <ArticlesItems key={article.id} article={article} />)}
        </View>
      </ScrollView>
    </PageLayout_3>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
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
