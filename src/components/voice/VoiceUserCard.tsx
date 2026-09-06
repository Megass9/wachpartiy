'use client';

import React from 'react';
import { Mic, MicOff, VolumeX, Crown } from 'lucide-react';
import { PresenceUser } from '@/types';

interface VoiceUserCardProps {
  user: PresenceUser;
  isOwner?: boolean;
  isCurrentUser?: boolean;
}

export function VoiceUserCard({ user, isOwner, isCurrentUser }: VoiceUserCardProps) {
  return (
    <div
      className={`relative flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
        user.isSpeaking
          ? 'bg-emerald-500/10 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
          : 'bg-[#1C202B]/60 hover:bg-[#1C202B] border border-white/[0.05]'
      }`}
    >
      {/* Avatar with speaking pulse */}
      <div className="relative shrink-0">
        <div
          className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
            user.isSpeaking
              ? 'border-emerald-500 speaking-ring ring-2 ring-emerald-500/40'
              : 'border-transparent'
          }`}
        >
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
            alt={user.username}
            className="w-full h-full object-cover bg-violet-950/40"
          />
        </div>

        {/* Owner Crown */}
        {isOwner && (
          <div className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-amber-500 text-amber-950 flex items-center justify-center shadow-md">
            <Crown className="w-2.5 h-2.5 fill-current" />
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-semibold text-white truncate">
            {user.username}
          </p>
          {isCurrentUser && (
            <span className="text-[10px] text-gray-500 font-medium">(Sen)</span>
          )}
        </div>
        <p className="text-[10px] text-gray-400">
          {user.isSpeaking ? (
            <span className="text-emerald-400 font-medium">Konuşuyor...</span>
          ) : user.isMuted ? (
            <span className="text-gray-500">Sessizde</span>
          ) : (
            <span className="text-gray-500">Dinliyor</span>
          )}
        </p>
      </div>

      {/* Mic / Deafen Status Badges */}
      <div className="flex items-center gap-1">
        {user.isDeafened ? (
          <div className="p-1 rounded-md bg-rose-500/20 text-rose-400">
            <VolumeX className="w-3.5 h-3.5" />
          </div>
        ) : user.isMuted ? (
          <div className="p-1 rounded-md bg-rose-500/20 text-rose-400">
            <MicOff className="w-3.5 h-3.5" />
          </div>
        ) : (
          <div className={`p-1 rounded-md ${user.isSpeaking ? 'text-emerald-400 bg-emerald-500/20' : 'text-gray-400'}`}>
            <Mic className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </div>
  );
}
