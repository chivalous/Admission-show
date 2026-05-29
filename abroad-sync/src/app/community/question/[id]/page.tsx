'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowBigUp,
  ArrowBigDown,
  CheckCircle2,
  MessageCircle,
  Eye,
  Clock,
  User as UserIcon,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { Question, Answer } from '@/types';
import {
  getQuestion,
  getAnswers,
  createAnswer,
  upvoteAnswer,
  downvoteAnswer,
  getUserVoteForAnswer,
  acceptAnswer,
  incrementQuestionView,
  incrementQuestionAnswerCount,
} from '@/lib/post-storage';

export default function QuestionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.id as string;

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [notFound, setNotFound] = useState(false);

  // Answer form
  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Voting state: answerId -> 'up' | 'down' | null
  const [voteStates, setVoteStates] = useState<Record<string, 'up' | 'down' | null>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setAuthUser(data.user ?? null);
      setLoading(false);
    });
  }, []);

  // Load question and answers
  useEffect(() => {
    if (loading) return;
    const q = getQuestion(questionId);
    if (!q) {
      setNotFound(true);
      return;
    }
    setQuestion(q);
    incrementQuestionView(questionId);

    // Refresh question to get updated view_count
    const updated = getQuestion(questionId);
    if (updated) setQuestion(updated);

    const ans = getAnswers(questionId);
    setAnswers(ans);

    // Load vote states if user is logged in
    if (authUser) {
      const states: Record<string, 'up' | 'down' | null> = {};
      ans.forEach((a) => {
        states[a.id] = getUserVoteForAnswer(a.id, authUser.id);
      });
      setVoteStates(states);
    }
  }, [loading, questionId, authUser]);

  const handleSubmitAnswer = async () => {
    if (!answerContent.trim()) {
      toast.error('请输入回答内容');
      return;
    }
    if (!authUser) {
      toast.error('请先登录');
      router.push(`/auth/login?redirect=/community/question/${questionId}`);
      return;
    }

    setSubmitting(true);
    try {
      const newAnswer = createAnswer({
        question_id: questionId,
        user_id: authUser.id,
        content: answerContent.trim(),
        author: {
          display_name: authUser.email?.split('@')[0] || '匿名用户',
          avatar_url: null,
        },
      });
      incrementQuestionAnswerCount(questionId);
      setAnswers((prev) => [...prev, newAnswer]);
      setAnswerContent('');
      toast.success('回答已发布');
    } catch {
      toast.error('发布失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = (answerId: string) => {
    if (!authUser) {
      toast.error('请先登录');
      router.push(`/auth/login?redirect=/community/question/${questionId}`);
      return;
    }
    upvoteAnswer(answerId, authUser.id);
    setAnswers(getAnswers(questionId));
    setVoteStates((prev) => ({
      ...prev,
      [answerId]: getUserVoteForAnswer(answerId, authUser.id),
    }));
  };

  const handleDownvote = (answerId: string) => {
    if (!authUser) {
      toast.error('请先登录');
      router.push(`/auth/login?redirect=/community/question/${questionId}`);
      return;
    }
    downvoteAnswer(answerId, authUser.id);
    setAnswers(getAnswers(questionId));
    setVoteStates((prev) => ({
      ...prev,
      [answerId]: getUserVoteForAnswer(answerId, authUser.id),
    }));
  };

  const handleAccept = (answerId: string) => {
    acceptAnswer(questionId, answerId);
    setAnswers(getAnswers(questionId));
    // Refresh question to get updated accepted_answer_id
    const updated = getQuestion(questionId);
    if (updated) setQuestion(updated);
    toast.success('已采纳该回答');
  };

  const isQuestionAuthor = authUser && question && authUser.id === question.user_id;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Sort answers: accepted first, then by upvotes
  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.is_accepted && !b.is_accepted) return -1;
    if (!a.is_accepted && b.is_accepted) return 1;
    return b.upvotes - a.upvotes;
  });

  // ====== Loading State ======
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-4 w-20 mb-6" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-6" />
        <div className="space-y-4 mt-8">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  // ====== Not Found State ======
  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <MessageCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">问题不存在</h2>
        <p className="text-gray-400 mb-6">该问题可能已被删除或链接无效</p>
        <Link href="/community">
          <Button>返回社区</Button>
        </Link>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link
        href="/community"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        返回社区
      </Link>

      {/* Question */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              {question.author?.display_name || '匿名用户'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDate(question.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {question.view_count} 次浏览
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {question.answer_count} 个回答
            </span>
          </div>

          {/* Tags */}
          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator className="my-4" />

          {/* Content */}
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {question.content}
          </div>
        </CardContent>
      </Card>

      {/* Answers section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {answers.length} 个回答
        </h2>

        {answers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MessageCircle className="mx-auto h-12 w-12 mb-4 text-gray-300" />
            <p className="text-lg">还没有人回答</p>
            <p className="text-sm mt-1">快来写下第一个回答吧</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAnswers.map((answer) => (
              <Card
                key={answer.id}
                className={`${
                  answer.is_accepted
                    ? 'border-green-300 bg-green-50/50'
                    : ''
                }`}
              >
                <CardContent className="p-5">
                  {/* Accepted badge */}
                  {answer.is_accepted && (
                    <div className="flex items-center gap-1 text-green-600 text-sm mb-3">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">已采纳</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="text-gray-700 whitespace-pre-wrap mb-4">
                    {answer.content}
                  </div>

                  {/* Bottom row: author, date, votes, accept */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                            {answer.author?.display_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        {answer.author?.display_name || '匿名用户'}
                      </span>
                      <span className="text-xs">
                        {formatDate(answer.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Voting */}
                      <div className="flex items-center gap-1 mr-2">
                        <button
                          onClick={() => handleUpvote(answer.id)}
                          className={`p-1 rounded cursor-pointer transition-colors ${
                            voteStates[answer.id] === 'up'
                              ? 'text-blue-600 bg-blue-50'
                              : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                          title="赞"
                        >
                          <ArrowBigUp className="h-5 w-5" />
                        </button>
                        <span
                          className={`text-sm font-medium min-w-[24px] text-center ${
                            answer.upvotes > 0
                              ? 'text-blue-600'
                              : answer.upvotes < 0
                              ? 'text-red-500'
                              : 'text-gray-500'
                          }`}
                        >
                          {answer.upvotes}
                        </span>
                        <button
                          onClick={() => handleDownvote(answer.id)}
                          className={`p-1 rounded cursor-pointer transition-colors ${
                            voteStates[answer.id] === 'down'
                              ? 'text-red-500 bg-red-50'
                              : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                          }`}
                          title="踩"
                        >
                          <ArrowBigDown className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Accept button (only for question author, if not already accepted) */}
                      {isQuestionAuthor &&
                        !question.accepted_answer_id &&
                        answer.user_id !== authUser?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-300 hover:bg-green-50 cursor-pointer"
                            onClick={() => handleAccept(answer.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            采纳
                          </Button>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Answer form */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">你的回答</h3>
          {authUser ? (
            <div className="space-y-4">
              <Textarea
                placeholder="写下你的回答..."
                rows={5}
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={handleSubmitAnswer} disabled={submitting || !answerContent.trim()}>
                  {submitting ? '提交中...' : '提交回答'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">请登录后回答</p>
              <Link href={`/auth/login?redirect=/community/question/${questionId}`}>
                <Button>登录</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
