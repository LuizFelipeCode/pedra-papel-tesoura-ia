import React, { useEffect, useRef } from 'react';

const VideoComponent = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startCamera = async () => {
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
          // Garante que o vídeo comece a ser reproduzido assim que estiver pronto
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
          };
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Não foi possível acessar a câmera. Por favor, verifique as permissões.");
      }
    };

    startCamera();

    // Cleanup function
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
};

export default VideoComponent;