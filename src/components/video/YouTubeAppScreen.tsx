'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Play,
  ArrowLeft,
  Film,
  Music,
  Gamepad2,
  Sparkles,
  Flame,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { YoutubeIcon } from '@/components/ui/Icons';
import { CatalogItem } from '@/types';
import { YOUTUBE_PRESETS } from '@/lib/mockData';

interface YouTubeAppScreenProps {
  videoId: string;
  isPlaying: boolean;
  onVideoSelect: (videoId: string, title?: string) => void;
  onPlayStateChange: (playing: boolean) => void;
  onSeek: (seconds: number) => void;
  registerPlayer: (controls: {
    play: () => void;
    pause: () => void;
    seekTo: (seconds: number) => void;
    getCurrentTime: () => number;
  }) => void;
  isOwner: boolean;
}

// Declare YouTube IFrame API global type
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function YouTubeAppScreen({
  videoId,
  isPlaying,
  onVideoSelect,
  onPlayStateChange,
  onSeek,
  registerPlayer,
  isOwner,
}: YouTubeAppScreenProps) {
  const [activeCategory, setActiveCategory] = useState('Hepsi');
  const [searchQuery, setSearchQuery] = useState('');
  // User requested: "YouTube'da ana ekranı gelsin, video seçelim oynasın" -> default viewMode is 'home'
  const [viewMode, setViewMode] = useState<'home' | 'player'>('home');
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const playerRef = useRef<any>(null);
  const internalSeekRef = useRef(false);

  const categories = [
    { name: 'Hepsi', icon: Sparkles },
    { name: 'Trendler', icon: Flame },
    { name: 'Oyun', icon: Gamepad2 },
    { name: 'Sinema & Fragman', icon: Film },
    { name: 'Doğa & Uzay', icon: Radio },
  ];

  // Filter presets
  const filteredVideos = YOUTUBE_PRESETS.filter((item) => {
    const matchesCategory =
      activeCategory === 'Hepsi' ||
      item.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
      (activeCategory === 'Trendler' && item.tags?.includes('Trend'));
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player('yt-player-container', {
        width: '100%',
        height: '100%',
        videoId: videoId || 'QdBZY2fkU-0',
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
        events: {
          onReady: () => {
            setIsPlayerReady(true);
            registerPlayer({
              play: () => {
                if (playerRef.current?.playVideo) playerRef.current.playVideo();
              },
              pause: () => {
                if (playerRef.current?.pauseVideo) playerRef.current.pauseVideo();
              },
              seekTo: (seconds: number) => {
                if (playerRef.current?.seekTo) {
                  internalSeekRef.current = true;
                  playerRef.current.seekTo(seconds, true);
                  setTimeout(() => { internalSeekRef.current = false; }, 400);
                }
              },
              getCurrentTime: () => {
                return playerRef.current?.getCurrentTime ? playerRef.current.getCurrentTime() : 0;
              },
            });
          },
          onStateChange: (event: any) => {
            if (event.data === 1 && !internalSeekRef.current) {
              onPlayStateChange(true);
            } else if (event.data === 2 && !internalSeekRef.current) {
              onPlayStateChange(false);
            }
          },
          onError: (event: any) => {
            console.warn('YouTube Player Error:', event.data);
            if (videoId !== 'aqz-KE-bpKQ') {
              handleSelectVideo('aqz-KE-bpKQ', 'Açık Kaynak 4K Sinema (Yedek)');
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  // When ANY user selects a video, switch to player view and broadcast to room
  const handleSelectVideo = (newId: string, title?: string) => {
    onVideoSelect(newId, title);
    setViewMode('player');
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(newId);
    }
  };

  // If another participant changes the video remotely, open player view
  useEffect(() => {
    if (videoId && videoId !== 'QdBZY2fkU-0' && videoId !== 'aqz-KE-bpKQ') {
      setViewMode('player');
    }
  }, [videoId]);

  // Handle custom search query or direct URL/ID paste
  const handleCustomSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    let extractedId = query;
    if (query.includes('youtu.be/')) {
      extractedId = query.split('youtu.be/')[1]?.split('?')[0] || query;
    } else if (query.includes('youtube.com/watch?v=')) {
      extractedId = query.split('watch?v=')[1]?.split('&')[0] || query;
    }

    if (extractedId.length >= 10 && !extractedId.includes(' ')) {
      handleSelectVideo(extractedId, 'YouTube Videosu');
      setSearchQuery('');
    }
  };

  return (
    <div className="relative flex flex-col w-full h-full bg-[#0B0D12] text-white select-none overflow-hidden">
      {/* Top YouTube Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:px-4 bg-[#151821] border-b border-white/[0.08] z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/10 border border-red-500/20 text-red-500 font-bold text-xs tracking-wider uppercase">
            <YoutubeIcon className="w-4 h-4 text-red-500" />
            <span>YouTube</span>
          </div>

          {viewMode === 'player' ? (
            <button
              onClick={() => setViewMode('home')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-red-400" />
              <span>Ana Ekrana Dön (Video Seç)</span>
            </button>
          ) : (
            <span className="text-xs text-gray-400 font-medium hidden sm:inline">
              Bir video seçin, tüm odada senkronize başlasın 🍿
            </span>
          )}
        </div>

        {/* In-App YouTube Search & Paste Bar */}
        <form onSubmit={handleCustomSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Video ara veya YouTube linki yapıştır..."
            className="w-full pl-9 pr-14 py-2 text-xs bg-[#1C202B] border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-[11px] font-bold rounded-lg text-white transition-colors"
          >
            Ara
          </button>
        </form>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* VIEW 1: YOUTUBE ANA EKRANI (Default Home Screen with Videos to pick) */}
        {viewMode === 'home' ? (
          <div className="absolute inset-0 z-10 overflow-y-auto p-4 sm:p-6 bg-[#0B0D12]">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = activeCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30 scale-105'
                        : 'bg-[#151821] text-gray-300 hover:bg-[#1C202B] border border-white/[0.06]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {filteredVideos.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectVideo(item.videoId, item.title)}
                  className="group relative flex flex-col rounded-2xl bg-[#151821] border border-white/[0.08] hover:border-red-500/50 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-950/30"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-950">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                    {item.duration && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-bold bg-black/85 text-white rounded-md">
                        {item.duration}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3.5 flex flex-col justify-between flex-1">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider">
                        {item.category}
                      </span>
                      <h4 className="text-sm font-bold text-white line-clamp-2 mt-0.5 group-hover:text-red-300 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.06] text-[11px] text-gray-400">
                      <span>{item.year || '2026'}</span>
                      <span className="font-bold text-red-500 group-hover:underline flex items-center gap-1">
                        Odayla Oynat <Play className="w-3 h-3 fill-current" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredVideos.length === 0 && (
              <div className="text-center py-16">
                <p className="text-sm text-gray-400">Aradığınız kriterlere uygun video bulunamadı.</p>
                <p className="text-xs text-gray-500 mt-1">
                  Yukarıdaki arama çubuğuna doğrudan herhangi bir YouTube video linki de yapıştırabilirsiniz!
                </p>
              </div>
            )}
          </div>
        ) : (
          /* VIEW 2: YOUTUBE OYNATICI (Synchronized Player) */
          <div className="relative w-full h-full flex flex-col bg-black">
            <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black">
              <div id="yt-player-container" className="w-full h-full" />
            </div>

            {/* Bottom bar with quick switch back */}
            <div className="px-4 py-2 bg-[#151821] border-t border-white/[0.08] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-semibold text-white">Senkronize YouTube Yayını</span>
              </div>
              <button
                onClick={() => setViewMode('home')}
                className="text-xs font-bold text-red-500 hover:text-red-400 underline flex items-center gap-1"
              >
                ← YouTube Ana Ekranına Dön
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
