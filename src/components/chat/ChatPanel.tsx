'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, MessageSquare, Sparkles } from 'lucide-react';
import { Message, UserProfile } from '@/types';
import { EmojiPickerPopover } from './EmojiPickerPopover';

interface ChatPanelProps {
  messages: Message[];
  typingUsers: string[];
  currentUser: UserProfile | null;
  onSendMessage: (text: string) => void;
  onTyping: () => void;
}

export function ChatPanel({
  messages,
  typingUsers,
  currentUser,
  onSendMessage,
  onTyping,
}: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    onTyping();
  };

  const handleSelectEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  return (
    <div className="flex flex-col h-full bg-[#151821] border-l border-white/[0.08]">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3.5 bg-[#151821] border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Oda Sohbeti
          </span>
        </div>
        <span className="text-[10px] text-gray-500 font-medium">Canlı Realtime</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => {
          const isMe = currentUser?.id === msg.user_id;
          const time = new Date(msg.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                isMe ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <img
                src={
                  msg.user?.avatar_url ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.user?.username || 'user'}`
                }
                alt={msg.user?.username || 'User'}
                className="w-7 h-7 rounded-lg shrink-0 mt-0.5 bg-violet-950/40"
              />

              {/* Bubble & Metadata */}
              <div
                className={`flex flex-col max-w-[80%] ${
                  isMe ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-0.5">
                  <span className="text-[11px] font-semibold text-gray-300">
                    {msg.user?.username || 'Kullanıcı'}
                  </span>
                  <span className="text-[9px] text-gray-500">{time}</span>
                </div>

                <div
                  className={`px-3 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-md ${
                    isMe
                      ? 'bg-violet-600 text-white rounded-tr-none'
                      : 'bg-[#1C202B] text-gray-200 border border-white/[0.06] rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-[11px] text-gray-400 italic pt-1">
            <span className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.4s]" />
            </span>
            <span>{typingUsers.join(', ')} yazıyor...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="relative p-3 bg-[#151821] border-t border-white/[0.08]">
        {showEmojiPicker && (
          <EmojiPickerPopover
            onSelectEmoji={handleSelectEmoji}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Mesaj gönder..."
              className="w-full pl-3.5 pr-9 py-2.5 text-xs bg-[#1C202B] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/60 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2.5 text-gray-400 hover:text-white transition-colors"
              title="Emoji ekle"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:hover:bg-violet-600 text-white shadow-lg shadow-violet-600/30 transition-all active:scale-95"
            title="Gönder"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
