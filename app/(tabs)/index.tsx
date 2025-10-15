import PageLayout from '@/components/page';
import { Text, View } from '@/components/Themed';
import { useState } from 'react';
import { Image, TextInput, TouchableOpacity } from 'react-native';
import { HeaderStyles } from '../styles/cards';



export default function TabOneScreen() {
  const [value, onChangeText] = useState('');
  const [store, setStore] = useState<string[] | null>([]);

  const handleSend = () => {
    if (value.trim() !== '') {
      setStore(prevStore => prevStore ? [...prevStore, value] : [value]);
      onChangeText('');
    }

  }
  return (
    <PageLayout>
      <View style={HeaderStyles.container}>
        <Image source={require("../../assets/images/Nuvel.png")} style={HeaderStyles.image} />
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 24 }}>Tab One</Text>
        <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center' }}>
          <TextInput value={value} onChangeText={(e) => onChangeText(e)} placeholder="Type here to translate!" placeholderTextColor="#999999" style={{ height: 40, borderColor: 'gray', borderWidth: 1, paddingHorizontal: 8, color: "black", flex: 1 }} />
          <TouchableOpacity style={{ marginLeft: 8, backgroundColor: '#007AFF', height: 40, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 }} onPress={handleSend}>
            <Text style={{ color: "white" }}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ padding: 16 }}>
        <Text style={{ marginBottom: 12, fontSize: 24 }}>Liste des Stock</Text>
        {
          store?.map((item, index) => (
            <View key={index} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
              <Text>{item.id}</Text>
              <Text style={{ fontSize: 18 }}>{item.name}</Text>
              <Text style={{ color: '#666', marginTop: 4 }}>{new Date(item.created_at).toLocaleString()}</Text>
            </View>
          ))
        }
      </View>
    </PageLayout>
  );
}

