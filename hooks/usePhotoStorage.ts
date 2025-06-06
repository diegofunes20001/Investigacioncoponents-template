import { useState, useCallback, useEffect } from "react";
import { Photo } from "@/types/photo";
import { photoApi } from "@/services/photoApi";

interface UsePhotoStorageReturn {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  savePhoto: (photo: Omit<Photo, "id" | "capturedAt">) => Promise<Photo | null>;
  deletePhoto: (photoId: string) => Promise<void>;
  clearAllPhotos: () => Promise<void>;
  refreshPhotos: () => Promise<void>;
  storageInfo: { used: number; available: number };
}

export const usePhotoStorage = (): UsePhotoStorageReturn => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0 });

  const updateStorageInfo = useCallback(() => {
    setStorageInfo(photoApi.getStorageInfo());
  }, []);

  const refreshPhotos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPhotos = await photoApi.getPhotos();
      setPhotos(fetchedPhotos);
      updateStorageInfo();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load photos";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [updateStorageInfo]);

  const savePhoto = useCallback(
    async (
      photoData: Omit<Photo, "id" | "capturedAt">,
    ): Promise<Photo | null> => {
      try {
        setLoading(true);
        setError(null);

        const photo: Photo = {
          ...photoData,
          id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          capturedAt: new Date(),
        };

        const savedPhoto = await photoApi.savePhoto(photo);
        await refreshPhotos();
        return savedPhoto;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to save photo";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [refreshPhotos],
  );

  const deletePhoto = useCallback(
    async (photoId: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        await photoApi.deletePhoto(photoId);
        await refreshPhotos();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete photo";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [refreshPhotos],
  );

  const clearAllPhotos = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await photoApi.clearAllPhotos();
      await refreshPhotos();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to clear photos";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [refreshPhotos]);

  // Load photos on mount
  useEffect(() => {
    refreshPhotos();
  }, [refreshPhotos]);

  return {
    photos,
    loading,
    error,
    savePhoto,
    deletePhoto,
    clearAllPhotos,
    refreshPhotos,
    storageInfo,
  };
};
