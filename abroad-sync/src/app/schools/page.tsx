'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SchoolCard } from '@/components/schools/SchoolCard';
import { getSchoolsWithIds } from '@/lib/seed-schools';
import { COUNTRIES, DEGREES } from '@/types';
import { Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import type { School } from '@/types';

const schools = getSchoolsWithIds();

type SortKey = 'ranking' | 'rating' | 'name';

function getAvgRating(s: School): number {
  if (
    s.avg_academic_reputation != null &&
    s.avg_employment_prospect != null &&
    s.avg_campus_environment != null &&
    s.avg_living_cost != null &&
    s.avg_safety != null
  ) {
    return (
      (s.avg_academic_reputation +
        s.avg_employment_prospect +
        s.avg_campus_environment +
        s.avg_living_cost +
        s.avg_safety) /
      5
    );
  }
  return 0;
}

export default function SchoolsPage() {
  const [search, setSearch] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedDegree, setSelectedDegree] = useState<string>('');
  const [rankingMax, setRankingMax] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortKey>('ranking');
  const [showFilters, setShowFilters] = useState(false);

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    );
  };

  const clearFilters = () => {
    setSelectedCountries([]);
    setSelectedDegree('');
    setRankingMax('');
    setSearch('');
  };

  const hasActiveFilters =
    selectedCountries.length > 0 || selectedDegree !== '' || rankingMax !== '';

  const filtered = useMemo(() => {
    let result = [...schools];

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.name_en.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q)
      );
    }

    // Country filter
    if (selectedCountries.length > 0) {
      result = result.filter((s) => selectedCountries.includes(s.country));
    }

    // Ranking filter
    if (rankingMax) {
      const max = parseInt(rankingMax, 10);
      if (!isNaN(max)) {
        result = result.filter((s) => s.ranking != null && s.ranking <= max);
      }
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'ranking':
          return (a.ranking ?? 999) - (b.ranking ?? 999);
        case 'rating':
          return getAvgRating(b) - getAvgRating(a);
        case 'name':
          return a.name.localeCompare(b.name, 'zh-CN');
        default:
          return 0;
      }
    });

    return result;
  }, [search, selectedCountries, rankingMax, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">院校库</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          浏览全球顶尖院校信息，查看真实学长评价，找到最适合你的梦校
        </p>
      </div>

      {/* Search and controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="搜索学校名称、英文名或国家..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy((v as SortKey) || 'ranking')}
          >
            <SelectTrigger className="w-36">
              <ArrowUpDown className="mr-1 size-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ranking">按排名</SelectItem>
              <SelectItem value="rating">按评分</SelectItem>
              <SelectItem value="name">按名称</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="筛选"
          >
            <SlidersHorizontal className="size-4" />
          </Button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <Card className="mb-6 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">筛选条件</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 size-3" />
                清除全部
              </Button>
            )}
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Country filter */}
            <div>
              <Label className="mb-2 block text-xs font-medium text-muted-foreground">
                国家/地区
              </Label>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES.map((country) => (
                  <label
                    key={country}
                    className="inline-flex cursor-pointer items-center gap-1.5"
                  >
                    <Checkbox
                      checked={selectedCountries.includes(country)}
                      onCheckedChange={() => toggleCountry(country)}
                    />
                    <span className="text-xs">{country}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Degree filter */}
            <div>
              <Label className="mb-2 block text-xs font-medium text-muted-foreground">
                学位
              </Label>
              <div className="flex flex-wrap gap-2">
                {DEGREES.map((degree) => (
                  <label
                    key={degree}
                    className="inline-flex cursor-pointer items-center gap-1.5"
                  >
                    <Checkbox
                      checked={selectedDegree === degree}
                      onCheckedChange={() =>
                        setSelectedDegree(selectedDegree === degree ? '' : degree)
                      }
                    />
                    <span className="text-xs">{degree}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Ranking range */}
            <div>
              <Label className="mb-2 block text-xs font-medium text-muted-foreground">
                排名范围
              </Label>
              <Select value={rankingMax} onValueChange={(v) => setRankingMax(v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="不限" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">不限</SelectItem>
                  <SelectItem value="10">QS 前10</SelectItem>
                  <SelectItem value="20">QS 前20</SelectItem>
                  <SelectItem value="30">QS 前30</SelectItem>
                  <SelectItem value="50">QS 前50</SelectItem>
                  <SelectItem value="100">QS 前100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">当前筛选:</span>
          {selectedCountries.map((c) => (
            <Badge key={c} variant="secondary" className="text-xs">
              {c}
              <button
                className="ml-1 hover:text-foreground"
                onClick={() => toggleCountry(c)}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          {selectedDegree && (
            <Badge variant="secondary" className="text-xs">
              {selectedDegree}
              <button
                className="ml-1 hover:text-foreground"
                onClick={() => setSelectedDegree('')}
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
          {rankingMax && (
            <Badge variant="secondary" className="text-xs">
              QS 前{rankingMax}
              <button
                className="ml-1 hover:text-foreground"
                onClick={() => setRankingMax('')}
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="mb-4 text-sm text-muted-foreground">
        共 {filtered.length} 所院校
      </p>

      {/* School grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">未找到匹配的院校</p>
          <Button variant="link" size="sm" onClick={clearFilters} className="mt-1">
            清除筛选条件
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      )}
    </div>
  );
}
