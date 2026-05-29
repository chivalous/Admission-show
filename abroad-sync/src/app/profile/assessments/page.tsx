'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, FileText, TrendingUp, ExternalLink } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { CVAssessment } from '@/types';

// Sample seed assessments for MVP display
const SEED_ASSESSMENTS: CVAssessment[] = [
  {
    id: 'asmt-1',
    user_id: 'demo-user',
    target_country: '美国',
    target_degree: '硕士',
    target_major: '计算机科学',
    cv_file_url: null,
    cv_text: '',
    overall_score: 78,
    dimension_scores: [],
    highlights: [],
    issues: [],
    suggestions: [],
    created_at: '2026-05-20T10:00:00Z',
  },
  {
    id: 'asmt-2',
    user_id: 'demo-user',
    target_country: '英国',
    target_degree: '硕士',
    target_major: '经济学',
    cv_file_url: null,
    cv_text: '',
    overall_score: 72,
    dimension_scores: [],
    highlights: [],
    issues: [],
    suggestions: [],
    created_at: '2026-05-15T14:30:00Z',
  },
  {
    id: 'asmt-3',
    user_id: 'demo-user',
    target_country: '新加坡',
    target_degree: '博士',
    target_major: '电子工程',
    cv_file_url: null,
    cv_text: '',
    overall_score: 85,
    dimension_scores: [],
    highlights: [],
    issues: [],
    suggestions: [],
    created_at: '2026-05-10T08:15:00Z',
  },
];

function getScoreColor(score: number): string {
  if (score >= 85) return 'text-green-600';
  if (score >= 70) return 'text-blue-600';
  if (score >= 55) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBg(score: number): string {
  if (score >= 85) return 'bg-green-50';
  if (score >= 70) return 'bg-blue-50';
  if (score >= 55) return 'bg-yellow-50';
  return 'bg-red-50';
}

function getScoreLabel(score: number): string {
  if (score >= 85) return '竞争力强';
  if (score >= 70) return '有竞争力';
  if (score >= 55) return '需要提升';
  return '较弱';
}

export default function AssessmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<CVAssessment[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/auth/login?redirect=/profile/assessments');
        return;
      }
      setUser(data.user);

      // Try Supabase first, fall back to localStorage
      supabase
        .from('cv_assessments')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
        .then(({ data: supabaseData, error }) => {
          if (error || !supabaseData || supabaseData.length === 0) {
            // Fall back to localStorage
            const key = `abroad-sync-assessments-${data.user.id}`;
            if (typeof window !== 'undefined') {
              const stored = localStorage.getItem(key);
              if (stored) {
                setAssessments(JSON.parse(stored));
              }
            }
          } else {
            setAssessments(supabaseData as CVAssessment[]);
          }
        });

      setLoading(false);
    });
  }, [router]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500">加载中...</p>
      </div>
    );
  }

  if (!user) return null;

  const displayAssessments = assessments.length > 0 ? assessments : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <button
        onClick={() => router.push('/profile')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        返回个人中心
      </button>

      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-2">我的评估历史</h1>
      <p className="text-sm text-gray-500 mb-8">查看你过往的 CV 评估记录</p>

      {displayAssessments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <FileText className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg text-gray-500">还没有评估记录</p>
            <p className="text-sm text-gray-400 mt-1 mb-6">
              上传你的 CV，获取 AI 多维度评估报告
            </p>
            <Link href="/assessment">
              <Button>
                立即评估 CV
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayAssessments.map((asmt) => (
            <Card key={asmt.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {asmt.target_major}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {asmt.target_country}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {asmt.target_degree}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{formatDate(asmt.created_at)}</p>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">综合评分</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${getScoreColor(asmt.overall_score)}`}>
                          {asmt.overall_score}
                        </span>
                        <Badge className={`${getScoreBg(asmt.overall_score)} ${getScoreColor(asmt.overall_score)} border-0 text-xs`}>
                          {getScoreLabel(asmt.overall_score)}
                        </Badge>
                      </div>
                    </div>
                    <TrendingUp className={`h-8 w-8 ${getScoreColor(asmt.overall_score)} opacity-30`} />
                  </div>
                </div>

                {/* View details link */}
                <div className="mt-3 pt-3 border-t">
                  <Link
                    href={`/assessment?id=${asmt.id}`}
                    className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    查看详情
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
