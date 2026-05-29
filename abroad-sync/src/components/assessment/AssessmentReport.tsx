'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import type { DimensionScore, AssessmentIssue, AssessmentSuggestion } from '@/types';
import { TrendingUp, Lightbulb, AlertTriangle, ArrowRight, Target, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface AssessmentReportProps {
  overallScore: number;
  dimensionScores: DimensionScore[];
  highlights: string[];
  issues: AssessmentIssue[];
  suggestions: AssessmentSuggestion[];
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-600';
  if (score >= 60) return 'bg-yellow-600';
  return 'bg-red-600';
}

function getScoreBgLight(score: number): string {
  if (score >= 80) return 'bg-green-50 border-green-200';
  if (score >= 60) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
}

function getScoreLabel(score: number): string {
  if (score >= 85) return '优秀';
  if (score >= 75) return '良好';
  if (score >= 65) return '中等';
  if (score >= 50) return '及格';
  return '需要提升';
}

function getIssueLevelColor(level: string): string {
  if (level === '高') return 'bg-red-100 text-red-700 border-red-200';
  if (level === '中') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-blue-100 text-blue-700 border-blue-200';
}

function getPriorityColor(priority: string): string {
  if (priority === '高') return 'bg-red-100 text-red-700';
  if (priority === '中') return 'bg-yellow-100 text-yellow-700';
  return 'bg-blue-100 text-blue-700';
}

export function AssessmentReport({
  overallScore,
  dimensionScores,
  highlights,
  issues,
  suggestions,
}: AssessmentReportProps) {
  const highIssues = issues.filter((i) => i.level === '高');
  const mediumIssues = issues.filter((i) => i.level === '中');
  const lowIssues = issues.filter((i) => i.level === '低');

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-lg">综合评估结果</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-6">
          <div
            className={`flex h-32 w-32 items-center justify-center rounded-full border-4 ${getScoreBgLight(overallScore)}`}
          >
            <div className="text-center">
              <p className={`text-4xl font-extrabold ${getScoreColor(overallScore)}`}>
                {overallScore}
              </p>
              <p className={`text-sm font-medium ${getScoreColor(overallScore)}`}>
                / 100
              </p>
            </div>
          </div>
          <Badge
            className={`mt-3 text-sm px-3 py-1 ${getScoreBgColor(overallScore)} text-white border-0`}
          >
            {getScoreLabel(overallScore)}
          </Badge>
          <p className="mt-3 text-sm text-gray-500 text-center max-w-sm">
            {overallScore >= 80
              ? '你的 CV 整体竞争力较强，在目标院校中有较好的录取机会。'
              : overallScore >= 60
                ? '你的 CV 有一定的竞争力，部分维度需要加强以达到更高的录取概率。'
                : '你的 CV 有较大提升空间，建议按照以下建议重点改进。'}
          </p>
        </CardContent>
      </Card>

      {/* Dimension Scores */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            维度评分
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dimensionScores.map((dim) => (
            <div key={dim.dimension}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">{dim.label}</span>
                <span className={`text-sm font-bold ${getScoreColor(dim.score)}`}>
                  {dim.score}
                </span>
              </div>
              <Progress value={dim.score}>
                <ProgressTrack className="h-2">
                  <ProgressIndicator className={getScoreBgColor(dim.score)} />
                </ProgressTrack>
              </Progress>
              <p className="mt-1 text-xs text-gray-500">{dim.comment}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Highlights */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            亮点优势
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-600">{h}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Issues */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            问题与短板
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {highIssues.length > 0 && (
            <div>
              <Badge variant="outline" className="mb-2 border-red-200 bg-red-50 text-red-700">
                高优先级
              </Badge>
              <ul className="space-y-2">
                {highIssues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-lg bg-red-50/50 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {issue.dimension}
                      </p>
                      <p className="text-sm text-gray-600">{issue.suggestion}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mediumIssues.length > 0 && (
            <div>
              <Badge variant="outline" className="mb-2 border-yellow-200 bg-yellow-50 text-yellow-700">
                中优先级
              </Badge>
              <ul className="space-y-2">
                {mediumIssues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-lg bg-yellow-50/50 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {issue.dimension}
                      </p>
                      <p className="text-sm text-gray-600">{issue.suggestion}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {lowIssues.length > 0 && (
            <div>
              <Badge variant="outline" className="mb-2 border-blue-200 bg-blue-50 text-blue-700">
                低优先级
              </Badge>
              <ul className="space-y-2">
                {lowIssues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-lg bg-blue-50/50 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {issue.dimension}
                      </p>
                      <p className="text-sm text-gray-600">{issue.suggestion}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {issues.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              未发现明显问题，你的 CV 整体表现良好。
            </p>
          )}
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            行动建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-xs ${getPriorityColor(s.priority)} border-0`}>
                      {s.priority}优先
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{s.action}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Separator />

      {/* Next Steps */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <ArrowRight className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">下一步建议</p>
              <p className="mt-1 text-sm text-gray-600">
                根据评估结果，你可以前往院校库筛选与你的背景匹配的目标学校，并开始追踪申请进度。
              </p>
              <Link
                href="/schools"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                浏览院校库
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
