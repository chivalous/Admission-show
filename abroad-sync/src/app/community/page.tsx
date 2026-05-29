'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import ShareWaterfall from '@/components/community/ShareWaterfall';
import DiscussionZone from '@/components/community/DiscussionZone';
import { getPosts, getQuestions } from '@/lib/post-storage';
import {
  Plus,
  PenLine,
  BookOpen,
  GraduationCap,
  CalendarDays,
  Eye,
  Camera,
  HelpCircle,
} from 'lucide-react';
import type { AdmissionReport, ExperiencePost, Question } from '@/types';
import { COUNTRIES, DEGREES } from '@/types';

const RESULT_LABELS: Record<string, string> = {
  admitted: '录取',
  rejected: '拒录',
  waitlisted: '等候名单',
};

const RESULT_COLORS: Record<string, string> = {
  admitted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  waitlisted: 'bg-orange-100 text-orange-700',
};

// Sample seed data for MVP display
const SEED_REPORTS: AdmissionReport[] = [
  {
    id: 'rpt-1',
    user_id: 'user-1',
    school_id: 'seed-2',
    major: '计算机科学',
    degree: '硕士',
    result: 'admitted',
    undergraduate_school: '北京大学',
    gpa: '3.8/4.0',
    toefl: 108,
    ielts: null,
    gre: '328 (V:160 Q:168)',
    research_experience: '两段科研经历，一篇顶会论文',
    internship_experience: '字节跳动算法实习生 6个月',
    applied_date: '2025-12-01',
    result_date: '2026-03-15',
    advice: '建议早点套磁，GRE建议提前半年准备',
    is_anonymous: false,
    created_at: '2026-03-20T10:00:00Z',
    school: {
      id: 'seed-2',
      name: '斯坦福大学',
      name_en: 'Stanford University',
      country: '美国',
      ranking: 2,
      website: null,
      description: null,
      requirements: null,
      tuition: null,
      application_deadline: null,
      logo_url: null,
      created_at: '',
    },
    profile: { id: 'user-1', email: '', display_name: '留学小助手', avatar_url: null, education_bg: null, language_scores: null, created_at: '' },
  },
  {
    id: 'rpt-2',
    user_id: 'user-2',
    school_id: 'seed-5',
    major: '经济学',
    degree: '硕士',
    result: 'admitted',
    undergraduate_school: '复旦大学',
    gpa: '3.7/4.0',
    toefl: 105,
    ielts: null,
    gre: '322 (V:158 Q:164)',
    research_experience: '一段校内科研，协助导师完成国家级课题',
    internship_experience: '中金公司研究所 3个月',
    applied_date: '2025-11-20',
    result_date: '2026-02-28',
    advice: '剑桥看重学术背景，PS要突出研究经历',
    is_anonymous: true,
    created_at: '2026-03-10T08:00:00Z',
    school: {
      id: 'seed-5',
      name: '剑桥大学',
      name_en: 'University of Cambridge',
      country: '英国',
      ranking: 5,
      website: null,
      description: null,
      requirements: null,
      tuition: null,
      application_deadline: null,
      logo_url: null,
      created_at: '',
    },
    profile: null,
  },
  {
    id: 'rpt-3',
    user_id: 'user-3',
    school_id: 'seed-7',
    major: '数据科学',
    degree: '硕士',
    result: 'rejected',
    undergraduate_school: '浙江大学',
    gpa: '3.5/4.0',
    toefl: 100,
    ielts: null,
    gre: '318 (V:154 Q:164)',
    research_experience: '毕业设计项目',
    internship_experience: '阿里巴巴数据开发 4个月',
    applied_date: '2025-12-15',
    result_date: '2026-04-05',
    advice: '哥大DS竞争非常激烈，建议GPA至少3.7以上',
    is_anonymous: false,
    created_at: '2026-04-08T14:00:00Z',
    school: {
      id: 'seed-7',
      name: '哥伦比亚大学',
      name_en: 'Columbia University',
      country: '美国',
      ranking: 12,
      website: null,
      description: null,
      requirements: null,
      tuition: null,
      application_deadline: null,
      logo_url: null,
      created_at: '',
    },
    profile: { id: 'user-3', email: '', display_name: '数据爱好者', avatar_url: null, education_bg: null, language_scores: null, created_at: '' },
  },
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CommunityPage() {
  const [countryFilter, setCountryFilter] = useState('all');
  const [degreeFilter, setDegreeFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');

  const [reports, setReports] = useState<AdmissionReport[]>(() => {
    if (typeof window === 'undefined') return SEED_REPORTS;
    const stored = localStorage.getItem('abroad-sync-community-reports');
    return stored ? JSON.parse(stored) : SEED_REPORTS;
  });

  const [posts, setPosts] = useState<ExperiencePost[]>(() => getPosts());
  const [questions, setQuestions] = useState<Question[]>(() => {
    if (typeof window === 'undefined') return [];
    return getQuestions();
  });

  // Persist reports to localStorage
  useEffect(() => {
    localStorage.setItem('abroad-sync-community-reports', JSON.stringify(reports));
  }, [reports]);

  // Refresh data on mount
  useEffect(() => {
    setPosts(getPosts());
    setQuestions(getQuestions());
  }, []);

  const filteredReports = reports.filter((r) => {
    if (countryFilter !== 'all' && r.school?.country !== countryFilter) return false;
    if (degreeFilter !== 'all' && r.degree !== degreeFilter) return false;
    if (resultFilter !== 'all' && r.result !== resultFilter) return false;
    return true;
  });

  // Show latest 4 reports in compact view
  const latestReports = filteredReports.slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ====== Page Header ====== */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">留学社区</h1>
          <p className="mt-1 text-sm text-gray-500">
            分享经验、互助讨论、查看录取汇报，找到同路人
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/community/write">
            <Button>
              <PenLine className="mr-2 h-4 w-4" />
              写经验帖
            </Button>
          </Link>
        </div>
      </div>

      {/* ====== Zone 1: 分享区 (Xiaohongshu Style) ====== */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <Camera className="h-5 w-5 text-pink-500" />
          <h2 className="text-lg font-semibold text-gray-900">经验分享</h2>
          <Badge variant="secondary" className="text-xs font-normal">
            {posts.length} 篇帖子
          </Badge>
        </div>
        <p className="text-sm text-gray-400 mb-5">申请经验、备考攻略、选校心得——学长学姐的真实分享</p>

        <ShareWaterfall posts={posts} />
      </section>

      <Separator className="my-2" />

      {/* ====== Zone 2: 讨论区 (Zhihu + Feishu Style) ====== */}
      <section className="mt-10 mb-10">
        <DiscussionZone questions={questions} />
      </section>

      <Separator className="my-2" />

      {/* ====== Zone 3: 录取汇报 ====== */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">录取汇报</h2>
            <Badge variant="secondary" className="text-xs font-normal">
              {reports.length} 条汇报
            </Badge>
          </div>
          <Link href="/community/report">
            <Button size="sm" variant="outline">
              <Plus className="mr-1.5 h-4 w-4" />
              分享录取结果
            </Button>
          </Link>
        </div>
        <p className="text-sm text-gray-400 mb-5">查看同背景学长学姐的录取案例，评估自己的申请定位</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <Select value={countryFilter} onValueChange={(v) => { if (v !== null) setCountryFilter(v); }}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="国家/地区" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部国家</SelectItem>
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={degreeFilter} onValueChange={(v) => { if (v !== null) setDegreeFilter(v); }}>
            <SelectTrigger className="w-[120px] h-9 text-sm">
              <SelectValue placeholder="学位" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部学位</SelectItem>
              {DEGREES.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={resultFilter} onValueChange={(v) => { if (v !== null) setResultFilter(v); }}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="录取结果" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部结果</SelectItem>
              <SelectItem value="admitted">录取</SelectItem>
              <SelectItem value="rejected">拒录</SelectItem>
              <SelectItem value="waitlisted">等候名单</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {latestReports.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="mx-auto h-12 w-12 mb-4 text-gray-300" />
            <p className="text-lg">没有找到匹配的汇报</p>
            <p className="text-sm mt-1">尝试调整筛选条件</p>
          </div>
        ) : (
          <div className="space-y-4">
            {latestReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Top row: school + result */}
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-gray-900">
                          {report.school?.name ?? '未知院校'}
                        </h3>
                        <Badge className={`${RESULT_COLORS[report.result]} border-0`} variant="secondary">
                          {RESULT_LABELS[report.result]}
                        </Badge>
                        <span className="text-sm text-gray-400">{report.school?.country}</span>
                      </div>

                      {/* Major + degree */}
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                        <GraduationCap className="h-4 w-4" />
                        <span>{report.major}</span>
                        <span className="text-gray-300">|</span>
                        <span>{report.degree}</span>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-4 mb-3 text-sm">
                        <span className="text-gray-500">
                          GPA: <span className="font-medium text-gray-700">{report.gpa || '-'}</span>
                        </span>
                        {report.toefl && (
                          <span className="text-gray-500">
                            TOEFL: <span className="font-medium text-gray-700">{report.toefl}</span>
                          </span>
                        )}
                        {report.gre && (
                          <span className="text-gray-500">
                            GRE: <span className="font-medium text-gray-700">{report.gre}</span>
                          </span>
                        )}
                      </div>

                      {/* Advice */}
                      {report.advice && (
                        <p className="text-sm text-gray-500 italic">&ldquo;{report.advice}&rdquo;</p>
                      )}
                    </div>

                    {/* Right side: meta */}
                    <div className="text-right text-xs text-gray-400 space-y-1 shrink-0">
                      <p className="flex items-center justify-end gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(report.created_at)}
                      </p>
                      <p>
                        {report.is_anonymous
                          ? '匿名用户'
                          : report.profile?.display_name || '未知用户'}
                      </p>
                    </div>
                  </div>

                  {(report.applied_date || report.result_date) && (
                    <>
                      <Separator className="my-3" />
                      <div className="flex gap-6 text-xs text-gray-400">
                        {report.applied_date && (
                          <span>申请时间: {formatDate(report.applied_date)}</span>
                        )}
                        {report.result_date && (
                          <span>结果时间: {formatDate(report.result_date)}</span>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredReports.length > 4 && (
              <div className="text-center pt-2">
                <p className="text-sm text-gray-400">
                  还有 {filteredReports.length - 4} 条汇报 — 使用筛选器查看更多
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
