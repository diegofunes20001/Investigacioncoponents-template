import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface ImageData {
  id: number;
  filename: string;
  originalname: string;
  size: number;
  url: string;
  created_at: string;
}

export default function GalleryScreen() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchImages = async () => {
    try {
      const response = await fetch('https://5000-${process.env.REPLIT_DEV_DOMAIN}/api/images');
      const result = await response.json();
      
      if (result.success) {
        setImages(result.data);
      } else {
        Alert.alert('Error', 'No se pudieron cargar las imágenes');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión al servidor');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchImages();
    setRefreshing(false);
  }, []);

  const deleteImage = async (id: number) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar esta imagen?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`https://5000-${process.env.REPLIT_DEV_DOMAIN}/api/images/${id}`, {
                method: 'DELETE',
              });
              
              const result = await response.json();
              
              if (result.success) {
                setImages(images.filter(img => img.id !== id));
                Alert.alert('Éxito', 'Imagen eliminada correctamente');
              } else {
                Alert.alert('Error', result.message || 'Error al eliminar la imagen');
              }
            } catch (error) {
              Alert.alert('Error', 'Error de conexión al servidor');
              console.error('Delete error:', error);
            }
          }
        }
      ]
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchImages();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText>Cargando imágenes...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>Galería de Imágenes</ThemedText>
        <ThemedText style={styles.subtitle}>
          {images.length} imagen{images.length !== 1 ? 'es' : ''} guardada{images.length !== 1 ? 's' : ''}
        </ThemedText>
      </ThemedView>

      {images.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>📷</ThemedText>
          <ThemedText style={styles.emptyTitle}>No hay imágenes</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Ve a la pestaña Camera para subir tu primera imagen
          </ThemedText>
        </ThemedView>
      ) : (
        <View style={styles.gridContainer}>
          {images.map((image) => (
            <ThemedView key={image.id} style={styles.imageCard}>
              <Image source={{ uri: image.url }} style={styles.thumbnail} />
              <View style={styles.imageInfo}>
                <ThemedText style={styles.imageName} numberOfLines={1}>
                  {image.originalname}
                </ThemedText>
                <ThemedText style={styles.imageDetails}>
                  {formatFileSize(image.size)}
                </ThemedText>
                <ThemedText style={styles.imageDate}>
                  {formatDate(image.created_at)}
                </ThemedText>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => deleteImage(image.id)}
                >
                  <ThemedText style={styles.deleteButtonText}>🗑️ Eliminar</ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  gridContainer: {
    padding: 20,
    gap: 16,
  },
  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  imageInfo: {
    gap: 4,
  },
  imageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  imageDetails: {
    fontSize: 14,
    color: '#6c757d',
  },
  imageDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  deleteButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#dc3545',
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
