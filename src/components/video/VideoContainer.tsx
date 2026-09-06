'use client';

import React, { useState } from 'react';
import { AppType } from '@/types';
import { YouTubeAppScreen } from './YouTubeAppScreen';
import { NetflixAppScreen } from './NetflixAppScreen';
import { ScreenSharePlayer } from './ScreenSharePlayer';
import { AppSelectorModal } from '../room/AppSelectorModal';
import { LayoutGrid } from 'lucide-react';

interface VideoContainerProps {
  appType: AppType;
  videoId: string;
  isPlaying: boolean;
  onAppChange: (app: AppType, newVideoId?: string) => void;
  onVideoChange: (newVideoId: string, title?: string) => void;
  onPlayStateChange: (playing: boolean) => void;
  onSeek: (seconds: number) => void;
  registerPlayer: (controls: {
    play: () => void;
    pause: () => void;
    seekTo: (seconds: number) => void;
    getCurrentTime: () => number;
  }) => void;
  isOwner: boolean;
}

export function VideoContainer({
  appType,
  videoId,
  isPlaying,
  onAppChange,
  onVideoChange,
  onPlayStateChange,
  onSeek,
  registerPlayer,
  isOwner,
}: VideoContainerProps) {
  const [selectorOpen, setSelectorOpen] = useState(false);

  return (
    <div className="relative flex flex-col w-full h-full bg-black rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
      {/* App Switcher Pill in Top Bar */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        <button
          onClick={() => setSelectorOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151821]/90 hover:bg-[#1C202B] text-white text-xs font-semibold border border-white/10 backdrop-blur-md shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-violet-400" />
          <span>Uygulama Değiştir</span>
        </button>
      </div>

      {/* Render active app */}
      <div className="flex-1 w-full h-full">
        {appType === 'youtube' && (
          <YouTubeAppScreen
            videoId={videoId}
            isPlaying={isPlaying}
            onVideoSelect={(id, title) => onVideoChange(id, title)}
            onPlayStateChange={onPlayStateChange}
            onSeek={onSeek}
            registerPlayer={registerPlayer}
            isOwner={isOwner}
          />
        )}

        {appType === 'netflix' && (
          <NetflixAppScreen
            videoId={videoId}
            isPlaying={isPlaying}
            onVideoSelect={(id, title) => onVideoChange(id, title)}
            onPlayStateChange={onPlayStateChange}
            onSeek={onSeek}
            registerPlayer={registerPlayer}
            onSwitchToScreenShare={() => onAppChange('screenshare')}
            isOwner={isOwner}
          />
        )}

        {appType === 'screenshare' && (
          <ScreenSharePlayer
            isOwner={isOwner}
            onStopShare={() => onAppChange('youtube')}
          />
        )}
      </div>

      {/* App Selector Modal */}
      <AppSelectorModal
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        currentApp={appType}
        onSelectApp={(app: AppType) => onAppChange(app)}
      />
    </div>
  );
}
