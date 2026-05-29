import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

interface RatingRequest {
  school_id: string;
  academic_reputation: number;
  employment_prospect: number;
  campus_environment: number;
  living_cost: number;
  safety: number;
  overall_recommend: boolean;
  comment: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    // Require authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body: RatingRequest = await request.json();

    // Validate required fields
    const { school_id, academic_reputation, employment_prospect, campus_environment, living_cost, safety, overall_recommend } = body;
    if (!school_id) {
      return NextResponse.json({ error: '缺少 school_id' }, { status: 400 });
    }

    // Validate scores are in 1-5 range
    const scores = [academic_reputation, employment_prospect, campus_environment, living_cost, safety];
    for (const score of scores) {
      if (typeof score !== 'number' || score < 1 || score > 5) {
        return NextResponse.json({ error: '评分必须在 1-5 之间' }, { status: 400 });
      }
    }

    if (typeof overall_recommend !== 'boolean') {
      return NextResponse.json({ error: '请选择是否推荐' }, { status: 400 });
    }

    // Upsert: check if user already rated this school
    const { data: existing } = await supabase
      .from('school_ratings')
      .select('id')
      .eq('school_id', school_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      // Update existing rating
      const { error: updateError } = await supabase
        .from('school_ratings')
        .update({
          academic_reputation,
          employment_prospect,
          campus_environment,
          living_cost,
          safety,
          overall_recommend,
          comment: body.comment,
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Failed to update rating:', updateError);
        return NextResponse.json({ error: '更新评价失败' }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: 'updated' });
    }

    // Insert new rating
    const { error: insertError } = await supabase
      .from('school_ratings')
      .insert({
        school_id,
        user_id: user.id,
        academic_reputation,
        employment_prospect,
        campus_environment,
        living_cost,
        safety,
        overall_recommend,
        comment: body.comment,
      });

    if (insertError) {
      console.error('Failed to insert rating:', insertError);
      return NextResponse.json({ error: '提交评价失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, action: 'created' });
  } catch (error) {
    console.error('Rating POST error:', error);
    const message = error instanceof Error ? error.message : '服务器错误，请稍后重试';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    // Require authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('school_id');

    if (!schoolId) {
      return NextResponse.json({ error: '缺少 school_id 参数' }, { status: 400 });
    }

    // Get all ratings for this school
    const { data: ratings, error } = await supabase
      .from('school_ratings')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch ratings:', error);
      return NextResponse.json({ error: '获取评价失败' }, { status: 500 });
    }

    return NextResponse.json({ ratings: ratings ?? [] });
  } catch (error) {
    console.error('Rating GET error:', error);
    const message = error instanceof Error ? error.message : '服务器错误，请稍后重试';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
