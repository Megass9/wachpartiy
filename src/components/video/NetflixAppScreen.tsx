'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Tv,
  Film,
  Sparkles,
  Check,
  Volume2,
  VolumeX,
  SkipForward,
  MonitorPlay,
  Lock,
  LogIn,
  Search,
  Maximize,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { CatalogItem } from '@/types';
import { NETFLIX_CATALOG } from '@/lib/mockData';

interface NetflixAppScreenProps {
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
  onSwitchToScreenShare: () => void;
  isOwner: boolean;
}

export function NetflixAppScreen({
  videoId,
  isPlaying,
  onVideoSelect,
  onPlayStateChange,
  onSeek,
  registerPlayer,
  onSwitchToScreenShare,
  isOwner,
}: NetflixAppScreenProps) {
  const [activeItem, setActiveItem] = useState<CatalogItem>(
    NETFLIX_CATALOG.find((item) => item.videoId === videoId || item.netflixId === videoId) || NETFLIX_CATALOG[0]
  );
  const [showCatalogDrawer, setShowCatalogDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Netflix In-App Session Gate (Rave style)
  const [isNetflixLoggedIn, setIsNetflixLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rave_netflix_logged_in') === 'true';
    }
    return false;
  });

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const playerRef = useRef<any>(null);
  const internalSeekRef = useRef(false);

  // Sync active title when videoId changes from another user in the room
  useEffect(() => {
    const matched = NETFLIX_CATALOG.find(
      (item) => item.videoId === videoId || item.netflixId === videoId
    );
    if (matched) {
      setActiveItem(matched);
    }
  }, [videoId]);

  // Load in-app player (100% inside our web app, Rave style)
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

      playerRef.current = new window.YT.Player('netflix-rave-player', {
        width: '100%',
        height: '100%',
        videoId: activeItem.videoId || 'sBEvEcpnG7k',
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
  }, [activeItem.videoId]);

  // When a user selects a show in Rave mode, it updates both users in the room
  const handleSelectShow = (item: CatalogItem) => {
    setActiveItem(item);
    onVideoSelect(item.videoId, item.title);
    setShowCatalogDrawer(false);
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(item.videoId);
    }
  };

  // Skip Intro (+85s)
  const handleSkipIntro = () => {
    if (playerRef.current?.seekTo && playerRef.current?.getCurrentTime) {
      const current = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(current + 85, true);
      onSeek(current + 85);
    }
  };

  // In-App Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setLoginError('Lütfen e-posta adresinizi girin.');
      return;
    }

    setIsSubmitting(true);
    setLoginError(null);

    setTimeout(() => {
      setIsNetflixLoggedIn(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('rave_netflix_logged_in', 'true');
      }
      setIsSubmitting(false);
    }, 500);
  };

  const handleLogout = () => {
    setIsNetflixLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rave_netflix_logged_in');
    }
  };

  // Filtered Netflix catalog
  const filteredCatalog = NETFLIX_CATALOG.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative flex flex-col w-full h-full bg-black text-white select-none overflow-hidden">
      {/* Top Rave Netflix Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/95 border-b border-white/[0.08] z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black tracking-tighter text-[#E50914] select-none">
              NETFLIX
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/40">
              Rave Sync
            </span>
          </div>

          <button
            onClick={() => setShowCatalogDrawer(!showCatalogDrawer)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-gray-200 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <span>Dizi/Film Değiştir</span>
          </button>
        </div>

        {/* Status / Session Indicator */}
        <div className="flex items-center gap-2">
          {isNetflixLoggedIn ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                <Check className="w-3 h-3" />
                Oturum Açık
              </span>
              <button
                onClick={handleLogout}
                className="text-[10px] text-gray-400 hover:text-white underline"
              >
                Çıkış
              </button>
            </div>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
              <Lock className="w-3 h-3" />
              Giriş Bekleniyor
            </span>
          )}

          <button
            onClick={onSwitchToScreenShare}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-gray-300 transition-colors"
            title="Kendi Netflix sekmenizi odaya canlı yayınlayın"
          >
            <MonitorPlay className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">Sekme Paylaş</span>
          </button>
        </div>
      </div>

      {/* Main Player Area */}
      <div className="relative flex-1 w-full h-full bg-black overflow-hidden flex items-center justify-center">
        {/* IF USER IS NOT LOGGED IN TO NETFLIX: SHOW RAVE-STYLE IN-PLAYER SIGN-IN SCREEN */}
        {!isNetflixLoggedIn ? (
          <div className="relative z-10 w-full h-full flex items-center justify-center p-4 bg-gradient-to-b from-[#141414] via-[#0B0D12] to-black">
            {/* Background Blur Backdrop */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20 blur-md pointer-events-none"
              style={{ backgroundImage: `url(${activeItem.bannerUrl || activeItem.thumbnail})` }}
            />

            {/* In-Player Login Dialog Box */}
            <div className="relative z-20 w-full max-w-sm rounded-2xl bg-black/90 border border-white/15 p-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-black tracking-tighter text-[#E50914]">
                  NETFLIX
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/30">
                  Rave Birlikte İzle
                </span>
              </div>

              <h2 className="text-lg font-bold text-white mb-1">Netflix Oturumu Açın</h2>
              <p className="text-xs text-gray-300 mb-5 leading-relaxed">
                Arkadaşınız odada <strong className="text-white">"{activeItem.title}"</strong> başlattı. 
                Uygulama içerisinden birlikte izlemek için Netflix hesabınıza giriş yapın.
              </p>

              {loginError && (
                <div className="p-2 mb-3 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs">
                  {loginError}
                </div>
              )}

              {/* In-App Direct Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <input
                    type="text"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="E-posta veya Telefon Numarası"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#1C202B] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] transition-colors"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Şifre"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#1C202B] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#E50914] hover:bg-red-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Oturum Açılıyor...' : 'Oturum Aç ve Başlat'}</span>
                </button>
              </form>

              {/* No account? Quick free option */}
              <div className="mt-4 pt-3 border-t border-white/10 text-center">
                <p className="text-[11px] text-gray-400 mb-1">Netflix üyeliğiniz yok mu?</p>
                <button
                  onClick={() => {
                    setIsNetflixLoggedIn(true);
                    onSwitchToScreenShare();
                  }}
                  className="text-xs font-semibold text-violet-400 hover:text-violet-300 underline"
                >
                  Oda Sahibinin Yayınına Katıl (Ücretsiz İzle)
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* IF USER IS LOGGED IN: FULL SYNCHRONIZED STREAM PLAYING RIGHT INSIDE THE APP */
          <div className="relative w-full h-full flex flex-col">
            <div className="relative flex-1 w-full h-full bg-black">
              <div id="netflix-rave-player" className="w-full h-full" />

              {/* In-Player Rave Controls Overlay */}
              <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
                <button
                  onClick={handleSkipIntro}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-black/80 hover:bg-black text-white text-xs font-bold border border-white/30 backdrop-blur-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <SkipForward className="w-3.5 h-3.5 text-[#E50914]" />
                  <span>İNTROYU ATLA</span>
                </button>
              </div>
            </div>

            {/* Bottom Stream Status Strip */}
            <div className="px-4 py-2 bg-[#151821] border-t border-white/[0.08] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold text-white truncate max-w-xs sm:max-w-md">
                  {activeItem.title}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">{activeItem.rating}</span>
                <span className="text-[10px] text-gray-400 hidden sm:inline">{activeItem.category}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                  Senkronize Oynatma Aktif
                </span>
                <button
                  onClick={() => setShowCatalogDrawer(true)}
                  className="text-[11px] font-bold text-[#E50914] hover:underline"
                >
                  Dizi Değiştir →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IN-APP NETFLIX CATALOG DRAWER (Choose Series / Movie without leaving app) */}
        {showCatalogDrawer && (
          <div className="absolute inset-0 z-30 bg-black/95 backdrop-blur-xl flex flex-col p-4 sm:p-6 overflow-hidden animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xl font-black text-[#E50914]">NETFLIX</span>
                <span className="text-xs font-bold text-white">Dizi & Film Kataloğu</span>
              </div>
              <button
                onClick={() => setShowCatalogDrawer(false)}
                className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold"
              >
                Kapat ✕
              </button>
            </div>

            {/* In-App Search */}
            <div className="relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Netflix dizisi veya filmi ara (Stranger Things, Squid Game, Arcane...)"
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#1C202B] border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#E50914]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Grid of Netflix Items */}
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pr-1">
              {filteredCatalog.map((item) => {
                const isSelected = activeItem.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectShow(item)}
                    className={`group relative rounded-xl overflow-hidden bg-[#151821] border cursor-pointer transition-all hover:scale-105 hover:shadow-2xl ${
                      isSelected ? 'border-[#E50914] ring-2 ring-[#E50914]/30' : 'border-white/[0.08]'
                    }`}
                  >
                    <div className="aspect-[2/3] w-full relative">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                        <div className="w-8 h-8 rounded-full bg-[#E50914] text-white flex items-center justify-center mb-1 mx-auto shadow-lg">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                        <p className="text-[11px] font-bold text-white text-center truncate">
                          {item.title}
                        </p>
                      </div>
                    </div>

                    <div className="p-2">
                      <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                      <p className="text-[10px] text-emerald-400 mt-0.5">{item.rating}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
