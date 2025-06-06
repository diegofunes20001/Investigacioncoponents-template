import { Button, ButtonProps as DefaultButtonProps } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Photo } from "@/types/photo";
import { Calendar, Camera, FileImage, Trash2, Upload } from "lucide-react";
import React from "react";
// import { Badge, BadgeProps } from "./ui/badge";

// Utility function to concatenate class names conditionally
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface PhotoGalleryProps {
  photos: Photo[];
  onDeletePhoto: (photoId: string) => void;
  loading?: boolean;
  className?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  onDeletePhoto,
  loading = false,
  className,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getSourceIcon = (source: Photo["source"]) => {
    return source === "camera" ? (
      <Camera className="h-3 w-3" />
    ) : (
      <Upload className="h-3 w-3" />
    );
  };

  const getSourceLabel = (source: Photo["source"]) => {
    return source === "camera" ? "Cámara" : "Galería";
  };

  if (loading) {
    return (
      <Card className={cn("photo-gallery-loading", className)}>
        <CardContent className="p-6">
          <div className="loading-container flex items-center justify-center min-h-32">
            <div className="loading-spinner animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">
              Cargando fotos...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (photos.length === 0) {
    return (
      <Card className={cn("photo-gallery-empty", className)}>
        <CardContent className="p-12">
          <div className="empty-state flex flex-col items-center justify-center text-center">
            <FileImage className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="empty-title text-lg font-medium mb-2">
              No hay fotos guardadas
            </h3>
            <p className="empty-description text-sm text-muted-foreground">
              Usa la cámara o selecciona imágenes desde tu galería para comenzar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("photo-gallery", className)}>
      <CardHeader className="gallery-header">
        <CardTitle className="gallery-title flex items-center gap-2">
          <FileImage className="h-5 w-5" />
          Fotos Guardadas ({photos.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="gallery-content p-4">
        <div className="photo-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="photo-item group relative bg-muted rounded-lg overflow-hidden aspect-square"
            >
              <img
                src={photo.dataUrl}
                alt={photo.name}
                className="photo-image w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />

              <div className="photo-overlay absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors">
                <div className="photo-controls opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center">
                  <Button
                    onClick={() => onDeletePhoto(photo.id)}
                    className="delete-photo-btn px-2 py-1 h-7"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="photo-info absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="photo-badges flex items-center gap-2 mb-2">
                  <Badge className="photo-source-badge text-xs">
                    {getSourceIcon(photo.source)}
                    <span className="ml-1">{getSourceLabel(photo.source)}</span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className="photo-size-badge text-xs text-white border-white/20"
                  >
                    {formatFileSize(photo.size)}
                  </Badge>
                </div>

                <div className="photo-metadata">
                  <p className="photo-name text-white text-sm font-medium truncate mb-1">
                    {photo.name}
                  </p>
                  <p className="photo-date text-white/80 text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(photo.capturedAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export interface Photo {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
  source: "camera" | "gallery";
  capturedAt: Date;
}

// Extend the default ButtonProps if needed, or ensure your Button component supports 'variant'
export interface ButtonProps extends DefaultButtonProps {
  variant?: string;
  size?: string;
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, className = "", ...props }) => (
  <span
    className={cn(className, variant ? `badge-${variant}` : "")}
    {...props}
  />
);
