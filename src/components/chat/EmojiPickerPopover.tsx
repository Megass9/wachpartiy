'use client';

import React from 'react';

const COMMON_EMOJIS = [
  '🍿', '🎬', '🔥', '😂', '😍', '👏', '🎉', '🚀',
  '❤️', '✨', '😱', '👀', '😎', '🍕', '🍻', '🎧',
  '💯', '👍', '🙌', '⭐', '😴', '🤯', '😭', '🥳'
];

interface EmojiPickerPopoverProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPickerPopover({ onSelectEmoji, onClose }: EmojiPickerPopoverProps) {
  return (
    <div className="absolute bottom-12 right-2 z-40 p-3 rounded-2xl bg-[#1C202B] border border-white/10 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 w-64">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
        <span className="text-xs font-bold text-gray-300">Emojiler</span>
        <button
          onClick={onClose}
          className="text-xs text-gray-500 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {COMMON_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onSelectEmoji(emoji);
              onClose();
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-white/10 hover:scale-125 transition-all duration-150"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
