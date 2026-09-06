'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Message, UserProfile } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useChat(roomId: string, currentUser: UserProfile | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial messages load and Realtime setup
  useEffect(() => {
    if (!roomId) return;

    let isMounted = true;

    async function loadMessages() {
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('messages')
            .select('*, user:profiles(*)')
            .eq('room_id', roomId)
            .order('created_at', { ascending: true })
            .limit(100);

          if (!error && data && isMounted) {
            setMessages(data);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Could not load messages from Supabase:', err);
        }
      }

      // Default welcome message in room
      if (isMounted) {
        setMessages([
          {
            id: 'welcome-msg',
            room_id: roomId,
            user_id: 'system',
            content: '👋 Odaya hoş geldiniz! YouTube veya Netflix seçerek arkadaşlarınızla birlikte senkronize izleyebilir ve sesli sohbet edebilirsiniz.',
            created_at: new Date().toISOString(),
            user: {
              id: 'system',
              username: 'Sistem',
              avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SystemBot',
            },
          },
        ]);
        setLoading(false);
      }
    }

    loadMessages();

    // Setup Chat Broadcast & Typing Channel
    const channel = supabase.channel(`chat:${roomId}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'new-message' }, ({ payload }: { payload: Message }) => {
        if (!payload) return;
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.id)) return prev;
          return [...prev, payload];
        });
      })
      .on('broadcast', { event: 'typing' }, ({ payload }: { payload: { username: string; isTyping: boolean } }) => {
        if (!payload || payload.username === currentUser?.username) return;

        setTypingUsers((prev) => {
          if (payload.isTyping) {
            return prev.includes(payload.username) ? prev : [...prev, payload.username];
          } else {
            return prev.filter((u) => u !== payload.username);
          }
        });
      })
      .subscribe();

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [roomId, currentUser?.username]);

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || !currentUser) return;

      const newMsg: Message = {
        id: 'msg-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
        room_id: roomId,
        user_id: currentUser.id,
        content: trimmed,
        created_at: new Date().toISOString(),
        user: {
          id: currentUser.id,
          username: currentUser.username,
          avatar_url: currentUser.avatar_url,
        },
      };

      // Optimistic update
      setMessages((prev) => [...prev, newMsg]);

      // Broadcast immediately to channel
      channelRef.current?.send({
        type: 'broadcast',
        event: 'new-message',
        payload: newMsg,
      });

      // Clear typing indicator
      channelRef.current?.send({
        type: 'broadcast',
        event: 'typing',
        payload: { username: currentUser.username, isTyping: false },
      });

      // Persist to Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('messages').insert({
            room_id: roomId,
            user_id: currentUser.id,
            content: trimmed,
          });
        } catch (err) {
          console.warn('Failed to persist message to Supabase:', err);
        }
      }
    },
    [roomId, currentUser]
  );

  // Send typing notification
  const sendTyping = useCallback(() => {
    if (!currentUser || !channelRef.current) return;

    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { username: currentUser.username, isTyping: true },
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'typing',
        payload: { username: currentUser.username, isTyping: false },
      });
    }, 2500);
  }, [currentUser]);

  return {
    messages,
    loading,
    typingUsers,
    sendMessage,
    sendTyping,
  };
}
