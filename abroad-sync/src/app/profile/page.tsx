'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { LogOut, FileText, ListTodo, MessageSquareText, Save, User as UserIcon } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { DEGREES } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Education background
  const [eduSchool, setEduSchool] = useState('');
  const [eduMajor, setEduMajor] = useState('');
  const [eduGpa, setEduGpa] = useState('');
  const [eduDegree, setEduDegree] = useState('');

  // Language scores
  const [toefl, setToefl] = useState('');
  const [ielts, setIelts] = useState('');
  const [gre, setGre] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/auth/login?redirect=/profile');
        return;
      }
      setUser(data.user);
      // Load saved profile from localStorage
      const key = `abroad-sync-profile-${data.user.id}`;
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(key);
        if (stored) {
          const profile = JSON.parse(stored);
          setEduSchool(profile.eduSchool || '');
          setEduMajor(profile.eduMajor || '');
          setEduGpa(profile.eduGpa || '');
          setEduDegree(profile.eduDegree || '');
          setToefl(profile.toefl || '');
          setIelts(profile.ielts || '');
          setGre(profile.gre || '');
        }
      }
      setLoading(false);
    });
  }, [router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const profileData = {
      eduSchool,
      eduMajor,
      eduGpa,
      eduDegree,
      toefl,
      ielts,
      gre,
    };

    // Save to localStorage for MVP
    const key = `abroad-sync-profile-${user.id}`;
    localStorage.setItem(key, JSON.stringify(profileData));

    // Also try to update Supabase profiles table
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.display_name ?? user.email?.split('@')[0],
        education_bg: {
          school: eduSchool || null,
          major: eduMajor || null,
          gpa: eduGpa || null,
          degree: eduDegree || null,
        },
        language_scores: {
          toefl: toefl ? parseFloat(toefl) : null,
          ielts: ielts || null,
          gre: gre || null,
        },
        updated_at: new Date().toISOString(),
      });

    if (error) {
      // Local save succeeded even if Supabase fails (table may not exist yet)
      console.warn('Supabase profile update skipped (MVP):', error.message);
    }

    toast.success('档案已保存');
    setSaving(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500">加载中...</p>
      </div>
    );
  }

  if (!user) return null;

  const emailInitial = user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-8">个人中心</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: User Info + Quick Links */}
        <div className="space-y-6">
          {/* User card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                    {emailInitial}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-semibold">
                  {user.user_metadata?.display_name ?? '留学申请者'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              </div>
              <Separator className="my-4" />
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </Button>
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">快捷入口</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/profile/assessments" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  我的评估历史
                </Button>
              </Link>
              <Link href="/tracker" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  <ListTodo className="mr-2 h-4 w-4" />
                  申请追踪
                </Button>
              </Link>
              <Link href="/community" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  <MessageSquareText className="mr-2 h-4 w-4" />
                  我的录取汇报
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: 留学档案 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                留学档案
              </CardTitle>
              <CardDescription>完善你的教育背景和语言成绩，帮助 AI 更精准评估</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Education Background */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">教育背景</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>本科院校</Label>
                    <Input
                      placeholder="如：北京大学"
                      value={eduSchool}
                      onChange={(e) => setEduSchool(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>专业</Label>
                    <Input
                      placeholder="如：计算机科学"
                      value={eduMajor}
                      onChange={(e) => setEduMajor(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>学位</Label>
                    <Select value={eduDegree} onValueChange={(v) => { if (v !== null) setEduDegree(v); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择学位" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEGREES.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>GPA</Label>
                    <Input
                      placeholder="如：3.8/4.0"
                      value={eduGpa}
                      onChange={(e) => setEduGpa(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Language Scores */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">语言成绩</h3>
                <div className="grid gap-4 sm:grid-cols-3">
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
                  <div className="space-y-2">
                    <Label>GRE</Label>
                    <Input
                      placeholder="如：320"
                      value={gre}
                      onChange={(e) => setGre(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Save button */}
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? '保存中...' : '保存档案'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
