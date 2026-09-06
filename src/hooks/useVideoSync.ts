'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { VideoSyncPayload, AppType } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseVideoSyncProps {
  roomId: string;
  isOwner: boolean;
  initialAppType?: AppType;
  initialVideoId?: string;
}

export function useVideoSync({
  roomId,
  isOwner,
  initialAppType = 'youtube',
  initialVideoId = 'jfKfPfyJRdk',
}: UseVideoSyncProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [appType, setAppType] = useState<AppType>(initialAppType);
  const [videoId, setVideoId] = useState<string>(initialVideoId);
  const [videoTitle, setVideoTitle] = useState<string>('');

  const channelRef = useRef<RealtimeChannel | null>(null);
  const isLocalActionRef = useRef(false);
  const lastSyncTimestampRef = useRef<number>(Date.now());

  // Player adapter methods attached by the active player (YouTube / Netflix / HTML5)
  const playerControlsRef = useRef<{
    play: () => void;
    pause: () => void;
    seekTo: (seconds: number) => void;
    getCurrentTime: () => number;
  } | null>(null);

  const registerPlayer = useCallback((controls: {
    play: () => void;
    pause: () => void;
    seekTo: (seconds: number) => void;
    getCurrentTime: () => number;
  }) => {
    playerControlsRef.current = controls;
  }, []);

  // Broadcast sync payload to room
  const broadcastSync = useCallback((action: VideoSyncPayload['action'], customTime?: number, customApp?: AppType, customVideoId?: string, customTitle?: string) => {
    if (!channelRef.current) return;

    const time = customTime !== undefined ? customTime : (playerControlsRef.current?.getCurrentTime() || currentTime);

    const payload: VideoSyncPayload = {
      type: 'video-sync',
      action,
      currentTime: time,
      isPlaying: action === 'play' ? true : (action === 'pause' ? false : isPlaying),
      appType: customApp || appType,
      videoId: customVideoId || videoId,
      videoTitle: customTitle || videoTitle,
      timestamp: Date.now(),
    };

    channelRef.current.send({
      type: 'broadcast',
      event: 'video-sync',
      payload,
    });
  }, [currentTime, isPlaying, appType, videoId, videoTitle]);

  // Setup Realtime Broadcast channel
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase.channel(`sync:${roomId}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'video-sync' }, ({ payload }: { payload: VideoSyncPayload }) => {
        if (!payload || payload.type !== 'video-sync') return;

        // Prevent echo if originated from local action within 200ms
        if (isLocalActionRef.current && Date.now() - lastSyncTimestampRef.current < 400) {
          return;
        }

        const { action, currentTime: incomingTime, isPlaying: incomingIsPlaying, appType: incomingApp, videoId: incomingVideoId, videoTitle: incomingTitle } = payload;

        if (incomingApp && incomingApp !== appType) {
          setAppType(incomingApp);
        }

        if (incomingVideoId && incomingVideoId !== videoId) {
          setVideoId(incomingVideoId);
        }

        if (incomingTitle) {
          setVideoTitle(incomingTitle);
        }

        const player = playerControlsRef.current;
        const currentLocalTime = player?.getCurrentTime() ?? currentTime;
        const drift = Math.abs(currentLocalTime - incomingTime);

        switch (action) {
          case 'play':
            setIsPlaying(true);
            if (drift > 0.8 && player) {
              player.seekTo(incomingTime);
            }
            player?.play();
            break;

          case 'pause':
            setIsPlaying(false);
            if (drift > 0.8 && player) {
              player.seekTo(incomingTime);
            }
            player?.pause();
            break;

          case 'seek':
            setCurrentTime(incomingTime);
            player?.seekTo(incomingTime);
            break;

          case 'sync':
            // Periodic sync check (if drift > 1.0s)
            if (drift > 1.0 && player) {
              player.seekTo(incomingTime);
              if (incomingIsPlaying) {
                player.play();
              } else {
                player.pause();
              }
            }
            setIsPlaying(incomingIsPlaying);
            break;

          case 'change-app':
            if (incomingApp) setAppType(incomingApp);
            if (incomingVideoId) setVideoId(incomingVideoId);
            break;

          case 'change-video':
            if (incomingVideoId) setVideoId(incomingVideoId);
            setCurrentTime(0);
            setIsPlaying(true);
            break;
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // If not owner, request sync from room members
          if (!isOwner) {
            channel.send({
              type: 'broadcast',
              event: 'video-sync',
              payload: {
                type: 'video-sync',
                action: 'sync',
                currentTime: 0,
                isPlaying: false,
                appType,
                videoId,
                timestamp: Date.now(),
              },
            });
          }
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, isOwner, appType, videoId, currentTime]);

  // Periodic Leader Sync: Room owner broadcasts current video time every 5 seconds
  useEffect(() => {
    if (!isOwner) return;

    const interval = setInterval(() => {
      if (playerControlsRef.current) {
        const time = playerControlsRef.current.getCurrentTime();
        broadcastSync('sync', time);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOwner, broadcastSync]);

  // Public control methods
  const triggerPlay = useCallback(() => {
    isLocalActionRef.current = true;
    lastSyncTimestampRef.current = Date.now();
    setIsPlaying(true);
    playerControlsRef.current?.play();
    broadcastSync('play');
    setTimeout(() => { isLocalActionRef.current = false; }, 500);
  }, [broadcastSync]);

  const triggerPause = useCallback(() => {
    isLocalActionRef.current = true;
    lastSyncTimestampRef.current = Date.now();
    setIsPlaying(false);
    playerControlsRef.current?.pause();
    broadcastSync('pause');
    setTimeout(() => { isLocalActionRef.current = false; }, 500);
  }, [broadcastSync]);

  const triggerSeek = useCallback((seconds: number) => {
    isLocalActionRef.current = true;
    lastSyncTimestampRef.current = Date.now();
    setCurrentTime(seconds);
    playerControlsRef.current?.seekTo(seconds);
    broadcastSync('seek', seconds);
    setTimeout(() => { isLocalActionRef.current = false; }, 500);
  }, [broadcastSync]);

  const changeApp = useCallback((newApp: AppType, newVideoId?: string, title?: string) => {
    setAppType(newApp);
    if (newVideoId) setVideoId(newVideoId);
    if (title) setVideoTitle(title);
    setCurrentTime(0);
    broadcastSync('change-app', 0, newApp, newVideoId, title);
  }, [broadcastSync]);

  const changeVideo = useCallback((newVideoId: string, title?: string) => {
    setVideoId(newVideoId);
    if (title) setVideoTitle(title);
    setCurrentTime(0);
    setIsPlaying(true);
    broadcastSync('change-video', 0, appType, newVideoId, title);
  }, [broadcastSync, appType]);

  return {
    isPlaying,
    currentTime,
    appType,
    videoId,
    videoTitle,
    registerPlayer,
    triggerPlay,
    triggerPause,
    triggerSeek,
    changeApp,
    changeVideo,
  };
}
