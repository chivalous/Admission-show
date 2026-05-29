'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { createPost } from '@/lib/post-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import RichEditor from '@/components/community/RichEditor';
import { toast } from 'sonner';
import { ArrowLeft, X } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { TAG_CATEGORIES } from '@/types';

const TAG_GROUPS: { label: string; key: keyof typeof TAG_CATEGORIES }[] = [
  { label: '国家', key: 'country' },
  { label: '学位', key: 'degree' },
  { label: '专业', key: 'major' },
  { label: '类型', key: 'topic' },
];

function stripHtml(html: string): string {
  if (typeof window === 'undefined') return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export default function WritePostPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Auth check
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/auth/login?redirect=/community/write');
      } else {
        setUser(data.user);
      }
      setLoading(false);
    });
  }, [router]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const removeTag = useCallback((tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleSubmit = async () => {
    if (!user) return;

    // Validate
    if (!title.trim()) {
      toast.error('请输入标题');
      return;
    }
    if (!content || stripHtml(content).trim().length === 0) {
      toast.error('请输入内容');
      return;
    }

    setSubmitting(true);
    try {
      const plainText = stripHtml(content);
      const excerpt = plainText.replace(/\s+/g, ' ').trim().slice(0, 150);

      const post = createPost({
        user_id: user.id,
        title: title.trim(),
        content,
        excerpt,
        tags: selectedTags,
        cover_image: null,
        is_pinned: false,
        author: {
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || '用户',
          avatar_url: user.user_metadata?.avatar_url || null,
        },
      });

      toast.success('经验帖发布成功！');
      router.push(`/community/post/${post.id}`);
    } catch {
      toast.error('发布失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-[400px] bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">写经验帖</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            分享你的申请经验、选校心得与备考攻略
          </p>
        </div>
        <Link href="/community">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            取消
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="post-title">
            标题 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="post-title"
            placeholder="例如：从零基础到CMU计算机录取的经验分享"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 100))}
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground text-right">
            {title.length}/100
          </p>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <Label>标签</Label>
          <div className="space-y-3">
            {TAG_GROUPS.map((group) => (
              <div key={group.key}>
                <p className="text-xs text-muted-foreground mb-1.5">{group.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {TAG_CATEGORIES[group.key].map((tag: string) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <Badge
                        key={tag}
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Selected tags summary */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-muted-foreground">已选：</span>
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="space-y-2">
          <Label>
            内容 <span className="text-destructive">*</span>
          </Label>
          <RichEditor content={content} onChange={setContent} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? '发布中...' : '发布经验帖'}
          </Button>
          <Link href="/community">
            <Button variant="outline">取消</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
