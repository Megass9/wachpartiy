export type AppType = 'youtube' | 'netflix' | 'screenshare' | 'custom';

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  created_at?: string;
}

export interface Room {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  is_private: boolean;
  is_locked: boolean;
  max_users: number;
  app_type: AppType;
  video_url?: string | null;
  video_id: string;
  created_at: string;
  owner?: UserProfile;
  active_count?: number;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  profile?: UserProfile;
}

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: UserProfile;
}

export type VideoSyncAction = 'play' | 'pause' | 'seek' | 'sync' | 'change-app' | 'change-video';

export interface VideoSyncPayload {
  type: 'video-sync';
  action: VideoSyncAction;
  currentTime: number;
  isPlaying: boolean;
  appType: AppType;
  videoId: string;
  videoTitle?: string;
  timestamp: number;
}

export interface PresenceUser {
  id: string;
  username: string;
  avatar_url: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  joinedAt: string;
}

export interface WebRTCSignalPayload {
  type: 'webrtc-signal';
  signalType: 'offer' | 'answer' | 'candidate';
  from: string;
  to: string;
  data: RTCSessionDescriptionInit | RTCIceCandidateInit;
}

export interface CatalogItem {
  id: string;
  title: string;
  category: string;
  duration?: string;
  thumbnail: string;
  videoId: string;
  description: string;
  rating?: string;
  year?: string;
  tags?: string[];
  bannerUrl?: string;
}
