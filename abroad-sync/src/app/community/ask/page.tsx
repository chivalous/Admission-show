'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, X } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { COUNTRIES, DEGREES, TAG_CATEGORIES } from '@/types';
import { createQuestion, generateId } from '@/lib/post-storage';
import Link from 'next/link';

export default function AskQuestionPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/auth/login?redirect=/community/ask');
      } else {
        setUser(data.user);
      }
      setLoading(false);
    });
  }, [router]);

  const addTag = useCallback(
    (tag: string) => {
      if (tag && !tags.includes(tag)) {
        setTags((prev) => [...prev, tag]);
      }
      setTagInput('');
    },
    [tags]
  );

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('请输入问题标题');
      return;
    }
    if (!content.trim()) {
      toast.error('请输入问题描述');
      return;
    }
    if (!user) {
      toast.error('请先登录');
      return;
    }

    setSubmitting(true);
    try {
      const question = createQuestion({
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        tags,
        author: {
          display_name: user.email?.split('@')[0] || '匿名用户',
          avatar_url: null,
        },
      });
      toast.success('问题已发布');
      router.push(`/community/question/${question.id}`);
    } catch {
      toast.error('发布失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500">加载中...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link
        href="/community"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        返回社区
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-6">提出你的问题</h1>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              问题标题 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="简明扼要地描述你的问题，如：GRE 320分能申请到TOP30的CS项目吗？"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-gray-400">{title.length}/100</p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              问题描述 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="详细描述你的问题背景、已做过的尝试、具体困惑等..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>标签（帮助别人更好地理解你的问题）</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 rounded-full hover:bg-gray-300 p-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {/* Quick-select tags */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500">快速选择标签：</p>
              {Object.entries(TAG_CATEGORIES).map(([category, options]) => (
                <div key={category} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-12 shrink-0">
                    {category === 'country'
                      ? '国家'
                      : category === 'degree'
                      ? '学位'
                      : category === 'major'
                      ? '专业'
                      : '话题'}
                    :
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        disabled={tags.includes(opt)}
                        onClick={() => addTag(opt)}
                        className={`px-2 py-0.5 text-xs rounded-full border cursor-pointer transition-colors ${
                          tags.includes(opt)
                            ? 'bg-blue-100 text-blue-600 border-blue-200'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => router.back()}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? '发布中...' : '发布问题'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
