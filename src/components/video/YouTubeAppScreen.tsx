'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Radio, Film, Music, Gamepad2, Sparkles, RefreshCw, ExternalLink } from 'lucide-react';
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
  const [showCatalog, setShowCatalog] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const internalSeekRef = useRef(false);

  const categories = [
    { name: 'Hepsi', icon: Sparkles },
    { name: 'Müzik & Canlı', icon: Music },
    { name: 'Animasyon', icon: Film },
    { name: 'Sinema', icon: Film },
    { name: 'Oyun', icon: Gamepad2 },
  ];

  // Filter presets
  const filteredVideos = YOUTUBE_PRESETS.filter((item) => {
    const matchesCategory = activeCategory === 'Hepsi' || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Load YouTube Iframe API
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
        videoId: videoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: window.location.origin,
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
            // YT.PlayerState.PLAYING = 1, PAUSED = 2
            if (event.data === 1 && !internalSeekRef.current) {
              onPlayStateChange(true);
            } else if (event.data === 2 && !internalSeekRef.current) {
              onPlayStateChange(false);
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

  // Handle external video changes
  const handleSelectVideo = (newId: string, title?: string) => {
    onVideoSelect(newId, title);
    setShowCatalog(false);
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(newId);
    }
  };

  // Handle custom search query or direct URL/ID paste
  const handleCustomSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // Check if query is a YouTube link
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
    <div className="flex flex-col h-full bg-[#0B0D12]">
      {/* Top YouTube Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:px-4 bg-[#151821] border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/10 border border-red-500/20 text-red-400 font-bold text-xs tracking-wider uppercase">
            <YoutubeIcon className="w-4 h-4 text-red-500" />
            <span>YouTube Hub</span>
          </div>
          <button
            onClick={() => setShowCatalog(!showCatalog)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              showCatalog
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                : 'bg-white/[0.06] hover:bg-white/[0.1] text-gray-300'
            }`}
          >
            {showCatalog ? 'Oynatıcıya Dön' : '🔍 Video Seç & Keşfet'}
          </button>
        </div>

        {/* Quick Search & Paste */}
        <form onSubmit={handleCustomSearchSubmit} className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="YouTube'da ara veya video linki yapıştır..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#1C202B] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/60 transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 w-full overflow-hidden min-h-[360px]">
        {/* YouTube Video Player */}
        <div className={`w-full h-full ${showCatalog ? 'hidden' : 'block'}`}>
          <div className="w-full h-full flex items-center justify-center bg-black">
            <div id="yt-player-container" className="w-full h-full" />
          </div>
        </div>

        {/* In-Room YouTube Catalog / Search Grid */}
        {showCatalog && (
          <div className="absolute inset-0 z-20 overflow-y-auto p-4 sm:p-6 bg-[#0B0D12]/95 backdrop-blur-md">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = activeCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
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
                  className="group relative flex flex-col rounded-xl bg-[#151821] border border-white/[0.08] hover:border-red-500/40 overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl shadow-black/50"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-900">
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
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[10px] font-bold bg-black/80 text-white rounded">
                        {item.duration}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3.5 flex flex-col justify-between flex-1">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-red-400">
                        {item.category}
                      </span>
                      <h4 className="text-sm font-semibold text-white line-clamp-2 mt-0.5 group-hover:text-red-300 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.06] text-[11px] text-gray-500">
                      <span>{item.year || '2026'}</span>
                      <span className="font-semibold text-red-400 group-hover:underline flex items-center gap-1">
                        Odayla İzle <Play className="w-3 h-3 fill-current" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredVideos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-gray-400">Aradığınız kriterlere uygun video bulunamadı.</p>
                <p className="text-xs text-gray-500 mt-1">Yukarıdaki arama çubuğuna doğrudan herhangi bir YouTube video linki de yapıştırabilirsiniz!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
