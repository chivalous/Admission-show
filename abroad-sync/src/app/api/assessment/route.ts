import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { chatJSON } from '@/lib/deepseek';

interface AssessmentRequest {
  cvText: string;
  targetCountry: string;
  targetDegree: string;
  targetMajor: string;
}

interface DimensionScoreResponse {
  dimension: string;
  label: string;
  score: number;
  comment: string;
}

interface AssessmentIssueResponse {
  dimension: string;
  level: '高' | '中' | '低';
  suggestion: string;
}

interface AssessmentSuggestionResponse {
  priority: '高' | '中' | '低';
  action: string;
}

interface AssessmentResponse {
  overall_score: number;
  dimension_scores: DimensionScoreResponse[];
  highlights: string[];
  issues: AssessmentIssueResponse[];
  suggestions: AssessmentSuggestionResponse[];
}

const SYSTEM_PROMPT = `You are an experienced study-abroad admissions consultant with 15+ years of experience evaluating student applications. Your task is to evaluate a student's CV/resume and assess their competitiveness for their target program.

## Evaluation Context
You will receive the student's CV text and their target country, degree level, and major. Evaluate the CV specifically in the context of that target program. Different countries and degree levels have different expectations.

## Dimensions to Evaluate (each scored 0-100)

1. **academic (学术背景)**: Quality of undergraduate institution, GPA, relevant coursework, academic honors/awards. For PhD applicants, weight this more heavily.
2. **research (科研经历)**: Research projects, publications, lab experience, patents, conference presentations. Critical for PhD, important for master's, bonus for undergraduate.
3. **internship (实习经历)**: Professional work experience, internships relevant to the major, industry exposure. Important for master's/undergraduate, bonus for PhD.
4. **language (语言成绩)**: Language proficiency (TOEFL/IELTS), standardized test scores (GRE/GMAT). Different countries have different expectations.
5. **overall (综合竞争力)**: Overall profile strength considering target country, degree, and major competitiveness.

## Overall Score Weighting
- For 本科 (Undergraduate): academic 35%, language 25%, internship 15%, research 10%, overall_holistic 15%
- For 硕士 (Master's): academic 25%, research 20%, internship 25%, language 15%, overall_holistic 15%
- For 博士 (PhD): academic 20%, research 40%, internship 5%, language 15%, overall_holistic 20%

Calculate overall_score as a properly weighted integer 0-100.

## Important Guidelines
- Be honest and constructive. Don't inflate scores.
- Provide specific, actionable suggestions.
- If the CV doesn't mention something (e.g., no language scores), score that dimension lower and note it as an issue.
- For highlights, identify 3-5 genuine strengths. If the CV is weak, note even modest strengths.
- Issues should reference specific gaps or weaknesses in the CV.
- Suggestions should be ordered by priority and be concrete actions the student can take.
- Return Chinese text for all labels, comments, highlights, suggestions, and actions.

## Output Format

Return ONLY a JSON object (no markdown, no code blocks) with this exact structure:

{
  "overall_score": 75,
  "dimension_scores": [
    {"dimension": "academic", "label": "学术背景", "score": 80, "comment": "GPA 3.7, 211院校背景，课程匹配度高"},
    {"dimension": "research", "label": "科研经历", "score": 60, "comment": "有一段实验室经历但无发表论文"},
    {"dimension": "internship", "label": "实习经历", "score": 70, "comment": "有一段相关实习但时间较短"},
    {"dimension": "language", "label": "语言成绩", "score": 65, "comment": "TOEFL 95，达到基本要求但不够竞争力"},
    {"dimension": "overall", "label": "综合竞争力", "score": 72, "comment": "整体背景匹配，科研和标化成绩有提升空间"}
  ],
  "highlights": ["GPA较高，学术基础扎实", "有目标专业相关科研经历", "实习与申请方向高度相关"],
  "issues": [
    {"dimension": "research", "level": "中", "suggestion": "科研经历缺少论文产出，建议尝试投稿或参与更深度项目"},
    {"dimension": "language", "level": "高", "suggestion": "TOEFL 95偏低，建议刷分至100+以增强竞争力"}
  ],
  "suggestions": [
    {"priority": "高", "action": "提升语言成绩至100(TOEFL)或7.0(IELTS)以上，对申请至关重要"},
    {"priority": "高", "action": "补充一段与目标专业高度相关的科研项目或实习"},
    {"priority": "中", "action": "优化CV排版和表达，突出量化成果和项目影响力"},
    {"priority": "中", "action": "提前联系目标院校导师，了解研究方向匹配度"},
    {"priority": "低", "action": "参与学术会议或竞赛，丰富学术背景"}
  ]
}`;

function buildUserPrompt(cvText: string, targetCountry: string, targetDegree: string, targetMajor: string): string {
  return `请评估以下学生的 CV，评估其申请 **${targetCountry}** 的 **${targetDegree}** 项目（专业方向：**${targetMajor}**）的竞争力。

## 学生 CV 内容

${cvText}

---

请按照系统提示中的要求，给出完整的 JSON 评估报告。`;
}

export async function POST(request: NextRequest) {
  try {
    const body: AssessmentRequest = await request.json();

    if (!body.cvText || !body.targetCountry || !body.targetDegree || !body.targetMajor) {
      return NextResponse.json(
        { error: '缺少必要参数：cvText, targetCountry, targetDegree, targetMajor' },
        { status: 400 }
      );
    }

    if (body.cvText.trim().length < 50) {
      return NextResponse.json(
        { error: 'CV 内容过短，请至少提供 50 个字符的内容' },
        { status: 400 }
      );
    }

    // Call DeepSeek for evaluation
    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: buildUserPrompt(body.cvText, body.targetCountry, body.targetDegree, body.targetMajor) },
    ];

    const result = await chatJSON<AssessmentResponse>(messages, {
      temperature: 0.3,
      max_tokens: 4096,
    });

    // Validate response structure
    if (
      typeof result.overall_score !== 'number' ||
      !Array.isArray(result.dimension_scores) ||
      !Array.isArray(result.highlights) ||
      !Array.isArray(result.issues) ||
      !Array.isArray(result.suggestions)
    ) {
      throw new Error('AI 返回数据格式不正确，请重试');
    }

    // Normalize overall score
    const overallScore = Math.max(0, Math.min(100, Math.round(result.overall_score)));

    // Normalize dimension scores
    const dimensionScores = result.dimension_scores.map((d) => ({
      dimension: d.dimension,
      label: d.label,
      score: Math.max(0, Math.min(100, Math.round(d.score))),
      comment: d.comment,
    }));

    // If user is logged in, save to Supabase
    let savedId: string | null = null;
    try {
      const supabase = await createServerSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: saved, error: saveError } = await supabase
          .from('cv_assessments')
          .insert({
            user_id: user.id,
            target_country: body.targetCountry,
            target_degree: body.targetDegree,
            target_major: body.targetMajor,
            cv_text: body.cvText,
            overall_score: overallScore,
            dimension_scores: dimensionScores,
            highlights: result.highlights,
            issues: result.issues,
            suggestions: result.suggestions,
          })
          .select('id')
          .single();

        if (saveError) {
          console.error('Failed to save assessment:', saveError);
        } else if (saved) {
          savedId = saved.id;
        }
      }
    } catch (err) {
      // Non-critical error: log but don't fail the request
      console.error('Error saving assessment:', err);
    }

    return NextResponse.json({
      success: true,
      saved_id: savedId,
      data: {
        overall_score: overallScore,
        dimension_scores: dimensionScores,
        highlights: result.highlights,
        issues: result.issues,
        suggestions: result.suggestions,
      },
    });
  } catch (error) {
    console.error('Assessment error:', error);
    const message =
      error instanceof Error ? error.message : '评估服务暂时不可用，请稍后重试';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
