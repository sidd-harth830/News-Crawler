'use server';

import { createClient } from '@/utils/supabase/server';

export type ViewState = 'active' | 'all' | 'vault';

export async function fetchArticles(page: number, limit: number = 10, viewState: ViewState = 'active', searchQuery: string = '') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let readIds: string[] = [];
  
  if (user) {
    const { data } = await supabase.from('user_read_status').select('news_id').eq('user_id', user.id);
    if (data) {
      readIds = data.map((d: any) => d.news_id);
    }
  }

  const start = (page - 1) * limit;
  const end = start + limit - 1;

  let query = supabase
    .from('curated_news')
    .select('*', { count: 'exact' });

  // 1. Search Query Filter
  if (searchQuery.trim().length > 0) {
    query = query.or(`title.ilike.%${searchQuery}%,impact_summary.ilike.%${searchQuery}%`);
  }

  // 2. View State Filters
  if (viewState === 'active') {
    // Active Feed: Unread only, last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte('created_at', sevenDaysAgo);
    
    if (user && readIds.length > 0) {
      const formattedIds = readIds.map(id => `"${id}"`).join(',');
      query = query.not('id', 'in', `(${formattedIds})`);
    }
  } else if (viewState === 'all') {
    // All Intelligence: Last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte('created_at', thirtyDaysAgo);
  }
  // 'vault' applies no date filter

  const { data: articles, error, count } = await query
    .order('created_at', { ascending: false })
    .order('id', { ascending: true })
    .range(start, end);

  if (error) {
    console.error('Error fetching articles:', error);
    return { articles: [], hasMore: false };
  }

  const articlesWithReadState = (articles || []).map((a: any) => ({
    ...a,
    isUnread: user ? !readIds.includes(a.id) : false
  }));

  return {
    articles: articlesWithReadState,
    hasMore: count ? end < count - 1 : false,
  };
}

export async function markArticleAsRead(newsId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('user_read_status').insert({
    user_id: user.id,
    news_id: newsId
  });
}

export async function markAllAsRead(newsIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || newsIds.length === 0) return;

  const inserts = newsIds.map(id => ({
    user_id: user.id,
    news_id: id
  }));

  await supabase.from('user_read_status').insert(inserts);
}
