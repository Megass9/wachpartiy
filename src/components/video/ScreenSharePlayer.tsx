'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MonitorPlay, StopCircle, Volume2, VolumeX, Maximize, AlertCircle } from 'lucide-react';

interface ScreenSharePlayerProps {
  isOwner: boolean;
  onStopShare?: () => void;
}

export function ScreenSharePlayer({ isOwner, onStopShare }: ScreenSharePlayerProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScreenShare = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
        },
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsSharing(true);

      // Listen for when user stops screen share from browser controls
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (err: unknown) {
      console.warn('Screen share cancelled or failed:', err);
      if (err instanceof Error && err.name !== 'NotAllowedError') {
        setError('Ekran paylaşılamadı: ' + err.message);
      }
    }
  };

  const stopScreenShare = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsSharing(false);
    onStopShare?.();
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden">
      {isSharing ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />

          {/* Screen Share Floating Overlay Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#151821]/90 backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 pr-3 border-r border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">CANLI YAYIN</span>
            </div>

            <button
              onClick={toggleMute}
              className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <Maximize className="w-4 h-4" />
            </button>

            <button
              onClick={stopScreenShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all"
            >
              <StopCircle className="w-4 h-4" />
              <span>Yayını Durdur</span>
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mb-4 text-violet-400">
            <MonitorPlay className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            Ekran & Netflix Yayını
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed mb-6">
            Bilgisayarınızdaki Netflix sekmesini veya dilediğiniz herhangi bir uygulamayı sesli ve yüksek çözünürlükte odaya aktarın.
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={startScreenShare}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-violet-600/30 active:scale-95 transition-all"
          >
            <MonitorPlay className="w-4 h-4" />
            <span>Ekran / Netflix Sekmesini Paylaş</span>
          </button>
        </div>
      )}
    </div>
  );
}
