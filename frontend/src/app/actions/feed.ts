'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchArticles(page: number, limit: number = 10) {
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const { data: articles, error, count } = await supabase
    .from('curated_news')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: true })
    .range(start, end);

  if (error) {
    console.error('Error fetching articles:', error);
    return { articles: [], hasMore: false };
  }

  return {
    articles: articles || [],
    hasMore: count ? end < count - 1 : false,
  };
}
