import { createClient } from '@supabase/supabase-js';
import { Play, ThumbsUp, ThumbsDown, MessageSquare, Users, Clock, Video, ExternalLink } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 0;

export default async function WatchHub() {
  // Query exclusively for video articles
  const { data: videos } = await supabase
    .from('curated_news')
    .select('*')
    .not('video_metadata', 'is', null)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-red-500/30">
      {/* Background gradients for Cinematic Hub */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-neutral-950 to-neutral-950 pointer-events-none" />
      
      <main className="relative z-10 w-full px-4 md:px-12 xl:px-24 py-12">
        <header className="mb-12 max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black tracking-tight flex items-center gap-4 bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent mb-4 font-display">
              <Video className="w-12 h-12 text-red-500" />
              Cinematic Hub
            </h1>
            <p className="text-neutral-400 text-lg font-medium">
              Deep Analytics & AI Summaries for Top Tech Videos
            </p>
          </div>
        </header>

        <div className="max-w-screen-2xl mx-auto">
          {(!videos || videos.length === 0) ? (
            <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
              <Video className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Videos Found</h2>
              <p className="text-neutral-400">The autonomous pipeline is currently fetching video intelligence.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {videos.map((video) => {
                const meta = video.video_metadata;
                const totalVotes = (meta?.likes || 0) + (meta?.dislikes || 0) || 1;
                const likePercent = ((meta?.likes || 0) / totalVotes) * 100;

                // Attempt to parse YouTube ID for thumbnail
                let videoId = "";
                try {
                  videoId = video.url.split('v=')[1]?.split('&')[0];
                } catch(e) {}
                
                const thumbnailUrl = videoId 
                  ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` 
                  : (video.image_url || "/placeholder-video.jpg");

                return (
                  <div key={video.id} className="group relative bg-white/5 hover:bg-white/[0.07] border border-white/10 rounded-3xl overflow-hidden transition-all duration-300 backdrop-blur-xl">
                    
                    {/* Thumbnail / Header Area */}
                    <div className="relative h-64 w-full bg-black overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent z-10" />
                      <img 
                        src={thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute bottom-4 left-6 right-6 z-20 flex justify-between items-end">
                        <div className="bg-red-600/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                          <Play className="w-3 h-3 fill-current" />
                          {meta?.video_duration || "Unknown"}
                        </div>
                        <a 
                          href={video.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 md:p-8">
                      <h2 className="text-2xl font-bold text-white mb-4 line-clamp-2 leading-tight">
                        {video.title}
                      </h2>
                      
                      {/* Deep Statistics Ribbon */}
                      <div className="flex flex-wrap items-center gap-4 py-4 mb-6 border-y border-white/5">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/50 rounded-lg">
                          <Users className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm font-semibold text-neutral-300">{meta?.channel_name || "Channel"}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 px-3 py-1.5 bg-neutral-900/50 rounded-lg flex-1 min-w-[200px]">
                          <ThumbsUp className="w-4 h-4 text-emerald-400" />
                          <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden flex">
                             <div className="h-full bg-emerald-500" style={{ width: `${likePercent}%` }} />
                             <div className="h-full bg-red-500" style={{ width: `${100 - likePercent}%` }} />
                          </div>
                          <ThumbsDown className="w-4 h-4 text-red-400" />
                          <span className="text-xs font-bold text-neutral-400 min-w-[32px] text-right">{Math.round(likePercent)}%</span>
                        </div>
                        
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/50 rounded-lg">
                          <MessageSquare className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm font-semibold text-neutral-300">{meta?.comment_count || 0}</span>
                        </div>
                      </div>

                      {/* AI Summary */}
                      <div className="space-y-4 text-neutral-300/80 leading-relaxed text-sm">
                        {video.preFetchedContent ? (
                           <div className="prose prose-invert prose-sm max-w-none">
                              {video.preFetchedContent.split('\n\n').map((paragraph: string, i: number) => (
                                <p key={i}>{paragraph}</p>
                              ))}
                           </div>
                        ) : (
                           <p className="italic text-neutral-500">AI summary processing...</p>
                        )}
                      </div>
                      
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
