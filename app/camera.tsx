
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

export default function CameraScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await MediaLibrary.requestPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert('Permisos requeridos', 'Se necesitan permisos de cámara y galería para usar esta función');
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Por favor selecciona una imagen primero');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      
      // Create file object from URI
      const filename = selectedImage.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('image', {
        uri: selectedImage,
        name: filename,
        type,
      } as any);

      const response = await fetch('https://5000-${process.env.REPLIT_DEV_DOMAIN}/api/upload-image', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        Alert.alert('Éxito', 'Imagen subida correctamente');
        setSelectedImage(null);
      } else {
        Alert.alert('Error', result.message || 'Error al subir la imagen');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión al servidor');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>Captura de Imágenes</ThemedText>
        <ThemedText style={styles.subtitle}>Selecciona una imagen de la galería o toma una foto</ThemedText>
      </ThemedView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.galleryButton]} onPress={pickImageFromGallery}>
          <ThemedText style={styles.buttonText}>📷 Seleccionar de Galería</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.cameraButton]} onPress={takePhoto}>
          <ThemedText style={styles.buttonText}>📸 Tomar Foto</ThemedText>
        </TouchableOpacity>
      </View>

      {selectedImage && (
        <ThemedView style={styles.imageContainer}>
          <ThemedText style={styles.imageTitle}>Imagen Seleccionada:</ThemedText>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          
          <TouchableOpacity 
            style={[styles.button, styles.uploadButton, isUploading && styles.disabledButton]} 
            onPress={uploadImage}
            disabled={isUploading}
          >
            <ThemedText style={styles.buttonText}>
              {isUploading ? '⏳ Subiendo...' : '☁️ Subir Imagen'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  buttonContainer: {
    padding: 20,
    gap: 16,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  galleryButton: {
    backgroundColor: '#4A90E2',
  },
  cameraButton: {
    backgroundColor: '#7ED321',
  },
  uploadButton: {
    backgroundColor: '#F5A623',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    resizeMode: 'cover',
  },
});
