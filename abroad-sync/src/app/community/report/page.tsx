'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { seedSchools } from '@/lib/seed-schools';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { AdmissionReport } from '@/types';
import { COUNTRIES, DEGREES } from '@/types';

const STEPS = [
  { num: 1, label: '院校信息' },
  { num: 2, label: '个人背景' },
  { num: 3, label: '时间线与建议' },
];

const RESULT_OPTIONS = [
  { value: 'admitted', label: '录取' },
  { value: 'rejected', label: '拒录' },
  { value: 'waitlisted', label: '等候名单' },
];

function generateId() {
  return `rpt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function SubmitReportPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: School info
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [major, setMajor] = useState('');
  const [degree, setDegree] = useState('');
  const [result, setResult] = useState<string>('');

  // Step 2: Background
  const [undergraduateSchool, setUndergraduateSchool] = useState('');
  const [gpa, setGpa] = useState('');
  const [toefl, setToefl] = useState('');
  const [ielts, setIelts] = useState('');
  const [gre, setGre] = useState('');
  const [researchExperience, setResearchExperience] = useState('');
  const [internshipExperience, setInternshipExperience] = useState('');

  // Step 3: Timeline & advice
  const [appliedDate, setAppliedDate] = useState('');
  const [resultDate, setResultDate] = useState('');
  const [advice, setAdvice] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/auth/login?redirect=/community/report');
      } else {
        setUser(data.user);
      }
      setLoading(false);
    });
  }, [router]);

  const filteredSchools = schoolSearch
    ? seedSchools.filter(
        (s) =>
          s.name.includes(schoolSearch) ||
          s.name_en.toLowerCase().includes(schoolSearch.toLowerCase())
      ).slice(0, 6)
    : seedSchools.slice(0, 6);

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (s === 1) {
      if (!schoolName.trim()) newErrors.schoolName = '请选择或输入院校名称';
      if (!major.trim()) newErrors.major = '请输入专业';
      if (!degree) newErrors.degree = '请选择学位';
      if (!result) newErrors.result = '请选择录取结果';
    }

    if (s === 2) {
      if (!gpa.trim()) newErrors.gpa = '请输入GPA';
    }

    if (s === 3) {
      // Advice, appliedDate, resultDate are optional
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 3));
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    setErrors({});
  };

  const handleSubmit = () => {
    if (!validateStep(3)) return;
    if (!user) return;

    setSubmitting(true);

    const newReport: AdmissionReport = {
      id: generateId(),
      user_id: user.id,
      school_id: '',
      major: major.trim(),
      degree,
      result: result as 'admitted' | 'rejected' | 'waitlisted',
      undergraduate_school: undergraduateSchool.trim() || null,
      gpa: gpa.trim() || null,
      toefl: toefl ? parseFloat(toefl) : null,
      ielts: ielts.trim() || null,
      gre: gre.trim() || null,
      research_experience: researchExperience.trim() || null,
      internship_experience: internshipExperience.trim() || null,
      applied_date: appliedDate || null,
      result_date: resultDate || null,
      advice: advice.trim() || null,
      is_anonymous: isAnonymous,
      created_at: new Date().toISOString(),
      school: (() => { const found = seedSchools.find((s) => s.name === schoolName); return found ? { ...found, id: '', created_at: new Date().toISOString() } : undefined; })(),
      profile: isAnonymous ? null : {
        id: user.id,
        email: user.email ?? '',
        display_name: user.user_metadata?.display_name ?? null,
        avatar_url: null,
        education_bg: null,
        language_scores: null,
        created_at: '',
      },
    };

    // Save to localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('abroad-sync-community-reports');
      const existing: AdmissionReport[] = stored ? JSON.parse(stored) : [];
      existing.unshift(newReport);
      localStorage.setItem('abroad-sync-community-reports', JSON.stringify(existing));
    }

    toast.success('录取汇报已提交！');
    setSubmitting(false);
    router.push('/community');
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500">加载中...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <button
        onClick={() => router.push('/community')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        返回社区
      </button>

      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-2">分享录取结果</h1>
      <p className="text-sm text-gray-500 mb-8">分享你的申请经验，帮助更多申请者</p>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((s, idx) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                step > s.num
                  ? 'bg-green-500 text-white'
                  : step === s.num
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > s.num ? <Check className="h-4 w-4" /> : s.num}
            </div>
            <span
              className={`text-sm ${
                step === s.num ? 'text-blue-600 font-semibold' : 'text-gray-400'
              }`}
            >
              {s.label}
            </span>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-8 h-0.5 ${
                  step > s.num ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {/* ====== STEP 1: SCHOOL INFO ====== */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  院校名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="搜索或输入院校名称..."
                  value={schoolSearch}
                  onChange={(e) => {
                    setSchoolSearch(e.target.value);
                    setSchoolName(e.target.value);
                  }}
                />
                {schoolSearch && filteredSchools.length > 0 && (
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    {filteredSchools.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 border-b last:border-b-0"
                        onClick={() => {
                          setSchoolName(s.name);
                          setSchoolSearch(s.name);
                        }}
                      >
                        <span className="font-medium">{s.name}</span>
                        <span className="text-gray-400 ml-2">{s.name_en}</span>
                      </button>
                    ))}
                  </div>
                )}
                {errors.schoolName && (
                  <p className="text-xs text-red-500">{errors.schoolName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  专业 <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="如：计算机科学"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                />
                {errors.major && (
                  <p className="text-xs text-red-500">{errors.major}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  学位 <span className="text-red-500">*</span>
                </Label>
                <Select value={degree} onValueChange={(v) => { if (v !== null) setDegree(v); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择学位" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEGREES.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.degree && (
                  <p className="text-xs text-red-500">{errors.degree}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  录取结果 <span className="text-red-500">*</span>
                </Label>
                <Select value={result} onValueChange={(v) => { if (v !== null) setResult(v); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择结果" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESULT_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.result && (
                  <p className="text-xs text-red-500">{errors.result}</p>
                )}
              </div>
            </div>
          )}

          {/* ====== STEP 2: BACKGROUND ====== */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>本科院校</Label>
                <Input
                  placeholder="如：北京大学"
                  value={undergraduateSchool}
                  onChange={(e) => setUndergraduateSchool(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  GPA <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="如：3.8/4.0"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                />
                {errors.gpa && (
                  <p className="text-xs text-red-500">{errors.gpa}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>TOEFL</Label>
                  <Input
                    placeholder="如：100"
                    type="number"
                    value={toefl}
                    onChange={(e) => setToefl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>IELTS</Label>
                  <Input
                    placeholder="如：7.0"
                    value={ielts}
                    onChange={(e) => setIelts(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>GRE</Label>
                <Input
                  placeholder="如：320 (V:156 Q:164)"
                  value={gre}
                  onChange={(e) => setGre(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>科研经历</Label>
                <Textarea
                  placeholder="描述你的科研经历..."
                  rows={3}
                  value={researchExperience}
                  onChange={(e) => setResearchExperience(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>实习经历</Label>
                <Textarea
                  placeholder="描述你的实习经历..."
                  rows={3}
                  value={internshipExperience}
                  onChange={(e) => setInternshipExperience(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ====== STEP 3: TIMELINE & ADVICE ====== */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>申请时间</Label>
                  <Input
                    type="date"
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>出结果时间</Label>
                  <Input
                    type="date"
                    value={resultDate}
                    onChange={(e) => setResultDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>一句话建议</Label>
                <Textarea
                  placeholder="给后来者的一句话建议（最多300字）..."
                  rows={4}
                  maxLength={300}
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                />
                <p className="text-xs text-gray-400 text-right">{advice.length}/300</p>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Checkbox
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(checked === true)}
                />
                <Label htmlFor="anonymous" className="text-sm text-gray-600 cursor-pointer">
                  匿名发布（不显示用户名）
                </Label>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button
              variant="outline"
              onClick={step === 1 ? () => router.push('/community') : handleBack}
            >
              {step === 1 ? '取消' : '上一步'}
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext}>
                下一步
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? '提交中...' : '提交汇报'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
