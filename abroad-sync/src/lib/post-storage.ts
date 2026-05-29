'use client';

import type { ExperiencePost, Group } from '@/types';

const POSTS_KEY = 'abroad_posts';
const GROUPS_KEY = 'abroad_groups';

function generateId(): string {
  return `post-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ====== 经验帖 CRUD ======

export function getPosts(): ExperiencePost[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(POSTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getPost(id: string): ExperiencePost | null {
  const posts = getPosts();
  return posts.find((p) => p.id === id) ?? null;
}

export function createPost(
  post: Omit<ExperiencePost, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'collect_count'>
): ExperiencePost {
  const posts = getPosts();
  const now = new Date().toISOString();
  const newPost: ExperiencePost = {
    ...post,
    id: generateId(),
    view_count: 0,
    like_count: 0,
    collect_count: 0,
    created_at: now,
    updated_at: now,
  };
  posts.unshift(newPost);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    } catch { /* quota exceeded */ }
  }
  return newPost;
}

export function updatePost(
  id: string,
  data: Partial<Pick<ExperiencePost, 'title' | 'content' | 'excerpt' | 'tags' | 'cover_image' | 'is_pinned' | 'view_count' | 'like_count' | 'collect_count'>>
): ExperiencePost | null {
  const posts = getPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  posts[index] = { ...posts[index], ...data, updated_at: new Date().toISOString() };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    } catch { /* quota exceeded */ }
  }
  return posts[index];
}

export function deletePost(id: string): boolean {
  const posts = getPosts();
  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length === posts.length) return false;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(POSTS_KEY, JSON.stringify(filtered));
    } catch { /* quota exceeded */ }
  }
  return true;
}

// ====== 圈子 (Groups) ======

export const SEED_GROUPS: Group[] = [
  {
    id: 'grp-1',
    name: '美国留学圈',
    description: '赴美留学申请经验、选校策略、签证攻略交流',
    icon: '🇺🇸',
    member_count: 3280,
    post_count: 156,
    category: 'country',
    created_at: '2025-06-01T00:00:00Z',
  },
  {
    id: 'grp-2',
    name: '英国留学圈',
    description: '英国G5及罗素集团院校申请交流',
    icon: '🇬🇧',
    member_count: 2450,
    post_count: 98,
    category: 'country',
    created_at: '2025-06-01T00:00:00Z',
  },
  {
    id: 'grp-3',
    name: 'CS申请互助组',
    description: '计算机科学及相关专业申请经验分享',
    icon: '💻',
    member_count: 5100,
    post_count: 234,
    category: 'major',
    created_at: '2025-06-15T00:00:00Z',
  },
  {
    id: 'grp-4',
    name: '商科申请联盟',
    description: '金融、会计、管理、市场营销等商科申请交流',
    icon: '📊',
    member_count: 3890,
    post_count: 187,
    category: 'major',
    created_at: '2025-06-15T00:00:00Z',
  },
  {
    id: 'grp-5',
    name: '2026 Fall 申请季',
    description: '2026年秋季入学申请战友聚集地',
    icon: '🎓',
    member_count: 6200,
    post_count: 412,
    category: 'season',
    created_at: '2025-08-01T00:00:00Z',
  },
  {
    id: 'grp-6',
    name: '2027 Spring/Fall',
    description: '2027年入学申请规划与准备',
    icon: '📅',
    member_count: 1800,
    post_count: 67,
    category: 'season',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'grp-7',
    name: '常春藤联盟',
    description: '常春藤院校申请专题讨论',
    icon: '🏛️',
    member_count: 4500,
    post_count: 203,
    category: 'school',
    created_at: '2025-07-01T00:00:00Z',
  },
  {
    id: 'grp-8',
    name: '港新名校圈',
    description: '香港、新加坡名校申请攻略与经验交流',
    icon: '🇭🇰',
    member_count: 2100,
    post_count: 89,
    category: 'country',
    created_at: '2025-09-01T00:00:00Z',
  },
  {
    id: 'grp-9',
    name: '欧陆留学圈',
    description: '德国、法国、荷兰、瑞士等欧洲大陆国家留学',
    icon: '🇪🇺',
    member_count: 1560,
    post_count: 72,
    category: 'country',
    created_at: '2025-10-01T00:00:00Z',
  },
  {
    id: 'grp-10',
    name: 'G5超级精英大学',
    description: '牛津、剑桥、帝国理工、LSE、UCL申请交流',
    icon: '🎯',
    member_count: 3400,
    post_count: 145,
    category: 'school',
    created_at: '2025-08-15T00:00:00Z',
  },
];

export function getGroups(): Group[] {
  if (typeof window === 'undefined') return SEED_GROUPS;
  try {
    const stored = localStorage.getItem(GROUPS_KEY);
    if (stored) return JSON.parse(stored);
    // Initialize with seed data on first access
    localStorage.setItem(GROUPS_KEY, JSON.stringify(SEED_GROUPS));
    return SEED_GROUPS;
  } catch {
    return SEED_GROUPS;
  }
}

export function getGroup(id: string): Group | null {
  const groups = getGroups();
  return groups.find((g) => g.id === id) ?? null;
}

// ====== 小组成员管理 ======

export function joinGroup(groupId: string, userId: string): void {
  if (typeof window === 'undefined') return;
  const key = `abroad_group_members_${groupId}`;
  try {
    const members: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    if (!members.includes(userId)) {
      members.push(userId);
      localStorage.setItem(key, JSON.stringify(members));
    }
  } catch { /* noop */ }
}

export function leaveGroup(groupId: string, userId: string): void {
  if (typeof window === 'undefined') return;
  const key = `abroad_group_members_${groupId}`;
  try {
    const members: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify(members.filter((id) => id !== userId)));
  } catch { /* noop */ }
}

export function isGroupMember(groupId: string, userId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const key = `abroad_group_members_${groupId}`;
    const members: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    return members.includes(userId);
  } catch {
    return false;
  }
}

export function getGroupMemberCount(groupId: string): number {
  if (typeof window === 'undefined') return 0;
  const key = `abroad_group_members_${groupId}`;
  try {
    const members: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    const group = getGroup(groupId);
    return (group?.member_count ?? 0) + members.length;
  } catch {
    return 0;
  }
}

// ====== 问答 Q&A ======

import type { Question, Answer } from '@/types';

const QUESTIONS_KEY = 'abroad_questions';
const ANSWERS_KEY = 'abroad_answers';

export function getQuestions(): Question[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(QUESTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getQuestion(id: string): Question | null {
  return getQuestions().find((q) => q.id === id) ?? null;
}

export function createQuestion(
  data: Omit<Question, 'id' | 'answer_count' | 'accepted_answer_id' | 'view_count' | 'created_at'>
): Question {
  const questions = getQuestions();
  const now = new Date().toISOString();
  const newQuestion: Question = {
    ...data,
    id: generateId(),
    answer_count: 0,
    accepted_answer_id: null,
    view_count: 0,
    created_at: now,
  };
  questions.unshift(newQuestion);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
    } catch { /* noop */ }
  }
  return newQuestion;
}

export function incrementQuestionView(id: string): void {
  if (typeof window === 'undefined') return;
  const questions = getQuestions();
  const idx = questions.findIndex((q) => q.id === id);
  if (idx >= 0) {
    questions[idx].view_count += 1;
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
  }
}

export function incrementQuestionAnswerCount(id: string): void {
  if (typeof window === 'undefined') return;
  const questions = getQuestions();
  const idx = questions.findIndex((q) => q.id === id);
  if (idx >= 0) {
    questions[idx].answer_count += 1;
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
  }
}

// ====== Answers ======

export function getAnswers(questionId: string): Answer[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(ANSWERS_KEY);
    const all: Answer[] = stored ? JSON.parse(stored) : [];
    return all.filter((a) => a.question_id === questionId);
  } catch {
    return [];
  }
}

export function createAnswer(
  data: Omit<Answer, 'id' | 'upvotes' | 'is_accepted' | 'created_at'>
): Answer {
  const key = ANSWERS_KEY;
  const stored = localStorage.getItem(key);
  const all: Answer[] = stored ? JSON.parse(stored) : [];
  const newAnswer: Answer = {
    ...data,
    id: generateId(),
    upvotes: 0,
    is_accepted: false,
    created_at: new Date().toISOString(),
  };
  all.push(newAnswer);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(all));
    } catch { /* noop */ }
  }
  return newAnswer;
}

export function upvoteAnswer(answerId: string, userId: string): void {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(ANSWERS_KEY);
  const all: Answer[] = stored ? JSON.parse(stored) : [];
  const answer = all.find((a) => a.id === answerId);
  if (!answer) return;

  const voteKey = `abroad_answer_votes_${answerId}`;
  const votesRaw = localStorage.getItem(voteKey);
  const votes: Record<string, 'up' | 'down'> = votesRaw ? JSON.parse(votesRaw) : {};
  const prevVote = votes[userId];

  if (prevVote === 'up') {
    delete votes[userId];
    answer.upvotes = Math.max(0, answer.upvotes - 1);
  } else {
    votes[userId] = 'up';
    answer.upvotes += (prevVote === 'down' ? 2 : 1);
  }
  localStorage.setItem(voteKey, JSON.stringify(votes));
  const idx = all.findIndex((a) => a.id === answerId);
  if (idx >= 0) all[idx] = answer;
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(all));
}

export function downvoteAnswer(answerId: string, userId: string): void {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(ANSWERS_KEY);
  const all: Answer[] = stored ? JSON.parse(stored) : [];
  const answer = all.find((a) => a.id === answerId);
  if (!answer) return;

  const voteKey = `abroad_answer_votes_${answerId}`;
  const votesRaw = localStorage.getItem(voteKey);
  const votes: Record<string, 'up' | 'down'> = votesRaw ? JSON.parse(votesRaw) : {};
  const prevVote = votes[userId];

  if (prevVote === 'down') {
    delete votes[userId];
    answer.upvotes += 1;
  } else {
    votes[userId] = 'down';
    answer.upvotes -= (prevVote === 'up' ? 2 : 1);
  }
  localStorage.setItem(voteKey, JSON.stringify(votes));
  const idx = all.findIndex((a) => a.id === answerId);
  if (idx >= 0) all[idx] = answer;
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(all));
}

export function getUserVoteForAnswer(answerId: string, userId: string): 'up' | 'down' | null {
  if (typeof window === 'undefined') return null;
  const voteKey = `abroad_answer_votes_${answerId}`;
  const votesRaw = localStorage.getItem(voteKey);
  if (!votesRaw) return null;
  try {
    const votes: Record<string, 'up' | 'down'> = JSON.parse(votesRaw);
    return votes[userId] || null;
  } catch {
    return null;
  }
}

export function acceptAnswer(questionId: string, answerId: string): void {
  if (typeof window === 'undefined') return;
  // Update question's accepted_answer_id
  const questions = getQuestions();
  const qIdx = questions.findIndex((q) => q.id === questionId);
  if (qIdx >= 0) {
    questions[qIdx].accepted_answer_id = answerId;
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
  }
  // Mark answer as accepted
  const stored = localStorage.getItem(ANSWERS_KEY);
  const all: Answer[] = stored ? JSON.parse(stored) : [];
  // Un-accept any previously accepted answer for this question
  all.forEach((a) => {
    if (a.question_id === questionId) a.is_accepted = false;
  });
  const aIdx = all.findIndex((a) => a.id === answerId);
  if (aIdx >= 0) {
    all[aIdx].is_accepted = true;
  }
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(all));
}

export { generateId };
