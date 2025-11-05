import { Timer, SearchX, Slash, HelpCircle, WandSparkles, UploadCloud, Zap, Bot, Clock4 } from 'lucide-react'

export function ProblemStatement() {
  return (
    <section className="py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* The Problem */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-amber-600" />
              <h3 className="text-xl font-semibold tracking-tight">The manual process is broken</h3>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="flex gap-2">
                <Timer className="h-4 w-4 mt-0.5 text-slate-500 flex-shrink-0" />
                Screening 50 resumes manually takes 4+ hours
              </li>
              <li className="flex gap-2">
                <SearchX className="h-4 w-4 mt-0.5 text-slate-500 flex-shrink-0" />
                You miss great candidates buried in the pile
              </li>
              <li className="flex gap-2">
                <Slash className="h-4 w-4 mt-0.5 text-slate-500 flex-shrink-0" />
                Keyword searches are unreliable and biased
              </li>
              <li className="flex gap-2">
                <HelpCircle className="h-4 w-4 mt-0.5 text-slate-500 flex-shrink-0" />
                You need a smarter way to prioritize who to interview
              </li>
            </ul>
          </div>

          {/* The Solution */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <WandSparkles className="h-5 w-5 text-indigo-600" />
              <h3 className="text-xl font-semibold tracking-tight">Evala makes screening effortless</h3>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="flex gap-2">
                <UploadCloud className="h-4 w-4 mt-0.5 text-slate-500 flex-shrink-0" />
                Batch upload 1–50 PDFs/DOCX — automatic parsing
              </li>
              <li className="flex gap-2">
                <Zap className="h-4 w-4 mt-0.5 text-slate-500 flex-shrink-0" />
                Instant keyword ranking (free)
              </li>
              <li className="flex gap-2">
                <Bot className="h-4 w-4 mt-0.5 text-slate-500 flex-shrink-0" />
                AI evaluation with Claude 3.5 Haiku for top candidates
              </li>
              <li className="flex gap-2">
                <Clock4 className="h-4 w-4 mt-0.5 text-slate-500 flex-shrink-0" />
                50 resumes → ~10 minutes, interview the best faster
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
