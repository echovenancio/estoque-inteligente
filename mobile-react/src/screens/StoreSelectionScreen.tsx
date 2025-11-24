import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Image, Platform, Modal, Dimensions, Alert } from 'react-native';
import { Button, Card, Title, Paragraph, TextInput, Dialog, Portal, Text, ActivityIndicator, IconButton, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { MapView, Marker, MapPressEvent } from '../components/MapWrapper';
import { API, BASE_URL } from '../services/api';
import { LojaStore } from '../services/lojaStore';
import { CredStore } from '../services/credStore';
import { Loja } from '../types/models';
import { useTheme } from '../styles/theme';

export default function StoreSelectionScreen() {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [newLojaName, setNewLojaName] = useState('');
  const [newLojaLocation, setNewLojaLocation] = useState('');
  const [newLojaImage, setNewLojaImage] = useState<string | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: -23.55052,
    longitude: -46.633308,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedCoord, setSelectedCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    loadLojas();
  }, []);

  const loadLojas = async () => {
    try {
      const data = await API.getLojas();
      setLojas(data);
    } catch (error) {
      console.error('Error loading lojas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLoja = async (loja: Loja) => {
    await LojaStore.setLoja(loja);
    router.replace('/loja');
  };

  const onLogout = async () => {
    await CredStore.removeToken();
    await LojaStore.clearLoja();
    router.replace('/login');
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewLojaImage(result.assets[0].uri);
    }
  };

  const getCurrentLocation = async () => {
    setLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de acesso à localização.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Reverse geocode
      let address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address && address.length > 0) {
        const addr = address[0];
        const addrStr = `${addr.street || ''}, ${addr.streetNumber || ''} - ${addr.city || ''}`;
        setNewLojaLocation(addrStr);
      } else {
        setNewLojaLocation(`${latitude}, ${longitude}`);
      }
      
      setMapRegion({
        ...mapRegion,
        latitude,
        longitude,
      });
    } catch (error) {
      console.warn(error);
      Alert.alert('Erro', 'Não foi possível obter a localização.');
    } finally {
      setLocating(false);
    }
  };

  const openMap = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Aviso', 'Seleção no mapa não disponível na web. Use a localização atual.');
      return;
    }
    setMapVisible(true);
  };

  const onMapPress = (e: MapPressEvent) => {
    setSelectedCoord(e.nativeEvent.coordinate);
  };

  const confirmMapSelection = async () => {
    if (selectedCoord) {
      try {
        let address = await Location.reverseGeocodeAsync(selectedCoord);
        if (address && address.length > 0) {
          const addr = address[0];
          const addrStr = `${addr.street || ''}, ${addr.streetNumber || ''} - ${addr.city || ''}`;
          setNewLojaLocation(addrStr);
        } else {
          setNewLojaLocation(`${selectedCoord.latitude}, ${selectedCoord.longitude}`);
        }
      } catch (e) {
        setNewLojaLocation(`${selectedCoord.latitude}, ${selectedCoord.longitude}`);
      }
    }
    setMapVisible(false);
  };

  const handleCreateLoja = async () => {
    try {
      let finalImageUrl = newLojaImage;
      if (newLojaImage && !newLojaImage.startsWith('http')) {
        finalImageUrl = await API.uploadImage(newLojaImage);
      }

      const newLoja: Loja = {
        nome: newLojaName,
        localizacao: newLojaLocation,
        foto_url: finalImageUrl || undefined,
      };
      await API.createLoja(newLoja);
      setVisible(false);
      setNewLojaName('');
      setNewLojaLocation('');
      setNewLojaImage(null);
      loadLojas();
    } catch (error) {
      console.error('Error creating loja:', error);
    }
  };

  const renderItem = ({ item }: { item: Loja }) => (
    <Card style={styles.card} onPress={() => handleSelectLoja(item)}>
      {item.foto_url && (
        <Card.Cover source={{ uri: item.foto_url.startsWith('http') ? item.foto_url : `${BASE_URL}${item.foto_url}` }} />
      )}
      <Card.Content>
        <Title>{item.nome}</Title>
        <Paragraph>{item.localizacao}</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Title style={styles.header}>Selecione uma Loja</Title>
        <IconButton icon="logout" onPress={onLogout} />
      </View>
      <FlatList
        data={lojas}
        renderItem={renderItem}
        keyExtractor={(item: Loja) => item.id || ''}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadLojas}
      />
      
      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Nova Loja</Dialog.Title>
          <Dialog.Content>
            <View style={styles.imageContainer}>
              {newLojaImage ? (
                <Image source={{ uri: newLojaImage }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <IconButton icon="camera" size={30} onPress={pickImage} />
                  <Text>Adicionar Foto</Text>
                </View>
              )}
              {newLojaImage && <Button onPress={pickImage}>Alterar Foto</Button>}
            </View>

            <TextInput
              label="Nome da Loja"
              value={newLojaName}
              onChangeText={setNewLojaName}
              style={styles.input}
            />
            
            <View style={styles.locationContainer}>
              <TextInput
                label="Localização"
                value={newLojaLocation}
                onChangeText={setNewLojaLocation}
                style={[styles.input, { flex: 1 }]}
              />
              <IconButton icon="crosshairs-gps" onPress={getCurrentLocation} loading={locating} />
              <IconButton icon="map-marker" onPress={openMap} />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancelar</Button>
            <Button onPress={handleCreateLoja}>Criar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Modal visible={mapVisible} animationType="slide">
        <View style={styles.mapContainer}>
          {Platform.OS !== 'web' && (
            <MapView
              style={styles.map}
              initialRegion={mapRegion}
              onPress={onMapPress}
            >
              {selectedCoord && <Marker coordinate={selectedCoord} />}
            </MapView>
          )}
          <View style={styles.mapActions}>
            <Button mode="contained" onPress={confirmMapSelection} style={styles.mapButton}>
              Confirmar Localização
            </Button>
            <Button onPress={() => setMapVisible(false)} style={styles.mapButton}>
              Cancelar
            </Button>
          </View>
        </View>
      </Modal>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        icon="plus"
        onPress={() => setVisible(true)}
        label="Nova Loja"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  header: {
    textAlign: 'center',
    flex: 1,
  },
  list: {
    paddingBottom: 80,
  },
  card: {
    marginBottom: 12,
  },
  role: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 100,
  },
  mapActions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mapButton: {
    backgroundColor: 'white',
  }
});
