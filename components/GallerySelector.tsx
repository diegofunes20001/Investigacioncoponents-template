import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import React, { useRef } from "react";

interface GallerySelectorProps {
  onImageSelect: (dataUrl: string, file: File) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
}

export const GallerySelector: React.FC<GallerySelectorProps> = ({
  onImageSelect,
  accept = "image/*",
  multiple = false,
  maxSize = 5 * 1024 * 1024, // default to 5MB
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > maxSize) {
        alert(`File ${file.name} exceeds the maximum size of ${maxSize / 1024 / 1024} MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string") {
          onImageSelect(reader.result, file);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="gallery-selector-card">
      <CardContent className="flex flex-col items-center justify-center p-12 min-h-64">
        <Button onClick={handleButtonClick} className="w-full">
          <Upload className="mr-2" />
          Seleccionar Imagen
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="text-muted-foreground text-center mt-2">
          O arrastra y suelta imágenes aquí
        </p>
      </CardContent>
    </Card>
  );
};
