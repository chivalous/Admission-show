'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AssessmentReport } from '@/components/assessment/AssessmentReport';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { COUNTRIES, DEGREES } from '@/types';
import type { DimensionScore, AssessmentIssue, AssessmentSuggestion } from '@/types';
import { FileText, Send, RefreshCw, LogIn, Sparkles } from 'lucide-react';

type PageState = 'input' | 'loading' | 'done';

interface AssessmentResult {
  overall_score: number;
  dimension_scores: DimensionScore[];
  highlights: string[];
  issues: AssessmentIssue[];
  suggestions: AssessmentSuggestion[];
}

export default function AssessmentPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>('input');
  const [savedId, setSavedId] = useState<string | null>(null);

  // Form fields
  const [targetCountry, setTargetCountry] = useState('');
  const [targetDegree, setTargetDegree] = useState('');
  const [targetMajor, setTargetMajor] = useState('');
  const [cvText, setCvText] = useState('');

  // Result
  const [result, setResult] = useState<AssessmentResult | null>(null);

  // Error
  const [error, setError] = useState<string | null>(null);

  // User state
  const [user, setUser] = useState<boolean>(false);
  const [userChecked, setUserChecked] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(!!data.user);
      setUserChecked(true);
    });
  }, []);

  const isFormValid =
    targetCountry && targetDegree && targetMajor.trim() && cvText.trim().length >= 50;

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setError(null);
    setPageState('loading');

    try {
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText: cvText.trim(),
          targetCountry,
          targetDegree,
          targetMajor: targetMajor.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || `请求失败 (${res.status})`);
      }

      setResult(json.data);
      setSavedId(json.saved_id);
      setPageState('done');
      toast.success('CV 评估完成！');

      // Refresh user state in case they logged in in another tab
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(!!data.user);
      setUserChecked(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '评估失败，请稍后重试';
      setError(message);
      setPageState('input');
      toast.error(message);
    }
  };

  const handleReset = () => {
    setPageState('input');
    setResult(null);
    setSavedId(null);
    setError(null);
    setCvText('');
    setTargetCountry('');
    setTargetDegree('');
    setTargetMajor('');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            CV 智能评估
          </h1>
          <p className="mt-3 text-gray-500">
            上传你的简历，AI 将从多个维度分析你的留学竞争力，并给出具体提升建议
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="mr-1 h-3 w-3" />
              AI 驱动
            </Badge>
            <Badge variant="secondary" className="text-xs">
              30 秒出报告
            </Badge>
            <Badge variant="secondary" className="text-xs">
              免费使用
            </Badge>
          </div>
        </div>

        {/* Input State */}
        {pageState === 'input' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                评估信息
              </CardTitle>
              <CardDescription>
                填写目标信息和你的 CV 内容，AI 将为你生成详细的竞争力评估报告。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Target Info Row */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="targetCountry">目标国家</Label>
                  <Select value={targetCountry} onValueChange={(v) => setTargetCountry(v ?? '')}>
                    <SelectTrigger id="targetCountry">
                      <SelectValue placeholder="选择国家" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetDegree">目标学位</Label>
                  <Select value={targetDegree} onValueChange={(v) => setTargetDegree(v ?? '')}>
                    <SelectTrigger id="targetDegree">
                      <SelectValue placeholder="选择学位" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEGREES.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetMajor">目标专业</Label>
                  <Input
                    id="targetMajor"
                    placeholder="例：计算机科学、金融、机械工程"
                    value={targetMajor}
                    onChange={(e) => setTargetMajor(e.target.value)}
                  />
                </div>
              </div>

              {/* CV Text */}
              <div className="space-y-2">
                <Label htmlFor="cvText">
                  CV 内容
                  <span className="ml-1 text-xs text-gray-400">
                    （直接粘贴完整 CV 文本，至少 50 个字符）
                  </span>
                </Label>
                <Textarea
                  id="cvText"
                  placeholder="请在此粘贴你的 CV/简历内容...&#10;&#10;包括：教育背景、科研经历、实习经历、语言成绩、获奖情况、技能等"
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  rows={16}
                  className="font-mono text-sm leading-relaxed resize-y"
                />
                <p className="text-xs text-gray-400 text-right">
                  {cvText.trim().length} / 最少 50 字符
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Submit */}
              <div className="flex flex-col items-center gap-3 pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid}
                  size="lg"
                  className="w-full sm:w-auto px-12"
                >
                  <Send className="mr-2 h-4 w-4" />
                  开始评估
                </Button>
                {!user && userChecked && (
                  <p className="text-xs text-gray-400">
                    <Link href="/auth/login" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                      <LogIn className="h-3 w-3" />
                      登录
                    </Link>
                    {' '}后可保存评估记录，查看历史报告
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {pageState === 'loading' && (
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">
                    AI 正在分析你的 CV...
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    正在从多个维度评估你的留学竞争力，请稍候
                  </p>
                </div>
                <div className="w-full max-w-md space-y-3">
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-2 w-4/5" />
                  <Skeleton className="h-2 w-3/5" />
                </div>
                <div className="space-y-4 w-full max-w-md">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Done State */}
        {pageState === 'done' && result && (
          <>
            <AssessmentReport
              overallScore={result.overall_score}
              dimensionScores={result.dimension_scores}
              highlights={result.highlights}
              issues={result.issues}
              suggestions={result.suggestions}
            />

            <div className="mt-8 flex flex-col items-center gap-3">
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                重新评估
              </Button>
              {!user && userChecked && (
                <p className="text-xs text-gray-400">
                  <Link href="/auth/login" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                    <LogIn className="h-3 w-3" />
                    登录
                  </Link>
                  {' '}后可保存此评估记录
                </p>
              )}
              {savedId && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                  已保存至你的评估历史
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
