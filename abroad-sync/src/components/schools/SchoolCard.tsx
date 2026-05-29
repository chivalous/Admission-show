'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin } from 'lucide-react';
import type { School } from '@/types';

const COUNTRY_BADGE_COLORS: Record<string, string> = {
  '美国': 'bg-blue-100 text-blue-700 border-blue-200',
  '英国': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  '加拿大': 'bg-red-100 text-red-700 border-red-200',
  '澳大利亚': 'bg-amber-100 text-amber-700 border-amber-200',
  '新加坡': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '香港': 'bg-orange-100 text-orange-700 border-orange-200',
  '欧洲大陆': 'bg-purple-100 text-purple-700 border-purple-200',
  '日本': 'bg-pink-100 text-pink-700 border-pink-200',
};

function getCountryBadge(country: string) {
  return COUNTRY_BADGE_COLORS[country] ?? 'bg-gray-100 text-gray-700 border-gray-200';
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'md' ? 'size-4' : 'size-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

export function SchoolCard({ school }: { school: School }) {
  const avgRating =
    school.avg_academic_reputation != null &&
    school.avg_employment_prospect != null &&
    school.avg_campus_environment != null &&
    school.avg_living_cost != null &&
    school.avg_safety != null
      ? (school.avg_academic_reputation +
          school.avg_employment_prospect +
          school.avg_campus_environment +
          school.avg_living_cost +
          school.avg_safety) /
        5
      : null;

  return (
    <Link href={`/schools/${school.id}`} className="group block">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-3 p-4">
          {/* Top row: country badge + ranking */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={getCountryBadge(school.country)}>
              <MapPin className="mr-1 size-3" />
              {school.country}
            </Badge>
            {school.ranking != null && (
              <span className="text-xs font-medium text-muted-foreground">
                QS #{school.ranking}
              </span>
            )}
          </div>

          {/* School name */}
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
              {school.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {school.name_en}
            </p>
          </div>

          {/* Rating */}
          {avgRating != null && (
            <div className="flex items-center gap-1.5">
              <StarRating rating={avgRating} />
              <span className="text-xs font-medium text-amber-600">
                {avgRating.toFixed(1)}
              </span>
              {school.rating_count != null && school.rating_count > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({school.rating_count})
                </span>
              )}
            </div>
          )}

          {/* Requirements summary */}
          {school.requirements && (
            <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
              {school.requirements.gpa_min && (
                <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0.5">
                  GPA {school.requirements.gpa_min}
                </span>
              )}
              {school.requirements.toefl_min != null && (
                <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0.5">
                  TOEFL {school.requirements.toefl_min}+
                </span>
              )}
              {school.requirements.ielts_min != null && (
                <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0.5">
                  IELTS {school.requirements.ielts_min}+
                </span>
              )}
            </div>
          )}

          {/* Tuition */}
          {school.tuition && (
            <p className="text-xs text-muted-foreground truncate">
              {school.tuition}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
