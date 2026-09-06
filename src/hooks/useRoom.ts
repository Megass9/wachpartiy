'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Room, PresenceUser, UserProfile, AppType } from '@/types';
import { SAMPLE_ROOMS } from '@/lib/mockData';
import { RealtimeChannel } from '@supabase/supabase-js';

const LOCAL_ROOMS_KEY = 'watch_together_custom_rooms';

export function useRoom(roomId?: string, currentUser?: UserProfile | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<PresenceUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Helper to load rooms from localStorage
  const getStoredRooms = (): Room[] => {
    try {
      const stored = localStorage.getItem(LOCAL_ROOMS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Helper to save rooms to localStorage
  const saveStoredRooms = (rooms: Room[]) => {
    localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(rooms));
  };

  // Fetch Room data
  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchRoom() {
      setLoading(true);

      // Check Real Supabase first
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('rooms')
            .select('*, owner:profiles(*)')
            .eq('id', roomId)
            .single();

          if (!error && data && isMounted) {
            setRoom(data);
            setIsOwner(currentUser?.id === data.owner_id);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Error loading room from Supabase, checking local/sample:', err);
        }
      }

      // Fallback: Check local custom rooms or sample rooms
      const customRooms = getStoredRooms();
      const allLocal = [...customRooms, ...SAMPLE_ROOMS];
      const found = allLocal.find((r) => r.id === roomId);

      if (found && isMounted) {
        setRoom(found);
        setIsOwner(currentUser?.id === found.owner_id);
      } else if (isMounted) {
        // Auto-generate room if direct link
        const newRoom: Room = {
          id: roomId || 'room-default',
          name: 'Özel Sinema Odası',
          description: 'Arkadaşlarla anlık paylaşılan özel oda.',
          owner_id: currentUser?.id || 'guest-owner',
          is_private: true,
          is_locked: false,
          max_users: 10,
          app_type: 'youtube',
          video_id: 'jfKfPfyJRdk',
          created_at: new Date().toISOString(),
          owner: currentUser || {
            id: 'guest-owner',
            username: 'Oda Kurucusu',
            avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=owner',
          },
          active_count: 1,
        };
        setRoom(newRoom);
        setIsOwner(true);
      }
      if (isMounted) setLoading(false);
    }

    fetchRoom();

    return () => {
      isMounted = false;
    };
  }, [roomId, currentUser?.id]);

  // Handle Presence & Realtime Channel
  useEffect(() => {
    if (!roomId || !currentUser) return;

    const channelName = `room:${roomId}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

    channelRef.current = channel;

    // Presence state sync
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const activeUsers: PresenceUser[] = [];

        Object.values(presenceState).forEach((presences) => {
          (presences as unknown as PresenceUser[]).forEach((p) => {
            if (p && p.id && !activeUsers.some((u) => u.id === p.id)) {
              activeUsers.push(p);
            }
          });
        });

        if (activeUsers.length > 0) {
          setMembers(activeUsers);
        }
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setMembers((prev) => {
          const updated = [...prev];
          (newPresences as unknown as PresenceUser[]).forEach((p) => {
            if (!updated.some((u) => u.id === p.id)) {
              updated.push(p);
            }
          });
          return updated;
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setMembers((prev) => {
          const leftIds = (leftPresences as unknown as PresenceUser[]).map((p) => p.id);
          return prev.filter((u) => !leftIds.includes(u.id));
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const myPresence: PresenceUser = {
            id: currentUser.id,
            username: currentUser.username,
            avatar_url: currentUser.avatar_url,
            isSpeaking: false,
            isMuted: false,
            isDeafened: false,
            joinedAt: new Date().toISOString(),
          };
          await channel.track(myPresence);
        }
      });

    // Default presence fallback if offline
    setMembers((prev) => {
      if (!prev.some((m) => m.id === currentUser.id)) {
        return [
          ...prev,
          {
            id: currentUser.id,
            username: currentUser.username,
            avatar_url: currentUser.avatar_url,
            isSpeaking: false,
            isMuted: false,
            isDeafened: false,
            joinedAt: new Date().toISOString(),
          },
        ];
      }
      return prev;
    });

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, currentUser]);

  // Update presence status (e.g. speaking, mute, deafen)
  const updatePresenceStatus = useCallback(
    async (updates: Partial<PresenceUser>) => {
      if (!channelRef.current || !currentUser) return;
      const myPresence: Partial<PresenceUser> = {
        id: currentUser.id,
        username: currentUser.username,
        avatar_url: currentUser.avatar_url,
        ...updates,
      };
      try {
        await channelRef.current.track(myPresence);
      } catch (err) {
        console.warn('Presence update error:', err);
      }

      // Update local member state
      setMembers((prev) =>
        prev.map((m) => (m.id === currentUser.id ? { ...m, ...updates } : m))
      );
    },
    [currentUser]
  );

  // Room Owner Actions
  const updateRoomApp = useCallback(
    async (appType: AppType, videoId?: string) => {
      if (!room) return;
      const updated = {
        ...room,
        app_type: appType,
        video_id: videoId || room.video_id,
      };
      setRoom(updated);

      if (isSupabaseConfigured()) {
        await supabase
          .from('rooms')
          .update({ app_type: appType, video_id: videoId || room.video_id })
          .eq('id', room.id);
      }

      // Update local storage
      const rooms = getStoredRooms();
      const index = rooms.findIndex((r) => r.id === room.id);
      if (index !== -1) {
        rooms[index] = updated;
        saveStoredRooms(rooms);
      }
    },
    [room]
  );

  const toggleLockRoom = useCallback(async () => {
    if (!room) return;
    const newLock = !room.is_locked;
    setRoom({ ...room, is_locked: newLock });

    if (isSupabaseConfigured()) {
      await supabase
        .from('rooms')
        .update({ is_locked: newLock })
        .eq('id', room.id);
    }
  }, [room]);

  return {
    room,
    setRoom,
    members,
    loading,
    isOwner,
    channel: channelRef.current,
    updatePresenceStatus,
    updateRoomApp,
    toggleLockRoom,
  };
}
