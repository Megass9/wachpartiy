'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Film,
  Compass,
  MessageSquare,
  Volume2,
  Users,
  Settings,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useRoom } from '@/hooks/useRoom';
import { useVideoSync } from '@/hooks/useVideoSync';
import { useWebRTCVoice } from '@/hooks/useWebRTCVoice';
import { useChat } from '@/hooks/useChat';
import { RoomHeader } from '@/components/room/RoomHeader';
import { VideoContainer } from '@/components/video/VideoContainer';
import { VoiceGrid } from '@/components/voice/VoiceGrid';
import { VoiceControls } from '@/components/voice/VoiceControls';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { OwnerControlsModal } from '@/components/room/OwnerControlsModal';
import { AppSelectorModal } from '@/components/room/AppSelectorModal';
import { AppType } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;
  const router = useRouter();
  const { showToast } = useToast();

  const { profile, signOut } = useSupabaseAuth();
  const {
    room,
    members,
    loading: roomLoading,
    isOwner,
    updatePresenceStatus,
    updateRoomApp,
    toggleLockRoom,
  } = useRoom(roomId, profile);

  // Video sync hook
  const {
    isPlaying,
    currentTime,
    appType,
    videoId,
    registerPlayer,
    triggerPlay,
    triggerPause,
    triggerSeek,
    changeApp,
    changeVideo,
  } = useVideoSync({
    roomId,
    isOwner,
    initialAppType: room?.app_type || 'youtube',
    initialVideoId: room?.video_id || 'aqz-KE-bpKQ',
  });

  // Current user's voice presence representation
  const currentPresenceUser = members.find((m) => m.id === profile?.id) || {
    id: profile?.id || 'guest',
    username: profile?.username || 'Kullanıcı',
    avatar_url: profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.id || 'guest'}`,
    isSpeaking: false,
    isMuted: false,
    isDeafened: false,
    joinedAt: new Date().toISOString(),
  };

  // WebRTC Voice hook
  const {
    isConnected: isVoiceConnected,
    isMuted,
    isDeafened,
    error: voiceError,
    connectVoice,
    disconnectVoice,
    toggleMute,
    toggleDeafen,
  } = useWebRTCVoice({
    roomId,
    currentUser: currentPresenceUser,
    onSpeakingChange: (isSpeaking) => {
      updatePresenceStatus({ isSpeaking });
    },
  });

  // Live Chat hook
  const { messages, typingUsers, sendMessage, sendTyping } = useChat(roomId, profile);

  // UI state modals & mobile tabs
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [appSelectorOpen, setAppSelectorOpen] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<'video' | 'voice' | 'chat'>('video');

  const handleAppChange = (newApp: AppType, newVideoId?: string) => {
    changeApp(newApp, newVideoId);
    updateRoomApp(newApp, newVideoId);
    showToast(`Oda uygulaması ${newApp.toUpperCase()} olarak güncellendi!`, 'info');
  };

  const handleKickUser = (userId: string) => {
    showToast('Kullanıcı odadan çıkarıldı', 'info');
  };

  const handleDeleteRoom = () => {
    showToast('Oda kapatıldı', 'info');
    router.push('/dashboard');
  };

  if (roomLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0D12] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-400">Odaya bağlanılıyor...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0D12] text-white p-4">
        <h2 className="text-xl font-bold mb-2">Oda Bulunamadı</h2>
        <p className="text-xs text-gray-400 mb-4">Bu oda kapatılmış veya silinmiş olabilir.</p>
        <Link href="/dashboard" className="px-4 py-2 bg-violet-600 rounded-xl text-xs font-semibold">
          Odalar Sayfasına Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0D12] text-white select-none">
      {/* 1. LEFT PANEL (Discord Style Navigation) */}
      <aside
        className={`hidden md:flex flex-col border-r border-white/[0.08] bg-[#11141D] transition-all duration-300 z-30 ${
          leftSidebarCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/25">
              <Film className="w-4 h-4 text-white" />
            </div>
            {!leftSidebarCollapsed && (
              <span className="font-bold text-sm tracking-tight text-white truncate">
                Watch<span className="text-violet-400">Together</span>
              </span>
            )}
          </Link>

          <button
            onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            {leftSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Nav Links */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all"
            title="Odaları Keşfet"
          >
            <Compass className="w-4 h-4 text-violet-400 shrink-0" />
            {!leftSidebarCollapsed && <span>Tüm Odalar</span>}
          </Link>

          <button
            onClick={() => setAppSelectorOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all text-left"
            title="Uygulama Seç (YouTube / Netflix)"
          >
            <LayoutGrid className="w-4 h-4 text-amber-400 shrink-0" />
            {!leftSidebarCollapsed && <span>Uygulama Seçici</span>}
          </button>

          {isOwner && (
            <button
              onClick={() => setOwnerModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all text-left"
              title="Oda Ayarları"
            >
              <Settings className="w-4 h-4 text-emerald-400 shrink-0" />
              {!leftSidebarCollapsed && <span>Oda Ayarları</span>}
            </button>
          )}
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-white/[0.08] bg-[#0E1017]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={
                  profile?.avatar_url ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || 'user'}`
                }
                alt={profile?.username || 'User'}
                className="w-8 h-8 rounded-xl bg-violet-950/50 shrink-0"
              />
              {!leftSidebarCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{profile?.username}</p>
                  <p className="text-[10px] text-gray-400">Çevrimiçi</p>
                </div>
              )}
            </div>

            {!leftSidebarCollapsed && (
              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Çıkış Yap"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. CENTER & RIGHT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Room Header */}
        <RoomHeader
          room={room}
          isOwner={isOwner}
          memberCount={members.length}
          onOpenOwnerControls={() => setOwnerModalOpen(true)}
          onOpenAppSelector={() => setAppSelectorOpen(true)}
        />

        {/* Mobile Navigation Segment Control */}
        <div className="flex md:hidden items-center justify-around bg-[#151821] border-b border-white/[0.08] p-1 text-xs">
          <button
            onClick={() => setMobileActiveTab('video')}
            className={`flex-1 py-1.5 font-semibold rounded-lg ${
              mobileActiveTab === 'video' ? 'bg-violet-600 text-white' : 'text-gray-400'
            }`}
          >
            🎬 Video
          </button>
          <button
            onClick={() => setMobileActiveTab('voice')}
            className={`flex-1 py-1.5 font-semibold rounded-lg ${
              mobileActiveTab === 'voice' ? 'bg-violet-600 text-white' : 'text-gray-400'
            }`}
          >
            🎙️ Ses ({members.length})
          </button>
          <button
            onClick={() => setMobileActiveTab('chat')}
            className={`flex-1 py-1.5 font-semibold rounded-lg ${
              mobileActiveTab === 'chat' ? 'bg-violet-600 text-white' : 'text-gray-400'
            }`}
          >
            💬 Sohbet
          </button>
        </div>

        {/* Split Stage Area */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Main Video & App Stage (Center) */}
          <section
            className={`flex-1 flex flex-col p-3 sm:p-4 min-w-0 overflow-hidden ${
              mobileActiveTab !== 'video' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="flex-1 w-full h-full min-h-[300px]">
              <VideoContainer
                appType={appType}
                videoId={videoId}
                isPlaying={isPlaying}
                onAppChange={handleAppChange}
                onVideoChange={(newId, title) => changeVideo(newId, title)}
                onPlayStateChange={(playing) => {
                  if (playing) triggerPlay();
                  else triggerPause();
                }}
                onSeek={(secs) => triggerSeek(secs)}
                registerPlayer={registerPlayer}
                isOwner={isOwner}
              />
            </div>
          </section>

          {/* 3. RIGHT PANEL: Voice & Live Chat (Desktop Split or Mobile Tab) */}
          <aside
            className={`w-full md:w-80 lg:w-96 flex flex-col border-l border-white/[0.08] bg-[#151821] min-h-0 ${
              mobileActiveTab === 'video' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Top Half of Right Panel: Voice Grid & Controls */}
            <div
              className={`flex flex-col border-b border-white/[0.08] ${
                mobileActiveTab === 'chat' ? 'hidden md:flex md:h-52 lg:h-60' : 'flex-1 md:h-52 lg:h-60'
              }`}
            >
              <div className="flex-1 overflow-hidden">
                <VoiceGrid
                  members={members}
                  currentUserId={profile?.id}
                  ownerId={room.owner_id}
                />
              </div>

              <VoiceControls
                isConnected={isVoiceConnected}
                isMuted={isMuted}
                isDeafened={isDeafened}
                onConnect={connectVoice}
                onDisconnect={disconnectVoice}
                onToggleMute={() => {
                  toggleMute();
                  updatePresenceStatus({ isMuted: !isMuted });
                }}
                onToggleDeafen={() => {
                  toggleDeafen();
                  updatePresenceStatus({ isDeafened: !isDeafened });
                }}
                error={voiceError}
              />
            </div>

            {/* Bottom Half of Right Panel: Discord Live Chat */}
            <div
              className={`flex flex-col ${
                mobileActiveTab === 'voice' ? 'hidden md:flex flex-1' : 'flex-1'
              } min-h-0`}
            >
              <ChatPanel
                messages={messages}
                typingUsers={typingUsers}
                currentUser={profile}
                onSendMessage={sendMessage}
                onTyping={sendTyping}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Owner Controls Modal */}
      <OwnerControlsModal
        isOpen={ownerModalOpen}
        onClose={() => setOwnerModalOpen(false)}
        room={room}
        members={members}
        onToggleLock={toggleLockRoom}
        onKickUser={handleKickUser}
        onDeleteRoom={handleDeleteRoom}
      />

      {/* App Selector Modal */}
      <AppSelectorModal
        isOpen={appSelectorOpen}
        onClose={() => setAppSelectorOpen(false)}
        currentApp={appType}
        onSelectApp={handleAppChange}
      />
    </div>
  );
}
