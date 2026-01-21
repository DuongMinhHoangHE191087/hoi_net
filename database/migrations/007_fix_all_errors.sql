-- 1. Create user_profiles table if not exists (Ensure Idempotency)
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  phone text,
  address text,
  facebook_url text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_profiles enable row level security;

-- Policies (Drop first to avoid errors)
drop policy if exists "Public profiles are viewable by everyone." on public.user_profiles;
create policy "Public profiles are viewable by everyone." on public.user_profiles for select using ( true );

drop policy if exists "Users can insert their own profile." on public.user_profiles;
create policy "Users can insert their own profile." on public.user_profiles for insert with check ( auth.uid() = id );

drop policy if exists "Users can update own profile." on public.user_profiles;
create policy "Users can update own profile." on public.user_profiles for update using ( auth.uid() = id );

-- 2. Create site_settings table if not exists
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default now()
);

alter table public.site_settings enable row level security;
drop policy if exists "Site settings are viewable by everyone." on public.site_settings;
create policy "Site settings are viewable by everyone." on public.site_settings for select using ( true );
drop policy if exists "Only admins can update site settings." on public.site_settings;
create policy "Only admins can update site settings." on public.site_settings for all using (
  auth.email() in ('admin@photoai.com', 'duonghoang@gmail.com', 'duongminhhoanggame@gmail.com')
);

-- 3. Seed Data for site_settings (Fix 404 Error)
insert into public.site_settings (key, value)
values 
  ('ui_settings', '{"theme": "modern", "primaryColor": "#007bff", "enableAnimations": true}'::jsonb),
  ('contact_info', '{"email": "support@photoai.com", "phone": "+84 123 456 789"}'::jsonb),
  ('feature_flags', '{"enableGoogleLogin": true, "enableBetaFeatures": false}'::jsonb)
on conflict (key) do nothing;

-- 4. User Profile Trigger (Fix 406 Error for new users)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.user_profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Fix Existing Users (Insert profile for existing users if missing)
-- This fixes the 406 error for your CURRENT user
insert into public.user_profiles (id, full_name, avatar_url)
select id, raw_user_meta_data->>'full_name', raw_user_meta_data->>'avatar_url'
from auth.users
where id not in (select id from public.user_profiles)
on conflict do nothing;
