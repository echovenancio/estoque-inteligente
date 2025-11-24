import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Image, Alert } from 'react-native';
import { Button, Card, Title, Paragraph, TextInput, Dialog, Portal, List, IconButton, Appbar, Surface, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { API, BASE_URL } from '../services/api';
import { LojaStore } from '../services/lojaStore';
import { Loja, Permissao } from '../types/models';
import { useTheme } from '../styles/theme';

export default function StoreSettingsScreen() {
  const [loja, setLoja] = useState<Loja | null>(null);
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [papel, setPapel] = useState<'admin' | 'visualizador'>('visualizador');
  
  // Edit Store State
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editImage, setEditImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentLoja = await LojaStore.getLoja();
      if (!currentLoja || !currentLoja.id) {
        router.replace('/store-selection');
        return;
      }
      
      if (currentLoja.papel !== 'admin') {
        Alert.alert('Acesso negado', 'Você não tem permissão para acessar esta tela.');
        router.back();
        return;
      }

      setLoja(currentLoja);
      setEditName(currentLoja.nome);
      setEditLocation(currentLoja.localizacao);
      setEditImage(currentLoja.foto_url || null);
      
      const perms = await API.getPermissions(currentLoja.id);
      setPermissoes(perms);
    } catch (error) {
      console.error('Error loading store settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPermission = async () => {
    if (!loja?.id) return;
    try {
      await API.addPermission(loja.id, {
        loja_id: loja.id,
        email,
        papel,
      });
      setVisible(false);
      setEmail('');
      loadData();
    } catch (error) {
      console.error('Error adding permission:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o usuário.');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setEditImage(result.assets[0].uri);
    }
  };

  const handleUpdateLoja = async () => {
    if (!loja?.id) return;
    setSaving(true);
    try {
      let finalImageUrl = editImage;
      if (editImage && !editImage.startsWith('http')) {
        finalImageUrl = await API.uploadImage(editImage);
      } else if (editImage && editImage.startsWith(BASE_URL)) {
        finalImageUrl = editImage.replace(BASE_URL, '');
      }

      const updatedLoja: Loja = {
        ...loja,
        nome: editName,
        localizacao: editLocation,
        foto_url: finalImageUrl || undefined,
      };

      const res = await API.updateLoja(loja.id, updatedLoja);
      await LojaStore.setLoja(res); // Update local store
      setLoja(res);
      setEditVisible(false);
      Alert.alert('Sucesso', 'Loja atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating loja:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a loja. Verifique se você é administrador.');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }: { item: Permissao }) => (
    <List.Item
      title={item.email}
      description={item.papel === 'admin' ? 'Administrador' : 'Visualizador'}
      left={props => <List.Icon {...props} icon="account" />}
    />
  );

  if (!loja) return null;

  return (
    <Surface style={styles.container}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Configurações da Loja" />
      </Appbar.Header>

      <View style={styles.content}>
        <Card style={styles.card}>
          {loja.foto_url && (
            <Card.Cover source={{ uri: loja.foto_url.startsWith('http') ? loja.foto_url : `${BASE_URL}${loja.foto_url}` }} />
          )}
          <Card.Content>
            <Title>{loja.nome}</Title>
            <Paragraph>{loja.localizacao}</Paragraph>
            <Button mode="outlined" onPress={() => setEditVisible(true)} style={{ marginTop: 10 }}>
              Editar Informações
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.sectionHeader}>
          <Title>Usuários</Title>
          <Button mode="contained" onPress={() => setVisible(true)} compact>
            Adicionar
          </Button>
        </View>

        <FlatList
          data={permissoes}
          renderItem={renderItem}
          keyExtractor={(item: Permissao) => item.email}
          refreshing={loading}
          onRefresh={loadData}
        />
      </View>

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Adicionar Usuário</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={styles.roleContainer}>
              <Text variant="bodyMedium">Papel:</Text>
              <View style={styles.roleButtons}>
                <Button 
                  mode={papel === 'visualizador' ? 'contained' : 'outlined'} 
                  onPress={() => setPapel('visualizador')}
                  compact
                >
                  Visualizador
                </Button>
                <Button 
                  mode={papel === 'admin' ? 'contained' : 'outlined'} 
                  onPress={() => setPapel('admin')}
                  compact
                >
                  Admin
                </Button>
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancelar</Button>
            <Button onPress={handleAddPermission}>Adicionar</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={editVisible} onDismiss={() => setEditVisible(false)}>
          <Dialog.Title>Editar Loja</Dialog.Title>
          <Dialog.Content>
            <View style={styles.imageContainer}>
               {editImage ? (
                <Image source={{ uri: editImage }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <IconButton icon="camera" size={30} onPress={pickImage} />
                  <Text variant="bodySmall">Alterar Foto</Text>
                </View>
              )}
              {editImage && <Button onPress={pickImage}>Alterar Foto</Button>}
            </View>
            <TextInput
              label="Nome da Loja"
              value={editName}
              onChangeText={setEditName}
              style={styles.input}
            />
            <TextInput
              label="Localização"
              value={editLocation}
              onChangeText={setEditLocation}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditVisible(false)}>Cancelar</Button>
            <Button onPress={handleUpdateLoja} loading={saving} disabled={saving}>Salvar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    flex: 1,
  },
  card: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  roleContainer: {
    marginTop: 8,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
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
});
