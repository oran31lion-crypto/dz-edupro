import { useState } from 'react';
import {
  Brain,
  Upload,
  FileText,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Lightbulb,
  ListChecks,
  BookOpen,
} from 'lucide-react';
import Katex from '@/components/Katex';
import {
  solveHomework,
  generateSmartSummary,
  type SolverSolution,
  type SolverStep,
  type SmartSummary,
} from '@/lib/solver';
import { MONETIZATION_LINK, SUBJECTS, type SubjectKey } from '@/lib/constants';

const SAMPLE = 'f(x) = 2x^2 - 4x + 3';

interface SubjectOption {
  key: SubjectKey | 'auto';
  ar: string;
}

const SUBJECT_OPTIONS: SubjectOption[] = [
  { key: 'auto', ar: 'كشف تلقائي للمادة' },
  ...SUBJECTS.map((s) => ({ key: s.key, ar: s.ar })),
];

export default function HomeworkSolver() {
  const [input, setInput] = useState('');
  const [fileName, setFileName] = useState('');
  const [subjectChoice, setSubjectChoice] = useState<SubjectKey | 'auto'>('auto');
  const [solution, setSolution] = useState<SolverSolution | null>(null);
  const [summary, setSummary] = useState<SmartSummary | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFile = (f: File | null) => {
    if (!f) return;
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setInput((prev) =>
        prev
          ? `${prev}\n[ملف: ${f.name}]\n${text}`.trim()
          : `[ملف: ${f.name}]\n${text}`
      );
    };
    reader.onerror = () => setInput((prev) => `${prev}\n[ملف: ${f.name}]`.trim());
    reader.readAsText(f);
  };

  const solve = () => {
    if (!input.trim()) return;
    setLoading(true);
    setSolution(null);
    setSummary(null);
    setShowSummary(false);
    const forced = subjectChoice === 'auto' ? undefined : subjectChoice;
    setTimeout(() => {
      setSolution(solveHomework(input, forced));
      setLoading(false);
    }, 700);
  };

  const runSummary = () => {
    if (!solution) return;
    setSummarizing(true);
    setSummary(null);
    setShowSummary(true);
    setTimeout(() => {
      setSummary(generateSmartSummary(solution));
      setSummarizing(false);
    }, 600);
  };

  const copySolution = async () => {
    window.open(MONETIZATION_LINK, '_blank', 'noopener,noreferrer');
    if (solution) {
      const text = `${solution.subjectAr} — ${solution.topic}\n\n${solution.summary}\n\n${solution.steps
        .map((s) => `${s.title}\n${s.text ?? ''}\n${s.math ?? ''}`)
        .join('\n\n')}`;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Brain />}
        title="حل الواجبات بالذكاء الاصطناعي"
        subtitle="جميع المواد — حل خطوة بخطوة مع تلخيص ذكي"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              اختيار المادة
            </label>
            <div className="relative">
              <BookOpen
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-neon pointer-events-none"
              />
              <select
                value={subjectChoice}
                onChange={(e) =>
                  setSubjectChoice(e.target.value as SubjectKey | 'auto')
                }
                className="w-full appearance-none bg-navy-800/60 border border-white/10 rounded-xl py-3 pr-10 pl-4 text-white focus:outline-none focus:border-emerald-neon/60 focus:ring-2 focus:ring-emerald-neon/20 transition-all cursor-pointer text-sm"
              >
                {SUBJECT_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key} className="bg-navy-900">
                    {o.ar}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              نص التمرين
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب أو الصق التمرين هنا... مثال: f(x) = 2x^2 - 4x + 3"
              rows={6}
              className="w-full bg-navy-800/60 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-neon/60 focus:ring-2 focus:ring-emerald-neon/20 transition-all resize-none font-mono text-sm leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              أو ارفع ملف التمرين
            </label>
            <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-white/15 hover:border-emerald-neon/50 rounded-xl py-4 px-4 cursor-pointer transition-colors group">
              <Upload
                size={20}
                className="text-gray-400 group-hover:text-emerald-neon transition-colors"
              />
              <span className="text-sm text-gray-400 group-hover:text-emerald-neon transition-colors">
                {fileName || 'رفع ملف (صورة / نص)'}
              </span>
              <input
                type="file"
                accept="image/*,.txt,.pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <button
            onClick={solve}
            disabled={!input.trim() || loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-neon text-navy-950 font-bold py-3 rounded-xl hover:bg-emerald-bright transition-colors shadow-neon-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                جاري الحل...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                احصل على الحل
              </>
            )}
          </button>

          <button
            onClick={() => setInput(SAMPLE)}
            className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-emerald-neon transition-colors"
          >
            <Lightbulb size={14} />
            جرّب مثالاً: {SAMPLE}
          </button>
        </div>

        {/* Solution panel */}
        <div className="glass rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <h3 className="font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-emerald-neon" />
              الحل المفصّل
            </h3>
            <div className="flex items-center gap-2">
              {solution && (
                <button
                  onClick={runSummary}
                  disabled={summarizing}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                    showSummary
                      ? 'bg-emerald-neon text-navy-950 shadow-neon-sm'
                      : 'bg-emerald-neon/15 hover:bg-emerald-neon/25 text-emerald-neon'
                  }`}
                >
                  {summarizing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> جاري التلخيص...
                    </>
                  ) : (
                    <>
                      <ListChecks size={14} /> تلخيص ذكي
                    </>
                  )}
                </button>
              )}
              {solution && (
                <button
                  onClick={copySolution}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-neon/15 hover:bg-emerald-neon/25 text-emerald-neon px-3 py-2 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={14} /> تم النسخ
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> نسخ الحل
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {!solution && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-gray-500">
              <Brain size={48} className="mb-3 opacity-40" />
              <p className="text-sm">
                أدخل تمريناً ثم اضغط "احصل على الحل" لعرض الحل خطوة بخطوة.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 size={40} className="animate-spin text-emerald-neon mb-3" />
              <p className="text-sm">يقوم الذكاء الاصطناعي بتحليل التمرين...</p>
            </div>
          )}

          {solution && !showSummary && (
            <div className="flex-1 space-y-4 overflow-y-auto pr-1 animate-fade-in">
              <div className="p-3 rounded-xl bg-emerald-neon/10 border border-emerald-neon/20">
                <p className="text-xs text-emerald-neon font-semibold mb-1">
                  {solution.subjectAr} — {solution.topic}
                </p>
                <p className="text-sm text-gray-200 leading-relaxed">
                  {solution.summary}
                </p>
              </div>
              {solution.steps.map((step, i) => (
                <StepCard key={i} step={step} />
              ))}
            </div>
          )}

          {solution && showSummary && (
            <div className="flex-1 space-y-4 overflow-y-auto pr-1 animate-fade-in">
              {summarizing ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Loader2 size={36} className="animate-spin text-emerald-neon mb-3" />
                  <p className="text-sm">يتم توليد ملخص مركّز...</p>
                </div>
              ) : summary ? (
                <SummaryCard summary={summary} />
              ) : null}
              <button
                onClick={() => setShowSummary(false)}
                className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-emerald-neon transition-colors pt-2"
              >
                <FileText size={14} /> العودة إلى الحل الكامل
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepCard({ step }: { step: SolverStep }) {
  return (
    <div className="p-4 rounded-xl bg-navy-800/40 border border-white/5 hover:border-emerald-neon/20 transition-colors">
      <h4 className="text-sm font-bold text-emerald-neon mb-2">{step.title}</h4>
      {step.math && (
        <div className="my-2 overflow-x-auto">
          <Katex math={step.math} display />
        </div>
      )}
      {step.text && (
        <p className="text-sm text-gray-300 leading-relaxed mt-2">{step.text}</p>
      )}
      {step.bullets && (
        <ul className="mt-2 space-y-1.5">
          {step.bullets.map((b, i) => (
            <li
              key={i}
              className="text-sm text-gray-300 leading-relaxed flex gap-2"
            >
              <span className="text-emerald-neon mt-0.5 shrink-0">◆</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {step.table && <VariationTable table={step.table} />}
    </div>
  );
}

function VariationTable({ table }: { table: NonNullable<SolverStep['table']> }) {
  return (
    <div className="overflow-x-auto mt-3">
      <Katex
        math={`\\begin{array}{|c|cccccc|c|}\\hline x & & ${table.x
          .map((v) => v)
          .join(' & ')} & \\\\ \\hline f(x) & & ${table.f
          .map((v) => v)
          .join(' & ')} & \\\\ \\hline \\end{array}`}
        display
      />
    </div>
  );
}

function SummaryCard({ summary }: { summary: SmartSummary }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-emerald-neon">
        <ListChecks size={18} />
        <h4 className="text-sm font-bold">تلخيص ذكي</h4>
      </div>
      <ul className="space-y-3">
        {summary.bullets.map((b, i) => (
          <li
            key={i}
            className="flex gap-3 p-3 rounded-xl bg-navy-800/40 border border-emerald-neon/15 animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="flex items-center justify-center shrink-0 w-6 h-6 rounded-lg bg-emerald-neon/15 text-emerald-neon text-xs font-bold">
              {i + 1}
            </span>
            <span className="text-sm text-gray-200 leading-relaxed">{b}</span>
          </li>
        ))}
      </ul>
      <div className="p-4 rounded-xl bg-emerald-neon/10 border border-emerald-neon/25">
        <p className="text-xs text-emerald-neon font-semibold mb-1">
          الخلاصة النهائية
        </p>
        <p className="text-sm text-gray-100 leading-relaxed">
          {summary.finalAnswer}
        </p>
      </div>
    </div>
  );
}

function PageHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-3 rounded-2xl bg-emerald-neon/15 text-emerald-neon shadow-neon-sm">
        {icon}
      </div>
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">{title}</h2>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}
