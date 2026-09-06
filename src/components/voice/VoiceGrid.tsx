'use client';

import React from 'react';
import { Users, Volume2 } from 'lucide-react';
import { PresenceUser } from '@/types';
import { VoiceUserCard } from './VoiceUserCard';

interface VoiceGridProps {
  members: PresenceUser[];
  currentUserId?: string;
  ownerId?: string;
}

export function VoiceGrid({ members, currentUserId, ownerId }: VoiceGridProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Voice Section Header */}
      <div className="flex items-center justify-between p-3 bg-[#151821] border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Sesli Katılımcılar
          </span>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-gray-400">
          {members.length}
        </span>
      </div>

      {/* Voice Users List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {members.map((member) => (
          <VoiceUserCard
            key={member.id}
            user={member}
            isOwner={member.id === ownerId}
            isCurrentUser={member.id === currentUserId}
          />
        ))}

        {members.length === 0 && (
          <div className="text-center py-6 text-gray-500 text-xs">
            Henüz kimse sesli sohbete katılmadı.
          </div>
        )}
      </div>
    </div>
  );
}
