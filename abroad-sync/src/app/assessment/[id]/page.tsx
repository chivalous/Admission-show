import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AssessmentReport } from '@/components/assessment/AssessmentReport';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import type { DimensionScore, AssessmentIssue, AssessmentSuggestion } from '@/types';

interface AssessmentPageProps {
  params: Promise<{ id: string }>;
}

export default async function PastAssessmentPage({ params }: AssessmentPageProps) {
  const { id } = await params;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center gap-4">
                <AlertCircle className="h-12 w-12 text-yellow-500" />
                <h2 className="text-xl font-semibold text-gray-900">需要登录</h2>
                <p className="text-gray-500 max-w-sm">
                  请登录后查看你的评估报告。
                </p>
                <Link href="/auth/login">
                  <Button>前往登录</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { data: assessment, error } = await supabase
    .from('cv_assessments')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !assessment) {
    notFound();
  }

  if (assessment.user_id !== user.id) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center gap-4">
                <AlertCircle className="h-12 w-12 text-red-400" />
                <h2 className="text-xl font-semibold text-gray-900">无权访问</h2>
                <p className="text-gray-500 max-w-sm">
                  这不是你的评估报告，你无权查看。
                </p>
                <Link href="/assessment">
                  <Button>返回评估页面</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const overallScore = assessment.overall_score as number;
  const dimensionScores = assessment.dimension_scores as DimensionScore[];
  const highlights = assessment.highlights as string[];
  const issues = assessment.issues as AssessmentIssue[];
  const suggestions = assessment.suggestions as AssessmentSuggestion[];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back and Meta */}
        <div className="mb-6">
          <Link href="/assessment">
            <Button variant="ghost" size="sm" className="mb-4 -ml-2">
              <ArrowLeft className="mr-1 h-4 w-4" />
              返回评估
            </Button>
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              <FileText className="h-4 w-4" />
              目标：{assessment.target_country} / {assessment.target_degree} / {assessment.target_major}
            </span>
            <span className="text-gray-300">|</span>
            <span>
              评估时间：{new Date(assessment.created_at).toLocaleString('zh-CN')}
            </span>
          </div>
        </div>

        <AssessmentReport
          overallScore={overallScore}
          dimensionScores={dimensionScores}
          highlights={highlights}
          issues={issues}
          suggestions={suggestions}
        />

        <div className="mt-8 flex justify-center">
          <Link href="/assessment">
            <Button variant="outline" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              创建新评估
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
