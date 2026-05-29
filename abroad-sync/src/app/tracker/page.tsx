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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Table2, Columns3, CalendarDays, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { EntryStatus, TrackerEntry } from '@/types';
import { ENTRY_STATUS_LABELS, ENTRY_STATUS_COLORS, COUNTRIES, DEGREES } from '@/types';

interface LocalTrackerEntry {
  id: string;
  schoolId: string;
  schoolName: string;
  major: string;
  status: EntryStatus;
  deadline: string;
  notes: string;
  createdAt: string;
}

const KANBAN_STATUSES: EntryStatus[] = ['planning', 'writing', 'submitted', 'reviewing', 'admitted', 'rejected', 'waitlisted'];

const STORAGE_KEY = 'abroad-sync-tracker-entries';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function TrackerPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LocalTrackerEntry[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [formSchool, setFormSchool] = useState('');
  const [formMajor, setFormMajor] = useState('');
  const [formStatus, setFormStatus] = useState<EntryStatus>('planning');
  const [formDeadline, setFormDeadline] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [schoolSearch, setSchoolSearch] = useState('');

  const [activeTab, setActiveTab] = useState('table');
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/auth/login?redirect=/tracker');
      } else {
        setUser(data.user);
      }
      setLoading(false);
    });
  }, [router]);

  // Load entries from localStorage keyed by user ID
  useEffect(() => {
    if (!user) return;
    const key = `${STORAGE_KEY}-${user.id}`;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key);
      if (stored) {
        setEntries(JSON.parse(stored));
      }
    }
  }, [user]);

  // Save entries to localStorage
  useEffect(() => {
    if (!user) return;
    const key = `${STORAGE_KEY}-${user.id}`;
    localStorage.setItem(key, JSON.stringify(entries));
  }, [entries, user]);

  const filteredSchools = schoolSearch
    ? seedSchools.filter(
        (s) =>
          s.name.includes(schoolSearch) ||
          s.name_en.toLowerCase().includes(schoolSearch.toLowerCase())
      ).slice(0, 6)
    : seedSchools.slice(0, 6);

  const resetForm = () => {
    setFormSchool('');
    setFormMajor('');
    setFormStatus('planning');
    setFormDeadline('');
    setFormNotes('');
    setSchoolSearch('');
    setEditId(null);
  };

  const handleSave = () => {
    if (!formSchool.trim()) {
      toast.error('请输入院校名称');
      return;
    }
    if (!formMajor.trim()) {
      toast.error('请输入专业');
      return;
    }

    if (editId) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === editId
            ? { ...e, schoolName: formSchool, major: formMajor, status: formStatus, deadline: formDeadline, notes: formNotes }
            : e
        )
      );
      toast.success('已更新');
    } else {
      const newEntry: LocalTrackerEntry = {
        id: generateId(),
        schoolId: '',
        schoolName: formSchool,
        major: formMajor,
        status: formStatus,
        deadline: formDeadline,
        notes: formNotes,
        createdAt: new Date().toISOString(),
      };
      setEntries((prev) => [...prev, newEntry]);
      toast.success('已添加学校');
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (entry: LocalTrackerEntry) => {
    setEditId(entry.id);
    setFormSchool(entry.schoolName);
    setFormMajor(entry.major);
    setFormStatus(entry.status);
    setFormDeadline(entry.deadline);
    setFormNotes(entry.notes);
    setSchoolSearch(entry.schoolName);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast.success('已删除');
  };

  const handleStatusChange = (id: string, newStatus: EntryStatus) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    );
    toast.success(`状态已更新为「${ENTRY_STATUS_LABELS[newStatus]}」`);
  };

  // Calendar helpers
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
  const monthLabel = `${calendarYear}年${calendarMonth + 1}月`;

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const getEntriesForDay = (day: number) => {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return entries.filter((e) => e.deadline === dateStr);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500">加载中...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">申请追踪</h1>
          <p className="mt-1 text-sm text-gray-500">管理你的留学申请进度</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              添加学校
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editId ? '编辑学校' : '添加学校'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* School search */}
              <div className="space-y-2">
                <Label>院校名称 *</Label>
                <Input
                  placeholder="搜索或输入院校名称..."
                  value={schoolSearch}
                  onChange={(e) => {
                    setSchoolSearch(e.target.value);
                    setFormSchool(e.target.value);
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
                          setFormSchool(s.name);
                          setSchoolSearch(s.name);
                        }}
                      >
                        <span className="font-medium">{s.name}</span>
                        <span className="text-gray-400 ml-2">{s.name_en}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>专业 *</Label>
                <Input
                  placeholder="如：计算机科学"
                  value={formMajor}
                  onChange={(e) => setFormMajor(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>申请状态</Label>
                <Select value={formStatus} onValueChange={(v) => { if (v) setFormStatus(v as EntryStatus); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KANBAN_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {ENTRY_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>截止日期</Label>
                <Input
                  type="date"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>备注</Label>
                <Textarea
                  placeholder="备注信息..."
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  取消
                </Button>
                <Button onClick={handleSave}>
                  {editId ? '保存修改' : '添加'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="table" className="gap-2">
            <Table2 className="h-4 w-4" />
            表格
          </TabsTrigger>
          <TabsTrigger value="kanban" className="gap-2">
            <Columns3 className="h-4 w-4" />
            看板
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            日历
          </TabsTrigger>
        </TabsList>

        {/* ====== TABLE VIEW ====== */}
        <TabsContent value="table">
          {entries.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">还没有添加任何学校</p>
              <p className="text-sm mt-1">点击「添加学校」开始追踪你的申请进度</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableCaption>共 {entries.length} 所学校</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>院校名称</TableHead>
                    <TableHead>专业</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>截止日期</TableHead>
                    <TableHead>备注</TableHead>
                    <TableHead className="w-[80px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleEdit(entry)}
                    >
                      <TableCell className="font-medium">{entry.schoolName}</TableCell>
                      <TableCell>{entry.major}</TableCell>
                      <TableCell>
                        <Badge className={`${ENTRY_STATUS_COLORS[entry.status]} border-0`} variant="secondary">
                          {ENTRY_STATUS_LABELS[entry.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {entry.deadline || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 max-w-[200px] truncate">
                        {entry.notes || '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(entry.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ====== KANBAN VIEW ====== */}
        <TabsContent value="kanban">
          {entries.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">还没有添加任何学校</p>
              <p className="text-sm mt-1">点击「添加学校」开始追踪你的申请进度</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {KANBAN_STATUSES.map((status) => {
                const statusEntries = entries.filter((e) => e.status === status);
                return (
                  <div key={status} className="bg-gray-50 rounded-lg p-3 min-h-[200px]">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center justify-between">
                      <span>{ENTRY_STATUS_LABELS[status]}</span>
                      <span className="text-xs text-gray-400">{statusEntries.length}</span>
                    </h3>
                    <div className="space-y-2">
                      {statusEntries.map((entry) => (
                        <Card key={entry.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-3">
                            <p className="text-sm font-medium">{entry.schoolName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{entry.major}</p>
                            {entry.deadline && (
                              <p className="text-xs text-gray-400 mt-1">截止: {entry.deadline}</p>
                            )}
                            <div className="flex items-center justify-between mt-2 pt-2 border-t">
                              <Select
                                value={entry.status}
                                onValueChange={(v) => { if (v) handleStatusChange(entry.id, v as EntryStatus); }}
                              >
                                <SelectTrigger className="h-7 text-xs w-[110px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {KANBAN_STATUSES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                      {ENTRY_STATUS_LABELS[s]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleEdit(entry)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleDelete(entry.id)}
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ====== CALENDAR VIEW ====== */}
        <TabsContent value="calendar">
          <div className="max-w-2xl mx-auto">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold">{monthLabel}</h3>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for offset */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square rounded-lg bg-gray-50/50" />
              ))}
              {/* Day cells */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const dayEntries = getEntriesForDay(day);
                const isToday =
                  day === new Date().getDate() &&
                  calendarMonth === new Date().getMonth() &&
                  calendarYear === new Date().getFullYear();
                const isWeekend =
                  (firstDayOfWeek + day - 1) % 7 === 0 || (firstDayOfWeek + day - 1) % 7 === 6;

                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-lg border p-1.5 overflow-hidden ${
                      isToday ? 'border-blue-400 bg-blue-50' : 'border-gray-100'
                    } ${isWeekend ? 'bg-gray-50/50' : ''}`}
                  >
                    <span className={`text-xs font-medium ${isToday ? 'text-blue-600' : ''}`}>
                      {day}
                    </span>
                    {dayEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className={`mt-0.5 text-[10px] px-1 py-0.5 rounded truncate ${ENTRY_STATUS_COLORS[entry.status]}`}
                        title={`${entry.schoolName} - ${entry.major}`}
                      >
                        {entry.schoolName}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Upcoming deadlines */}
            {entries.filter((e) => e.deadline).length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">近期截止日期</h3>
                <div className="space-y-2">
                  {entries
                    .filter((e) => e.deadline)
                    .sort((a, b) => a.deadline.localeCompare(b.deadline))
                    .slice(0, 8)
                    .map((entry) => {
                      const isPast = entry.deadline < new Date().toISOString().split('T')[0];
                      return (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{entry.schoolName}</span>
                            <span className="text-xs text-gray-400">{entry.major}</span>
                          </div>
                          <span className={`text-sm ${isPast ? 'text-red-500 line-through' : 'text-orange-600 font-semibold'}`}>
                            {entry.deadline}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
