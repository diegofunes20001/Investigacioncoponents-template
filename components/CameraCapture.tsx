import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCamera } from "@/hooks/useCamera";
// import { cn } from "@/lib/utils";
import { Camera, RotateCcw, Square, SwitchCamera } from "lucide-react";
import React, { useEffect } from "react";

const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(" ");
interface CameraCaptureProps {
  onPhotoCapture: (dataUrl: string) => void;
  isActive: boolean;
  onToggle: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onPhotoCapture,
  isActive,
  onToggle,
}) => {
  const {
    videoRef,
    canvasRef,
    isStreaming,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    facingMode,
  } = useCamera();

  useEffect(() => {
    if (isActive && !isStreaming) {
      startCamera();
    } else if (!isActive && isStreaming) {
      stopCamera();
    }
  }, [isActive, isStreaming, startCamera, stopCamera]);

  const handleCapture = () => {
    const dataUrl = capturePhoto();
    if (dataUrl) {
      onPhotoCapture(dataUrl);
    }
  };

  const handleToggleCamera = () => {
    if (isActive) {
      stopCamera();
    }
    onToggle();
  };

  if (!isActive) {
    return (
      <Card className="camera-preview-card">
        <CardContent className="flex flex-col items-center justify-center p-12 min-h-64">
          <Camera className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center mb-4">
            Activa la cámara para capturar fotos
          </p>
          <Button onClick={handleToggleCamera} className="camera-activate-btn">
            <Camera className="h-4 w-4 mr-2" />
            Activar Cámara
          </Button>
        </CardContent>
      </Card>
    );
  }
   return (
     <Card className="camera-active-card">
      <CardContent className="p-4">
        <div className="camera-container relative rounded-lg overflow-hidden bg-black">
          {error ? (
            <div className="camera-error flex flex-col items-center justify-center min-h-64 p-8 text-center">
              <Camera className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-destructive mb-2">Error de cámara</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => startCamera()}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          ) : (
             <>
             <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "video-stream w-full h-auto max-h-96 object-cover",
                  isStreaming ? "block" : "hidden",
                )}
              />
              {!isStreaming && (
                <div className="video-loading flex items-center justify-center min-h-64 bg-muted">
                  <div className="loading-spinner animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-muted-foreground">
                    Iniciando cámara...
                  </span>
                </div>
              )}
                <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
            </>
          )}
        </div>
         {isStreaming && !error && (
          <div className="camera-controls flex justify-center items-center gap-4 mt-4">
            <Button
              onClick={switchCamera}
              title={`Cambiar a cámara ${facingMode === "user" ? "trasera" : "frontal"}`}
              className="camera-switch-btn"
            >
              <SwitchCamera className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleCapture}
              className="capture-btn bg-red-600 hover:bg-red-700 rounded-full h-16 w-16 p-0"
            >
              <div className="capture-circle w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <div className="inner-circle w-8 h-8 bg-red-600 rounded-full"></div>
              </div>
            </Button>
         
            <Button
              onClick={handleToggleCamera}
              title="Cerrar cámara"
              className="camera-close-btn"
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
        )}
        </CardContent>
      </Card>
    );
};