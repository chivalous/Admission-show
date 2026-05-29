'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getSchoolById } from '@/lib/seed-schools';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Star,
  MapPin,
  Globe,
  ArrowLeft,
  GraduationCap,
  DollarSign,
  Shield,
  Briefcase,
  Home,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Send,
  LogIn,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { School } from '@/types';

const COUNTRY_BADGE_COLORS: Record<string, string> = {
  '美国': 'bg-blue-100 text-blue-700 border-blue-200',
  '英国': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  '加拿大': 'bg-red-100 text-red-700 border-red-200',
  '澳大利亚': 'bg-amber-100 text-amber-700 border-amber-200',
  '新加坡': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '香港': 'bg-orange-100 text-orange-700 border-orange-200',
  '欧洲大陆': 'bg-purple-100 text-purple-700 border-purple-200',
  '日本': 'bg-pink-100 text-pink-700 border-pink-200',
};

function getCountryBadge(country: string) {
  return COUNTRY_BADGE_COLORS[country] ?? 'bg-gray-100 text-gray-700 border-gray-200';
}

const DIMENSIONS = [
  { key: 'academic_reputation' as const, label: '学术声誉', icon: GraduationCap },
  { key: 'employment_prospect' as const, label: '就业前景', icon: Briefcase },
  { key: 'campus_environment' as const, label: '校园环境', icon: Home },
  { key: 'living_cost' as const, label: '生活成本', icon: DollarSign },
  { key: 'safety' as const, label: '安全性', icon: Shield },
];

function StarSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          className="cursor-pointer transition-transform hover:scale-110"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
        >
          <Star
            className={`size-5 ${
              i <= (hover || value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function DisplayStars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'md' ? 'size-5' : 'size-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i <= Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function SchoolDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('info');

  // Rating form state
  const [scores, setScores] = useState<Record<string, number>>({
    academic_reputation: 0,
    employment_prospect: 0,
    campus_environment: 0,
    living_cost: 0,
    safety: 0,
  });
  const [overallRecommend, setOverallRecommend] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();

  // Load school and user
  useEffect(() => {
    const found = getSchoolById(id);
    setSchool(found ?? null);
    setLoading(false);

    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [id]);

  const handleScoreChange = (dim: string, value: number) => {
    setScores((prev) => ({ ...prev, [dim]: value }));
  };

  const handleSubmitRating = useCallback(async () => {
    if (!user) {
      toast.error('请先登录后再提交评价');
      return;
    }
    if (Object.values(scores).some((v) => v === 0)) {
      toast.error('请对所有维度进行评分');
      return;
    }
    if (overallRecommend === null) {
      toast.error('请选择是否推荐该校');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_id: id,
          ...scores,
          overall_recommend: overallRecommend,
          comment: comment.trim() || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '提交失败');
      }

      toast.success('评价提交成功！');
      // Reset form
      setScores({
        academic_reputation: 0,
        employment_prospect: 0,
        campus_environment: 0,
        living_cost: 0,
        safety: 0,
      });
      setOverallRecommend(null);
      setComment('');
    } catch (err: any) {
      toast.error(err.message || '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }, [scores, overallRecommend, comment, user, id]);

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-6 w-96 mb-2" />
        <Skeleton className="h-64 w-full mt-6" />
      </div>
    );
  }

  // Not found
  if (!school) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">院校未找到</h1>
        <p className="mt-2 text-muted-foreground">该院校 ID 不存在或已被删除</p>
        <Link href="/schools">
          <Button variant="link" className="mt-4">
            <ArrowLeft className="mr-1 size-4" />
            返回院校库
          </Button>
        </Link>
      </div>
    );
  }

  const avgRating = (() => {
    const vals = [
      school.avg_academic_reputation,
      school.avg_employment_prospect,
      school.avg_campus_environment,
      school.avg_living_cost,
      school.avg_safety,
    ];
    if (vals.every((v) => v != null)) {
      return (vals as number[]).reduce((a, b) => a + b, 0) / vals.length;
    }
    return null;
  })();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/schools"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-1 size-4" />
        返回院校库
      </Link>

      {/* School header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <Badge variant="outline" className={getCountryBadge(school.country)}>
            <MapPin className="mr-1 size-3" />
            {school.country}
          </Badge>
          {school.ranking != null && (
            <Badge variant="default" className="text-xs">
              QS #{school.ranking}
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {school.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{school.name_en}</p>
        {school.website && (
          <a
            href={school.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center text-sm text-primary hover:underline"
          >
            <Globe className="mr-1 size-3.5" />
            访问官网
          </a>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">基本信息</TabsTrigger>
          <TabsTrigger value="cases">录取案例</TabsTrigger>
          <TabsTrigger value="reviews">学长评价</TabsTrigger>
        </TabsList>

        {/* ====== Tab 1: 基本信息 ====== */}
        <TabsContent value="info" className="mt-6 space-y-6">
          {/* Description */}
          {school.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">学校简介</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {school.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">申请要求</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {school.requirements?.gpa_min && (
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground mb-1">最低 GPA</p>
                    <p className="text-sm font-semibold">{school.requirements.gpa_min}</p>
                  </div>
                )}
                {school.requirements?.toefl_min != null && (
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground mb-1">TOEFL 最低</p>
                    <p className="text-sm font-semibold">{school.requirements.toefl_min}</p>
                  </div>
                )}
                {school.requirements?.ielts_min != null && (
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground mb-1">IELTS 最低</p>
                    <p className="text-sm font-semibold">{school.requirements.ielts_min}</p>
                  </div>
                )}
                {school.requirements?.gre && (
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground mb-1">GRE</p>
                    <p className="text-sm font-semibold">{school.requirements.gre}</p>
                  </div>
                )}
              </div>
              {!school.requirements?.gpa_min &&
                !school.requirements?.toefl_min &&
                !school.requirements?.ielts_min &&
                !school.requirements?.gre && (
                  <p className="text-sm text-muted-foreground">暂无申请要求数据</p>
                )}
            </CardContent>
          </Card>

          {/* Tuition & Deadline */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  <DollarSign className="mr-1 inline size-4" />
                  学费参考
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {school.tuition || '暂无数据'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  <Calendar className="mr-1 inline size-4" />
                  申请截止
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {school.application_deadline || '暂无数据'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Overall rating summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">综合评分</CardTitle>
            </CardHeader>
            <CardContent>
              {avgRating != null ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-amber-500">
                        {avgRating.toFixed(1)}
                      </p>
                      <DisplayStars value={avgRating} size="md" />
                      {school.rating_count != null && school.rating_count > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {school.rating_count} 人评价
                        </p>
                      )}
                    </div>
                    {school.recommend_ratio != null && (
                      <div className="flex-1 rounded-lg bg-green-50 p-4 text-center">
                        <p className="text-xs text-green-600 mb-1">推荐率</p>
                        <p className="text-2xl font-bold text-green-700">
                          {Math.round(school.recommend_ratio * 100)}%
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Dimensions */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {DIMENSIONS.map(({ key, label, icon: Icon }) => {
                      const dimValue =
                        (school as any)[`avg_${key}`] as number | undefined;
                      return (
                        <div
                          key={key}
                          className="flex flex-col items-center rounded-lg border border-border p-3"
                        >
                          <Icon className="mb-1 size-4 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{label}</p>
                          {dimValue != null ? (
                            <>
                              <p className="text-sm font-semibold">{dimValue.toFixed(1)}</p>
                              <DisplayStars value={dimValue} />
                            </>
                          ) : (
                            <p className="text-xs text-muted-foreground">暂无</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  暂无评分数据，成为第一位评价者！
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== Tab 2: 录取案例 (placeholder) ====== */}
        <TabsContent value="cases" className="mt-6">
          <Card>
            <CardContent className="py-16 text-center">
              <GraduationCap className="mx-auto mb-3 size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                录取案例功能即将上线，敬请期待
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                届时将展示该校录取的 GPA、语言成绩、科研背景等真实案例
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== Tab 3: 学长评价 ====== */}
        <TabsContent value="reviews" className="mt-6 space-y-6">
          {/* Rating form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">撰写评价</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {!user ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <LogIn className="mb-3 size-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mb-3">
                    请登录后提交评价
                  </p>
                  <Link href={`/auth/login?redirect=/schools/${id}`}>
                    <Button size="sm">去登录</Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Dimension scores */}
                  <div className="space-y-4">
                    {DIMENSIONS.map(({ key, label }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-4"
                      >
                        <Label className="w-20 shrink-0 text-xs">{label}</Label>
                        <StarSelector
                          value={scores[key]}
                          onChange={(v) => handleScoreChange(key, v)}
                        />
                        <span className="w-8 text-right text-xs text-muted-foreground">
                          {scores[key] > 0 ? `${scores[key]}分` : '-'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Overall recommend */}
                  <div>
                    <Label className="mb-2 block text-xs">是否推荐该校？</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={overallRecommend === true ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOverallRecommend(true)}
                        className={
                          overallRecommend === true
                            ? 'bg-green-600 hover:bg-green-700'
                            : ''
                        }
                      >
                        <ThumbsUp className="mr-1 size-3.5" />
                        推荐
                      </Button>
                      <Button
                        type="button"
                        variant={overallRecommend === false ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOverallRecommend(false)}
                        className={
                          overallRecommend === false
                            ? 'bg-red-600 hover:bg-red-700'
                            : ''
                        }
                      >
                        <ThumbsDown className="mr-1 size-3.5" />
                        不推荐
                      </Button>
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <Label className="mb-2 block text-xs">评价留言（选填）</Label>
                    <Input
                      placeholder="分享你的就读体验、申请建议等..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="h-20"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    onClick={handleSubmitRating}
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? (
                      '提交中...'
                    ) : (
                      <>
                        <Send className="mr-1 size-4" />
                        提交评价
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Placeholder for existing reviews */}
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-sm text-muted-foreground">
                评价列表将在连接数据库后展示
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
