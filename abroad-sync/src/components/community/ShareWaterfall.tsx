'use client';

import Link from 'next/link';
import { Heart, Bookmark, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { ExperiencePost } from '@/types';

// Generate a consistent gradient based on post ID for cover placeholder
const GRADIENTS = [
  'from-blue-400 to-indigo-500',
  'from-purple-400 to-pink-500',
  'from-emerald-400 to-teal-500',
  'from-orange-400 to-rose-500',
  'from-cyan-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-amber-400 to-orange-500',
  'from-green-400 to-emerald-500',
  'from-rose-400 to-red-500',
  'from-sky-400 to-cyan-500',
  'from-fuchsia-400 to-pink-500',
  'from-lime-400 to-green-500',
];

function getGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % GRADIENTS.length;
  }
  return GRADIENTS[Math.abs(hash)];
}

function getAspectRatio(id: string): string {
  // Vary card heights for natural waterfall look
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 3;
  }
  const ratios = ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-[1/1]'];
  return ratios[Math.abs(hash)];
}

function stripHtml(html: string): string {
  if (typeof window === 'undefined') return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface ShareWaterfallProps {
  posts: ExperiencePost[];
}

export default function ShareWaterfall({ posts }: ShareWaterfallProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <MessageCircle className="mx-auto h-12 w-12 mb-4 text-gray-300" />
        <p className="text-lg">还没有经验帖</p>
        <p className="text-sm mt-1 mb-4">快来分享你的第一篇经验帖吧</p>
        <Link
          href="/community/write"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          写经验帖
        </Link>
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
      {posts.map((post) => {
        const gradient = getGradient(post.id);
        const aspectRatio = getAspectRatio(post.id);
        const authorName = post.author?.display_name || '用户';
        const authorInitial = authorName.charAt(0);

        return (
          <Link key={post.id} href={`/community/post/${post.id}`}>
            <div className="break-inside-avoid mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 group cursor-pointer">
              {/* Cover Image Area */}
              <div
                className={`relative ${aspectRatio} bg-gradient-to-br ${gradient} overflow-hidden`}
              >
                {post.cover_image ? (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  /* Decorative gradient with emoji */
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 text-6xl">
                    📝
                  </div>
                )}

                {/* Title overlay at bottom */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-10">
                  <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 drop-shadow-sm">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-white/80 text-xs mt-1 line-clamp-1 drop-shadow-sm">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                {/* Tags on top-left */}
                {post.tags.length > 0 && (
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/20 backdrop-blur-sm text-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom info bar */}
              <div className="px-3 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-6 w-6 shrink-0 ring-1 ring-gray-100">
                    <AvatarFallback className="text-[10px] bg-blue-100 text-blue-600 font-medium">
                      {authorInitial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-500 truncate">{authorName}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {post.like_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bookmark className="h-3 w-3" />
                    {post.collect_count}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
