'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { PeerManager } from '@/lib/webrtc/peerManager';
import { AudioActivityDetector } from '@/lib/webrtc/audioDetector';
import { WebRTCSignalPayload, PresenceUser } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseWebRTCVoiceProps {
  roomId: string;
  currentUser: PresenceUser | null;
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

export function useWebRTCVoice({ roomId, currentUser, onSpeakingChange }: UseWebRTCVoiceProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isSpeakingLocally, setIsSpeakingLocally] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peerManagerRef = useRef<PeerManager | null>(null);
  const audioDetectorRef = useRef<AudioActivityDetector | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const voiceChannelRef = useRef<RealtimeChannel | null>(null);

  // Initialize Voice Signaling Channel
  useEffect(() => {
    if (!roomId || !currentUser) return;

    const channel = supabase.channel(`voice:${roomId}`);
    voiceChannelRef.current = channel;

    // Handle WebRTC signals from peers
    channel
      .on('broadcast', { event: 'webrtc-signal' }, async ({ payload }: { payload: WebRTCSignalPayload }) => {
        if (!payload || payload.to !== currentUser.id || !peerManagerRef.current) return;

        const { from, signalType, data } = payload;

        try {
          if (signalType === 'offer') {
            await peerManagerRef.current.handleOffer(from, data as RTCSessionDescriptionInit);
          } else if (signalType === 'answer') {
            await peerManagerRef.current.handleAnswer(from, data as RTCSessionDescriptionInit);
          } else if (signalType === 'candidate') {
            await peerManagerRef.current.handleCandidate(from, data as RTCIceCandidateInit);
          }
        } catch (err) {
          console.error('Error processing WebRTC signal:', err);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, currentUser]);

  // Connect to Voice (get mic stream & initialize peers)
  const connectVoice = useCallback(async () => {
    if (!currentUser || !voiceChannelRef.current) return;
    setError(null);

    try {
      // 1. Get user microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      localStreamRef.current = stream;

      // 2. Set up Audio Activity Detector
      const detector = new AudioActivityDetector((speaking) => {
        setIsSpeakingLocally(speaking);
        onSpeakingChange?.(speaking);
      });
      detector.start(stream);
      audioDetectorRef.current = detector;

      // 3. Set up PeerManager
      const peerManager = new PeerManager(
        (toUserId, signalType, data) => {
          // Send signaling message via Supabase Realtime
          voiceChannelRef.current?.send({
            type: 'broadcast',
            event: 'webrtc-signal',
            payload: {
              type: 'webrtc-signal',
              signalType,
              from: currentUser.id,
              to: toUserId,
              data,
            } as WebRTCSignalPayload,
          });
        },
        (userId, remoteStream) => {
          console.log(`Received audio track from ${userId}`);
        },
        (userId) => {
          console.log(`Peer ${userId} disconnected from voice`);
        }
      );

      peerManager.setLocalStream(stream);
      peerManagerRef.current = peerManager;

      setIsConnected(true);
      setIsMuted(false);
    } catch (err: unknown) {
      console.error('Failed to access microphone:', err);
      const errMsg = err instanceof Error ? err.message : 'Mikrofona erişilemedi. Lütfen tarayıcı izinlerini kontrol edin.';
      setError(errMsg);
    }
  }, [currentUser, onSpeakingChange]);

  // Disconnect from voice
  const disconnectVoice = useCallback(() => {
    // Stop local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Stop audio detector
    if (audioDetectorRef.current) {
      audioDetectorRef.current.stop();
      audioDetectorRef.current = null;
    }

    // Close all peer connections
    if (peerManagerRef.current) {
      peerManagerRef.current.closeAll();
      peerManagerRef.current = null;
    }

    setIsConnected(false);
    setIsSpeakingLocally(false);
    onSpeakingChange?.(false);
  }, [onSpeakingChange]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    const newMute = !isMuted;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !newMute;
    });
    setIsMuted(newMute);
    if (newMute) {
      setIsSpeakingLocally(false);
      onSpeakingChange?.(false);
    }
  }, [isMuted, onSpeakingChange]);

  // Toggle Deafen
  const toggleDeafen = useCallback(() => {
    const newDeafen = !isDeafened;
    setIsDeafened(newDeafen);
    // If deafened, also mute mic
    if (newDeafen && !isMuted) {
      toggleMute();
    }
  }, [isDeafened, isMuted, toggleMute]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnectVoice();
    };
  }, [disconnectVoice]);

  return {
    isConnected,
    isMuted,
    isDeafened,
    isSpeakingLocally,
    error,
    connectVoice,
    disconnectVoice,
    toggleMute,
    toggleDeafen,
  };
}
