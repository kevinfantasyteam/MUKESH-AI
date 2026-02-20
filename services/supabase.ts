
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tuxztijkdpxbkdtwjzch.supabase.co';
const supabaseKey = 'sb_publishable_SScHGVfDom9hJB3cbMPXrw_W4h-jMdm'; // Using the provided key directly as requested

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// SQL Schema for Supabase
/*
create table matches (
  id text primary key,
  data jsonb,
  players jsonb,
  created_at timestamptz default now(),
  user_id uuid
);

create table saved_teams (
  id text primary key,
  match_id text,
  teams jsonb,
  settings jsonb,
  created_at timestamptz default now(),
  user_id uuid
);
*/

