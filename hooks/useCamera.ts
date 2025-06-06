import { useState, useRef, useCallback } from "react";
import { CameraConstraints } from "@/types/photo";

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isStreaming: boolean;
  error: string | null;
  startCamera: (constraints?: CameraConstraints) => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => string | null;
  switchCamera: () => Promise<void>;
  facingMode: "user" | "environment";
}

export const useCamera = (): UseCameraReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );

  const startCamera = useCallback(
    async (constraints?: CameraConstraints) => {
      try {
        setError(null);

        // Stop any existing stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const defaultConstraints: CameraConstraints = {
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(
          constraints || defaultConstraints,
        );

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsStreaming(true);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to access camera";
        setError(errorMessage);
        setIsStreaming(false);
      }
    },
    [facingMode],
  );

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !isStreaming) {
      return null;
    }

    const context = canvas.getContext("2d");
    if (!context) return null;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    return canvas.toDataURL("image/jpeg", 0.8);
  }, [isStreaming]);

  const switchCamera = useCallback(async () => {
    const newFacingMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacingMode);

    if (isStreaming) {
      await startCamera({
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
    }
  }, [facingMode, isStreaming, startCamera]);

  return {
    videoRef,
    canvasRef,
    isStreaming,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    facingMode,
  };
};
