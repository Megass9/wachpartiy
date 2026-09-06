'use client';

import React from 'react';
import { X, Lock, Unlock, UserX, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { Room, PresenceUser } from '@/types';

interface OwnerControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  members: PresenceUser[];
  onToggleLock: () => void;
  onKickUser?: (userId: string) => void;
  onDeleteRoom?: () => void;
}

export function OwnerControlsModal({
  isOpen,
  onClose,
  room,
  members,
  onToggleLock,
  onKickUser,
  onDeleteRoom,
}: OwnerControlsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#151821] border border-white/10 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Oda Sahibi Kontrolleri</h3>
              <p className="text-xs text-gray-400">Yalnızca oda sahibi tarafından yönetilebilir</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-5 space-y-4">
          {/* Lock Room Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1C202B] border border-white/[0.06]">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                {room.is_locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
                Oda Kilidi
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {room.is_locked ? 'Oda kilitli; yeni kullanıcılar katılamaz.' : 'Oda açık; davet bağlantısına sahip herkes katılabilir.'}
              </p>
            </div>

            <button
              onClick={onToggleLock}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                room.is_locked
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30'
                  : 'bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30'
              }`}
            >
              {room.is_locked ? 'Kilidi Aç' : 'Odayı Kilitle'}
            </button>
          </div>

          {/* Members Kick Section */}
          <div>
            <h4 className="text-xs font-bold text-gray-300 mb-2">Odadaki Kullanıcılar</h4>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#1C202B]/60 border border-white/[0.04]"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={member.avatar_url}
                      alt={member.username}
                      className="w-6 h-6 rounded-md bg-violet-950/40"
                    />
                    <span className="text-xs font-medium text-white">{member.username}</span>
                  </div>

                  {member.id !== room.owner_id && (
                    <button
                      onClick={() => onKickUser?.(member.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] transition-colors"
                      title="Kullanıcıyı Odadan Çıkar"
                    >
                      <UserX className="w-3 h-3" />
                      <span>Çıkar</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-3 border-t border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-rose-400">Odayı Kapat ve Sil</p>
                <p className="text-[10px] text-gray-500">Bu işlem geri alınamaz.</p>
              </div>
              <button
                onClick={onDeleteRoom}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-lg shadow-rose-600/25 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Odayı Sil</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
