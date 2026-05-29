'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { getPost, updatePost } from '@/lib/post-storage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Eye,
  CalendarDays,
  User,
  MessageCircle,
} from 'lucide-react';
import type { ExperiencePost } from '@/types';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [post, setPost] = useState<ExperiencePost | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [collected, setCollected] = useState(false);

  // Load post
  useEffect(() => {
    setLoading(true);
    const found = getPost(id);
    if (!found) {
      setNotFound(true);
    } else {
      setPost(found);
      // Increment view count
      updatePost(id, { view_count: found.view_count + 1 });
      setPost((prev) => (prev ? { ...prev, view_count: prev.view_count + 1 } : prev));
    }
    setLoading(false);
  }, [id]);

  const handleLike = useCallback(() => {
    if (!post) return;
    const newCount = liked ? post.like_count - 1 : post.like_count + 1;
    setLiked((prev) => !prev);
    setPost((prev) => (prev ? { ...prev, like_count: newCount } : prev));
    updatePost(post.id, { like_count: newCount });
    if (!liked) {
      toast.success('已点赞');
    }
  }, [post, liked]);

  const handleCollect = useCallback(() => {
    if (!post) return;
    const newCount = collected ? post.collect_count - 1 : post.collect_count + 1;
    setCollected((prev) => !prev);
    setPost((prev) => (prev ? { ...prev, collect_count: newCount } : prev));
    updatePost(post.id, { collect_count: newCount });
    if (!collected) {
      toast.success('已收藏');
    }
  }, [post, collected]);

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-4 animate-pulse">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-8 w-3/4 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="h-[400px] bg-muted rounded mt-6" />
        </div>
      </div>
    );
  }

  // Not found
  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">文章不存在</h2>
        <p className="text-muted-foreground mb-6">该经验帖可能已被删除或链接无效</p>
        <Link href="/community">
          <Button>返回社区</Button>
        </Link>
      </div>
    );
  }

  if (!post) return null;

  const authorInitial = post.author?.display_name?.charAt(0) || '用';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <div className="mb-6">
        <Link href="/community" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回社区
        </Link>
      </div>

      {/* Article header */}
      <article>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl leading-snug mb-4">
          {post.title}
        </h1>

        {/* Author + meta */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-sm">
              {authorInitial}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {post.author?.display_name || '未知用户'}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {formatDate(post.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.view_count} 阅读
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Separator className="mb-6" />

        {/* Content */}
        <div
          className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-primary prose-img:rounded-lg prose-img:mx-auto prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:leading-relaxed prose-strong:text-gray-900 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mb-4 [&_ul]:mb-4 [&_ol]:mb-4 [&_blockquote]:my-6 [&_blockquote]:py-3 [&_blockquote]:px-4 [&_blockquote]:bg-muted/30 [&_blockquote]:rounded-r-md [&_img]:my-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <Separator className="my-8" />

        {/* Actions bar */}
        <Card>
          <CardContent className="flex items-center gap-4 py-4 justify-center sm:justify-start">
            <Button
              variant={liked ? 'default' : 'outline'}
              size="sm"
              onClick={handleLike}
              className="gap-2"
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              点赞 {post.like_count}
            </Button>
            <Button
              variant={collected ? 'default' : 'outline'}
              size="sm"
              onClick={handleCollect}
              className="gap-2"
            >
              <Bookmark className={`h-4 w-4 ${collected ? 'fill-current' : ''}`} />
              收藏 {post.collect_count}
            </Button>
          </CardContent>
        </Card>
      </article>
    </div>
  );
}
