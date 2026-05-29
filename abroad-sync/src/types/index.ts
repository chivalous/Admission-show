// ====== 用户 & 档案 ======

export interface EducationBackground {
  school?: string;
  major?: string;
  gpa?: string;
  degree?: string;
}

export interface LanguageScores {
  toefl?: number;
  ielts?: number;
  gre?: string;
  gmat?: string;
}

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  education_bg: EducationBackground | null;
  language_scores: LanguageScores | null;
  created_at: string;
}

// ====== CV 评估 ======

export interface DimensionScore {
  dimension: string;
  label: string;
  score: number; // 0-100
  comment: string;
}

export interface AssessmentIssue {
  dimension: string;
  level: '高' | '中' | '低';
  suggestion: string;
}

export interface AssessmentSuggestion {
  priority: '高' | '中' | '低';
  action: string;
}

export interface CVAssessment {
  id: string;
  user_id: string;
  target_country: string;
  target_degree: string;
  target_major: string;
  cv_file_url: string | null;
  cv_text: string;
  overall_score: number;
  dimension_scores: DimensionScore[];
  highlights: string[];
  issues: AssessmentIssue[];
  suggestions: AssessmentSuggestion[];
  created_at: string;
}

// ====== 院校 ======

export interface SchoolRequirements {
  gpa_min?: string;
  toefl_min?: number;
  ielts_min?: number;
  gre?: string;
}

export interface School {
  id: string;
  name: string;
  name_en: string;
  country: string;
  ranking: number | null;
  website: string | null;
  description: string | null;
  requirements: SchoolRequirements | null;
  tuition: string | null;
  application_deadline: string | null;
  logo_url: string | null;
  avg_academic_reputation?: number;
  avg_employment_prospect?: number;
  avg_campus_environment?: number;
  avg_living_cost?: number;
  avg_safety?: number;
  recommend_ratio?: number;
  rating_count?: number;
  created_at: string;
}

export interface SchoolRating {
  id: string;
  school_id: string;
  user_id: string;
  academic_reputation: number;
  employment_prospect: number;
  campus_environment: number;
  living_cost: number;
  safety: number;
  overall_recommend: boolean;
  comment: string | null;
  created_at: string;
}

// ====== 申请追踪 ======

export type EntryStatus = 'planning' | 'writing' | 'submitted' | 'reviewing' | 'admitted' | 'rejected' | 'waitlisted';

export interface TrackerTable {
  id: string;
  user_id: string;
  name: string;
  country: string | null;
  degree: string | null;
  created_at: string;
}

export interface TrackerEntry {
  id: string;
  table_id: string;
  school_id: string;
  status: EntryStatus;
  deadline: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  school?: School;
}

// ====== 录取汇报 ======

export interface AdmissionReport {
  id: string;
  user_id: string;
  school_id: string;
  major: string;
  degree: string;
  result: 'admitted' | 'rejected' | 'waitlisted';
  undergraduate_school: string | null;
  gpa: string | null;
  toefl: number | null;
  ielts: string | null;
  gre: string | null;
  research_experience: string | null;
  internship_experience: string | null;
  applied_date: string | null;
  result_date: string | null;
  advice: string | null;
  is_anonymous: boolean;
  created_at: string;
  school?: School;
  profile?: Profile | null;
}

// ====== 常量 ======

export const COUNTRIES = ['美国', '英国', '加拿大', '澳大利亚', '新加坡', '香港', '欧洲大陆', '日本'] as const;

export const DEGREES = ['本科', '硕士', '博士'] as const;

export const ENTRY_STATUS_LABELS: Record<EntryStatus, string> = {
  planning: '准备中',
  writing: '文书写作',
  submitted: '已提交',
  reviewing: '审理中',
  admitted: '已录取',
  rejected: '已拒录',
  waitlisted: '等候名单',
};

export const ENTRY_STATUS_COLORS: Record<EntryStatus, string> = {
  planning: 'bg-gray-100 text-gray-700',
  writing: 'bg-blue-100 text-blue-700',
  submitted: 'bg-yellow-100 text-yellow-700',
  reviewing: 'bg-purple-100 text-purple-700',
  admitted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  waitlisted: 'bg-orange-100 text-orange-700',
};

export const RESULT_COLORS: Record<string, string> = {
  admitted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  waitlisted: 'bg-orange-100 text-orange-700',
};

// ====== 经验帖 ======

export interface ExperiencePost {
  id: string;
  user_id: string;
  title: string;
  content: string; // HTML content from TipTap
  excerpt: string; // plain text preview
  tags: string[]; // e.g. ['美国', 'CS', '硕士']
  cover_image: string | null;
  is_pinned: boolean;
  view_count: number;
  like_count: number;
  collect_count: number;
  created_at: string;
  updated_at: string;
  author?: { display_name: string; avatar_url: string | null };
}

export interface Group {
  id: string;
  name: string;
  description: string;
  icon: string;
  member_count: number;
  post_count: number;
  category: 'school' | 'season' | 'major' | 'country'; // 院校小组 | 申请季小组 | 专业小组 | 国家小组
  created_at: string;
}

// ====== 问答社区 ======

export interface Question {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  answer_count: number;
  accepted_answer_id: string | null;
  view_count: number;
  created_at: string;
  author?: { display_name: string; avatar_url: string | null };
}

export interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  upvotes: number;
  is_accepted: boolean;
  created_at: string;
  author?: { display_name: string; avatar_url: string | null };
}

// ====== 标签常量 ======

export const TAG_CATEGORIES = {
  country: ['美国', '英国', '加拿大', '澳大利亚', '新加坡', '香港', '欧洲大陆', '日本'] as readonly string[],
  degree: ['本科', '硕士', '博士'] as readonly string[],
  major: ['计算机科学', '数据科学', '电子工程', '机械工程', '经济学', '商科', '数学', '物理', '化学', '生物', '法学', '医学', '艺术', '其他'] as readonly string[],
  topic: ['选校定位', '语言备考', '文书写作', '套磁面试', '签证办理', '行前准备', '学习生活', '其他'] as readonly string[],
} as const;
