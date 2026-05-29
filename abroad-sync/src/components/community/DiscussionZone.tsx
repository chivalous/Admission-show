'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  HelpCircle,
  MessageCircle,
  Eye,
  ArrowRight,
  Users,
  FileText,
  Plus,
} from 'lucide-react';
import type { Question } from '@/types';
import type { Group } from '@/types';
import { getGroups } from '@/lib/post-storage';

interface DiscussionZoneProps {
  questions: Question[];
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

export default function DiscussionZone({ questions }: DiscussionZoneProps) {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    setGroups(getGroups());
  }, []);

  const latestQuestions = [...questions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-10">
      {/* ====== Q&A Section ====== */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">问答求助</h2>
            <Badge variant="secondary" className="text-xs font-normal ml-1">
              {questions.length} 个问题
            </Badge>
          </div>
          <Link href="/community/ask">
            <Button size="sm" variant="outline">
              <Plus className="mr-1.5 h-4 w-4" />
              我要提问
            </Button>
          </Link>
        </div>

        {latestQuestions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <HelpCircle className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-500 mb-1">还没有人提问</p>
              <p className="text-sm text-gray-400 mb-4">
                有任何留学疑问？快来提出第一个问题吧
              </p>
              <Link href="/community/ask">
                <Button size="sm">我要提问</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {latestQuestions.map((q) => (
              <Link key={q.id} href={`/community/question/${q.id}`}>
                <Card className="hover:shadow-sm hover:border-blue-200 transition-all cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {q.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {q.content}
                        </p>
                        {q.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {q.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 font-normal"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0 pt-0.5">
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <MessageCircle className="h-3 w-3" />
                          {q.answer_count}
                        </span>
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Eye className="h-3 w-3" />
                          {q.view_count}
                        </span>
                        <span className="text-gray-300">{formatDate(q.created_at)}</span>
                      </div>
                    </div>
                    {q.accepted_answer_id && (
                      <div className="mt-2">
                        <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">
                          已有采纳
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}

            {questions.length > 5 && (
              <div className="text-center pt-2">
                <Link
                  href="/community"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  查看更多问答
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ====== Topic Groups Section ====== */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">话题小组</h2>
            <Badge variant="secondary" className="text-xs font-normal ml-1">
              {groups.length} 个小组
            </Badge>
          </div>
          <Link href="/groups">
            <Button size="sm" variant="ghost" className="text-gray-500 hover:text-gray-700 gap-1">
              查看全部
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {groups.length === 0 ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-36 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="shrink-0"
              >
                <Card className="w-[170px] hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg group-hover:scale-110 transition-transform">
                        {group.icon}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                          {group.name}
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                      {group.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {group.member_count.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {group.post_count.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
