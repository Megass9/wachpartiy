-- ==============================================================================
-- WatchTogether - Supabase PostgreSQL Schema & Realtime Kurulumu
-- Bu scripti Supabase Dashboard -> SQL Editor alanına yapıştırıp RUN butonuna basın.
-- ==============================================================================

-- 1. PROFILES (Kullanıcı Profilleri)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- 2. ROOMS (Odalar)
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_private BOOLEAN DEFAULT false NOT NULL,
  is_locked BOOLEAN DEFAULT false NOT NULL,
  max_users INTEGER DEFAULT 10 NOT NULL,
  app_type TEXT DEFAULT 'youtube' NOT NULL, -- 'youtube', 'netflix', 'screenshare'
  video_url TEXT,
  video_id TEXT DEFAULT 'jfKfPfyJRdk',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Rooms viewable by everyone or invited" ON public.rooms;
CREATE POLICY "Rooms viewable by everyone or invited" 
  ON public.rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create rooms" ON public.rooms;
CREATE POLICY "Authenticated users can create rooms" 
  ON public.rooms FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Room owner can update their room" ON public.rooms;
CREATE POLICY "Room owner can update their room" 
  ON public.rooms FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Room owner can delete their room" ON public.rooms;
CREATE POLICY "Room owner can delete their room" 
  ON public.rooms FOR DELETE USING (auth.uid() = owner_id);


-- 3. ROOM_MEMBERS (Oda Katılımcıları)
CREATE TABLE IF NOT EXISTS public.room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(room_id, user_id)
);

ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Room members are viewable by everyone in the room" ON public.room_members;
CREATE POLICY "Room members are viewable by everyone in the room" 
  ON public.room_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can join rooms" ON public.room_members;
CREATE POLICY "Authenticated users can join rooms" 
  ON public.room_members FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave room or owner can kick" ON public.room_members;
CREATE POLICY "Users can leave room or owner can kick" 
  ON public.room_members FOR DELETE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.rooms WHERE rooms.id = room_members.room_id AND rooms.owner_id = auth.uid())
  );


-- 4. MESSAGES (Canlı Sohbet Mesajları)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Messages viewable by anyone in room" ON public.messages;
CREATE POLICY "Messages viewable by anyone in room" 
  ON public.messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
CREATE POLICY "Users can insert messages" 
  ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 5. ROOM_VIDEO_STATE (Video Durumu)
CREATE TABLE IF NOT EXISTS public.room_video_state (
  room_id UUID PRIMARY KEY REFERENCES public.rooms(id) ON DELETE CASCADE,
  is_playing BOOLEAN DEFAULT false NOT NULL,
  "current_time" FLOAT DEFAULT 0 NOT NULL,
  app_type TEXT DEFAULT 'youtube' NOT NULL,
  video_id TEXT DEFAULT 'jfKfPfyJRdk',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.room_video_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Room video state is viewable by all" ON public.room_video_state;
CREATE POLICY "Room video state is viewable by all" 
  ON public.room_video_state FOR SELECT USING (true);

DROP POLICY IF EXISTS "Room video state can be updated" ON public.room_video_state;
CREATE POLICY "Room video state can be updated" 
  ON public.room_video_state FOR ALL USING (true);


-- 6. REALTIME REPLICATION (Gerçek zamanlı bildirimleri aç)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'rooms') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'room_members') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'room_video_state') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.room_video_state;
  END IF;
END $$;


-- 7. TRIGGER: Yeni kayıt olan kullanıcıya otomatik profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || NEW.id)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
