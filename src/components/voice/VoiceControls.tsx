'use client';

import React from 'react';
import { Mic, MicOff, Headphones, PhoneOff, Radio, Signal, VolumeX } from 'lucide-react';

interface VoiceControlsProps {
  isConnected: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleMute: () => void;
  onToggleDeafen: () => void;
  error?: string | null;
}

export function VoiceControls({
  isConnected,
  isMuted,
  isDeafened,
  onConnect,
  onDisconnect,
  onToggleMute,
  onToggleDeafen,
  error,
}: VoiceControlsProps) {
  return (
    <div className="p-3 bg-[#151821] border-t border-white/[0.08]">
      {error && (
        <div className="mb-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px]">
          {error}
        </div>
      )}

      {isConnected ? (
        <div className="flex flex-col gap-2">
          {/* Connection Status Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <div>
                <p className="text-xs font-bold text-emerald-400 leading-none">Ses Bağlandı</p>
                <p className="text-[10px] text-gray-500 mt-0.5">RTC Mesh HD / STUN</p>
              </div>
            </div>

            <button
              onClick={onDisconnect}
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sesli Sohbetten Ayrıl"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Mic & Deafen Controls */}
          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={onToggleMute}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-[#1C202B] hover:bg-[#252a39] text-gray-200 border border-white/[0.08]'
              }`}
            >
              {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isMuted ? 'Mikrofon Aç' : 'Sustur'}</span>
            </button>

            <button
              onClick={onToggleDeafen}
              className={`flex items-center justify-center p-2 rounded-xl text-xs font-semibold transition-all ${
                isDeafened
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-[#1C202B] hover:bg-[#252a39] text-gray-200 border border-white/[0.08]'
              }`}
              title={isDeafened ? 'Sesi Aç' : 'Sağırlaştır'}
            >
              {isDeafened ? <VolumeX className="w-3.5 h-3.5" /> : <Headphones className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onConnect}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition-all"
        >
          <Radio className="w-4 h-4" />
          <span>Sesli Sohbete Katıl</span>
        </button>
      )}
    </div>
  );
}
