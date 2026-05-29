'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Users,
  FileText,
  CalendarDays,
  Eye,
  Plus,
  UserPlus,
  UserCheck,
  Heart,
  Bookmark,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { Group, ExperiencePost } from '@/types';
import {
  getGroup,
  getPosts,
  isGroupMember,
  joinGroup,
  leaveGroup,
} from '@/lib/post-storage';

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<ExperiencePost[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'hot'>('newest');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setAuthUser(data.user ?? null);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading) return;

    // Load group
    const g = getGroup(groupId);
    if (!g) {
      setNotFound(true);
      return;
    }
    setGroup(g);

    // Check membership
    if (authUser) {
      setIsMember(isGroupMember(groupId, authUser.id));
    }

    // Load posts filtered by group
    const allPosts = getPosts();
    const groupPosts = allPosts.filter((p) => p.tags.includes(groupId));
    setPosts(groupPosts);
  }, [loading, groupId, authUser]);

  const handleJoin = () => {
    if (!authUser) {
      toast.error('请先登录');
      router.push(`/auth/login?redirect=/groups/${groupId}`);
      return;
    }
    setJoining(true);
    try {
      joinGroup(groupId, authUser.id);
      setIsMember(true);
      toast.success('已加入小组');
    } catch {
      toast.error('加入失败，请重试');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = () => {
    if (!authUser) return;
    setJoining(true);
    try {
      leaveGroup(groupId, authUser.id);
      setIsMember(false);
      toast.success('已退出小组');
    } catch {
      toast.error('操作失败，请重试');
    } finally {
      setJoining(false);
    }
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'hot') {
      return b.like_count + b.view_count - (a.like_count + a.view_count);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // ====== Loading State ======
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-4 w-20 mb-6" />
        <Skeleton className="h-12 w-12 rounded-xl mb-4" />
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96 mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // ====== Not Found State ======
  if (notFound) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <Users className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">小组不存在</h2>
        <p className="text-gray-400 mb-6">该小组可能已被删除或链接无效</p>
        <Link href="/groups">
          <Button>查看所有小组</Button>
        </Link>
      </div>
    );
  }

  if (!group) return null;

  const CATEGORY_LABELS: Record<string, string> = {
    school: '院校小组',
    season: '申请季小组',
    major: '专业小组',
    country: '国家小组',
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link
        href="/groups"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        返回小组列表
      </Link>

      {/* Group Header */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
                {group.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                  <Badge variant="secondary" className="text-xs">
                    {CATEGORY_LABELS[group.category] || group.category}
                  </Badge>
                </div>
                <p className="text-gray-500 mb-3">{group.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {group.member_count.toLocaleString()} 成员
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {group.post_count.toLocaleString()} 帖子
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/community/write?group=${groupId}`}>
                <Button variant="outline" size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  发帖
                </Button>
              </Link>
              {isMember ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-300 hover:bg-green-50 cursor-pointer"
                  onClick={handleLeave}
                  disabled={joining}
                >
                  <UserCheck className="mr-1 h-4 w-4" />
                  已加入
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleJoin}
                  disabled={joining}
                >
                  <UserPlus className="mr-1 h-4 w-4" />
                  {joining ? '加入中...' : '加入小组'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">小组帖子</h2>
          {/* Sort */}
          <button
            type="button"
            onClick={() => setSortBy('newest')}
            className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors ${
              sortBy === 'newest'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            最新
          </button>
          <button
            type="button"
            onClick={() => setSortBy('hot')}
            className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors ${
              sortBy === 'hot'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            最热
          </button>
        </div>
      </div>

      {sortedPosts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText className="mx-auto h-16 w-16 mb-4 text-gray-300" />
          <p className="text-lg mb-2">小组内还没有帖子</p>
          <p className="text-sm mb-6">成为第一个发帖的人吧</p>
          <Link href={`/community/write?group=${groupId}`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              在小组发帖
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPosts.map((post) => (
            <Link key={post.id} href={`/community/post/${post.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <div className="flex items-center gap-2 mb-2">
                        {post.is_pinned && (
                          <Badge className="bg-red-100 text-red-700 border-0 text-xs">置顶</Badge>
                        )}
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {post.title}
                        </h3>
                      </div>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.tags
                            .filter((t) => t !== groupId)
                            .slice(0, 4)
                            .map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs font-normal">
                                {tag}
                              </Badge>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Right side: meta */}
                    <div className="text-right text-xs text-gray-400 space-y-1.5 shrink-0">
                      <div className="flex items-center justify-end gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[10px]">
                            {post.author?.display_name?.charAt(0) || '用'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-gray-500">
                          {post.author?.display_name || '未知用户'}
                        </span>
                      </div>
                      <p className="flex items-center justify-end gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(post.created_at)}
                      </p>
                      <div className="flex items-center justify-end gap-3">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.like_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bookmark className="h-3 w-3" />
                          {post.collect_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.view_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
