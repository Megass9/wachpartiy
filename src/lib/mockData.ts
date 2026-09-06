import { CatalogItem } from '@/types';

// YouTube trending and preset videos
export const YOUTUBE_PRESETS: CatalogItem[] = [
  {
    id: 'yt-1',
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
    category: 'Müzik & Canlı',
    duration: 'Canlı',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    videoId: 'jfKfPfyJRdk', // lofi girl stream id
    description: 'Dünyanın en popüler rahatlama ve çalışma müziği yayını. Arkadaşlarınızla sohbet ederken arkada çalmak için mükemmel.',
    rating: '98%',
    year: '2026',
    tags: ['Lofi', 'Chill', 'Beats']
  },
  {
    id: 'yt-2',
    title: 'Big Buck Bunny 4K (Open Source Cinema)',
    category: 'Animasyon',
    duration: '9:56',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    videoId: 'aqz-KE-bpKQ',
    description: 'Blender Vakfı tarafından üretilen efsanevi açık kaynak animasyon filmi. Yüksek kalite ve akıcı görsel şölen.',
    rating: '94%',
    year: '2024',
    tags: ['Animasyon', '4K', 'Film']
  },
  {
    id: 'yt-3',
    title: 'Interstellar - Docking Scene (No Time for Caution)',
    category: 'Sinema',
    duration: '4:20',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    videoId: 'a3lcGnMhvsA',
    description: 'Christopher Nolan klasiği Interstellar filminin nefes kesen kenetlenme sahnesi ve Hans Zimmer müzikleri.',
    rating: '99%',
    year: '2025',
    tags: ['Sci-Fi', 'Christopher Nolan', 'Sinema']
  },
  {
    id: 'yt-4',
    title: 'Cyberpunk 2077: Phantom Liberty - Sinematik Fragman',
    category: 'Oyun',
    duration: '3:45',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    videoId: 'kf9e5A3vF50',
    description: 'Night City sokaklarında geçen casusluk temalı aksiyon gerilim. Idris Elba başrolde.',
    rating: '96%',
    year: '2025',
    tags: ['Gaming', 'Cyberpunk', 'Aksiyon']
  },
  {
    id: 'yt-5',
    title: 'Cosmic Journey - 4K Space Relaxation & Ambient',
    category: 'Doğa & Uzay',
    duration: '15:30',
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop',
    videoId: '17uU10Q7iG0',
    description: 'Evrenin derinliklerine büyüleyici bir seyahat. Gezegenler, bulutsular ve yıldızlar.',
    rating: '97%',
    year: '2026',
    tags: ['Uzay', '4K', 'Ambient']
  },
  {
    id: 'yt-6',
    title: 'Dune: Part Two - Resmi Fragman',
    category: 'Fragman',
    duration: '2:50',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    videoId: 'Way9Dexny3w',
    description: 'Paul Atreides intikam arayışındayken Chani ve Fremenler ile birleşiyor.',
    rating: '98%',
    year: '2024',
    tags: ['Dune', 'Epic', 'Sinema']
  }
];

// Netflix catalog items with posters, category breakdown, trailers & synopses
export const NETFLIX_CATALOG: CatalogItem[] = [
  {
    id: 'nf-1',
    title: 'Stranger Things 5',
    category: 'Bilim Kurgu & Korku',
    duration: '52 dk',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop',
    videoId: 'sBEvEcpnG7k', // Official teaser trailer
    description: 'Hawkins kasabası Upside Down tehdidine karşı son kez bir araya geliyor. Gizem ve dostluk sınırları aşacak.',
    rating: '98% Eşleşme',
    year: '2025',
    tags: ['16+', 'Nostaljik', 'Sürükleyici', 'Dizi']
  },
  {
    id: 'nf-2',
    title: 'Black Mirror: Season 7',
    category: 'Psikolojik Gerilim',
    duration: '65 dk',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
    videoId: '2bvx3IVCZr8',
    description: 'Gelişen yapay zeka ve insan ilişkilerinin karanlık yansımaları. Teknoloji ile insan doğasının tehlikeli dansı.',
    rating: '95% Eşleşme',
    year: '2025',
    tags: ['18+', 'Distopik', 'Zihin Açıcı']
  },
  {
    id: 'nf-3',
    title: 'Arcane: League of Legends',
    category: 'Animasyon & Macera',
    duration: '42 dk',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop',
    videoId: 'fXmAurh012s',
    description: 'Piltover ve Zaun arasındaki gerilimde iki kız kardeş, zıt saflarda karşı karşıya gelir.',
    rating: '99% Eşleşme',
    year: '2024',
    tags: ['16+', 'Görsel Şölen', 'Derin Hikaye']
  },
  {
    id: 'nf-4',
    title: 'The Witcher: Blood Origin',
    category: 'Fantastik & Macera',
    duration: '58 dk',
    thumbnail: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=800&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop',
    videoId: 'YJP3DbgJb2Y',
    description: 'Geralt of Rivia öncesinde ilk Cadı\'nın ortaya çıkışı ve Kürelerin Birleşimi\'nin başlangıç efsanesi.',
    rating: '91% Eşleşme',
    year: '2024',
    tags: ['18+', 'Kılıç & Büyü', 'Destansı']
  },
  {
    id: 'nf-5',
    title: 'Squid Game 2',
    category: 'Gerilim & Drama',
    duration: '55 dk',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop',
    videoId: 'l1vP1vG3E30',
    description: 'Gi-hun oyunu sona erdirmek için geri dönüyor. Yeni ölümcül oyunlar ve amansız hayatta kalma mücadelesi.',
    rating: '97% Eşleşme',
    year: '2025',
    tags: ['18+', 'Karanlık', 'Kore Draması']
  },
  {
    id: 'nf-6',
    title: 'Cyberpunk: Edgerunners',
    category: 'Anime & Cyberpunk',
    duration: '24 dk',
    thumbnail: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=800&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    videoId: 'JtqIas3bYhg',
    description: 'Her şeyini kaybeden bir sokak çocuğu, paralı bir kanun kaçağı (edgerunner) olarak hayatta kalmaya karar verir.',
    rating: '98% Eşleşme',
    year: '2024',
    tags: ['18+', 'Stüdyo Trigger', 'Enerjik']
  }
];

// Sample rooms for explore dashboard
export const SAMPLE_ROOMS = [
  {
    id: 'room-lofi-chill',
    name: 'Lofi Chill & Çalışma Odası',
    description: 'Sessizce çalışmak, kod yazmak veya dinlenmek isteyenler için 7/24 lofi müzik.',
    owner_id: 'user-alper',
    is_private: false,
    is_locked: false,
    max_users: 15,
    app_type: 'youtube' as const,
    video_id: 'jfKfPfyJRdk',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    owner: {
      id: 'user-alper',
      username: 'Alperen (Admin)',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alperen'
    },
    active_count: 7
  },
  {
    id: 'room-netflix-night',
    name: 'Netflix Film Gecesi (Stranger Things)',
    description: 'Yeni sezon fragmanları ve popüler bölümleri konuşup birlikte izliyoruz! Cipsini al gel 🍿',
    owner_id: 'user-selin',
    is_private: false,
    is_locked: false,
    max_users: 8,
    app_type: 'netflix' as const,
    video_id: 'sBEvEcpnG7k',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    owner: {
      id: 'user-selin',
      username: 'Selin_99',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Selin'
    },
    active_count: 5
  },
  {
    id: 'room-cyberpunk-game',
    name: 'Cyberpunk & Oyun Fragmanları',
    description: 'En son çıkan oyun sinematiklerini 4K izleyip sesli değerlendiriyoruz.',
    owner_id: 'user-mert',
    is_private: false,
    is_locked: false,
    max_users: 10,
    app_type: 'youtube' as const,
    video_id: 'kf9e5A3vF50',
    created_at: new Date(Date.now() - 1200000).toISOString(),
    owner: {
      id: 'user-mert',
      username: 'MertGamer',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mert'
    },
    active_count: 4
  }
];
