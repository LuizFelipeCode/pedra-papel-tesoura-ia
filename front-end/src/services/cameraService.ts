// services/cameraService.ts
'use client';
import { PredictionResponse } from "../types/game";

export class CameraService {
  private static readonly API_URL = 'http://localhost:8000'; // Ajuste para sua URL da API

  private static isClient(): boolean {
    return typeof window !== 'undefined' && !!navigator?.mediaDevices;
  }

  static async startCamera(videoRef: React.RefObject<HTMLVideoElement>): Promise<void> {
    if (!this.isClient()) {
      throw new Error('Camera API não disponível neste ambiente');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      throw new Error("Não foi possível acessar a câmera. Por favor, verifique as permissões.");
    }
  }

  static stopCamera(videoRef: React.RefObject<HTMLVideoElement>): void {
    if (!this.isClient()) return;

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }

  static captureFrame(videoRef: React.RefObject<HTMLVideoElement>, canvasRef: React.RefObject<HTMLCanvasElement>): string | null {
    if (!this.isClient() || !videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Ajusta o canvas para o tamanho do vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return null;

    // Captura o frame atual do vídeo
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converte para base64
    try {
      return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    } catch (error) {
      console.error('Erro ao capturar frame:', error);
      return null;
    }
  }

  static async sendFrameToAPI(frameData: string): Promise<PredictionResponse> {
    if (!this.isClient()) {
      throw new Error('API não disponível neste ambiente');
    }

    try {
      const response = await fetch(`${this.API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: frameData,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
      }

      const data = await response.json();
      return data as PredictionResponse;
    } catch (error) {
      console.error('Erro ao enviar frame:', error);
      throw error;
    }
  }
}