'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Plus, Users, FileText, Search } from 'lucide-react';
import type { Group } from '@/types';
import { getGroups } from '@/lib/post-storage';

const CATEGORY_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'school', label: '院校小组' },
  { value: 'season', label: '申请季小组' },
  { value: 'major', label: '专业小组' },
  { value: 'country', label: '国家小组' },
] as const;

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    try {
      const allGroups = getGroups();
      setGroups(allGroups);
    } catch {
      toast.error('加载小组数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredGroups =
    activeCategory === 'all'
      ? groups
      : groups.filter((g) => g.category === activeCategory);

  const handleCreateClick = () => {
    toast.info('创建小组功能即将上线，敬请期待！');
  };

  // ====== Loading State ======
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ====== Empty State ======
  if (groups.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <Users className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">还没有任何小组</h2>
        <p className="text-gray-400 mb-6">创建你的留学交流小组，找到同行伙伴</p>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          创建小组
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">话题小组</h1>
          <p className="mt-1 text-sm text-gray-500">加入留学交流小组，找到志同道合的伙伴</p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          创建小组
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setActiveCategory(opt.value)}
            className={`px-4 py-2 text-sm rounded-full cursor-pointer transition-colors ${
              activeCategory === opt.value
                ? 'bg-blue-600 text-white font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Search className="mx-auto h-12 w-12 mb-4 text-gray-300" />
          <p className="text-lg">该分类下暂无小组</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <Card className="hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer h-full">
                <CardContent className="p-6">
                  {/* Icon + Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-2xl">
                      {group.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
                      <Badge variant="secondary" className="text-xs font-normal mt-0.5">
                        {CATEGORY_OPTIONS.find((c) => c.value === group.category)?.label || group.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {group.description}
                  </p>

                  <Separator className="mb-4" />

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {group.member_count.toLocaleString()} 成员
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {group.post_count.toLocaleString()} 帖子
                    </span>
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
