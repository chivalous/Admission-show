import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, BookOpen, ListTodo, Users } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "CV 智能评估",
    desc: "上传 CV，AI 多维度分析竞争力，给出具体提升建议。30 秒出报告。",
    href: "/assessment",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: BookOpen,
    title: "院校百科",
    desc: "200+ 热门院校详细信息，真实学长学姐打分，录取案例参考。",
    href: "/schools",
    color: "text-green-600 bg-green-50",
  },
  {
    icon: ListTodo,
    title: "申请追踪",
    desc: "表格/看板/日历三视图管理申请进度，截止日自动提醒。",
    href: "/tracker",
    color: "text-purple-600 bg-purple-50",
  },
  {
    icon: Users,
    title: "录取汇报社区",
    desc: "结构化表单 3 分钟分享录取结果，查看同背景学长申请案例。",
    href: "/community",
    color: "text-orange-600 bg-orange-50",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-1.5">
            MVP 内测中 · 全部功能免费
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            留学申请，
            <span className="text-blue-600">一步到位</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 sm:text-xl">
            从 CV 竞争力评估、院校数据查询，到申请进度追踪、录取经验分享——
            覆盖留学申请全流程的综合平台。
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/assessment">
              <Button size="lg" className="text-lg px-8 py-6">
                免费评估 CV
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/schools">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                浏览院校库
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            无需注册即可使用 CV 评估 · 30 秒出报告
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            四大核心功能
          </h2>
          <p className="mt-4 text-center text-gray-500">
            覆盖留学申请从准备到录取的每个关键环节
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Link key={f.title} href={f.href}>
                <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`inline-flex rounded-lg p-3 ${f.color}`}>
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm text-gray-500">{f.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Social proof */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { label: "覆盖院校", value: "200+" },
              { label: "录取案例", value: "500+" },
              { label: "院校评价", value: "1,200+" },
              { label: "全部免费", value: "¥0" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-blue-600 sm:text-4xl">{s.value}</p>
                <p className="mt-1 text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            三步开始申请
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "评估你的 CV",
                desc: "上传简历，AI 给你打分并指出短板。知道哪里需要提升，比盲目准备更高效。",
              },
              {
                step: "2",
                title: "选定目标院校",
                desc: "浏览院校详情、真实评分和录取案例，确定冲刺/匹配/保底三档。",
              },
              {
                step: "3",
                title: "追踪申请进度",
                desc: "用表格管理所有申请，截止日前自动提醒，不再错过任何重要节点。",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            准备好开始你的申请了吗？
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            免费评估 CV，明确提升方向。
          </p>
          <Link href="/assessment" className="mt-8 inline-block">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              立即免费评估
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
