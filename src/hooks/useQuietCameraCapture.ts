"use client";

import { useRef, useState, useCallback, type RefObject } from "react";

/* ══════════════════════════════════════════════════════════
   useQuietCameraCapture
   ──────────────────────────────────────────────────────────
   Manages the rear camera stream and exposes a silent
   captureFrame() that snapshots the live video as a JPEG
   base-64 data URL (max 640px, quality 0.75).
   ══════════════════════════════════════════════════════════ */

export interface UseQuietCameraCaptureReturn {
  videoRef:    RefObject<HTMLVideoElement>;
  cameraReady: boolean;
  cameraError: boolean;
  startCamera: () => Promise<void>;
  stopCamera:  () => void;
  /** Returns a base-64 JPEG data URL or null if not ready. */
  captureFrame: () => string | null;
}

export function useQuietCameraCapture(): UseQuietCameraCaptureReturn {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch {
      setCameraError(true);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  }, []);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    const W = Math.min(video.videoWidth  || 640, 640);
    const H = Math.round((video.videoHeight / Math.max(video.videoWidth, 1)) * W);

    const canvas = document.createElement("canvas");
    canvas.width  = W;
    canvas.height = H;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, W, H);
    return canvas.toDataURL("image/jpeg", 0.75);
  }, []);

  return { videoRef, cameraReady, cameraError, startCamera, stopCamera, captureFrame };
}
