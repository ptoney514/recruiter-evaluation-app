import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Pricing() {
  return (
    <section id="pricing" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Simple pricing
          </h2>
          <p className="mt-3 text-slate-600">
            Start free. Upgrade when you're ready to scale AI evaluations across roles.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Tier */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight">Free</h3>
              <span className="text-xs rounded-full bg-indigo-600/10 text-indigo-700 px-2 py-0.5">
                Best to start
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Unlimited keyword-based ranking (regex matching).
            </p>
            <div className="mt-4">
              <span className="text-3xl font-semibold tracking-tight">$0</span>
              <span className="text-sm text-slate-500">/ forever</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                50 resumes/run
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                Keyword coverage & scores
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                CSV export
              </li>
            </ul>
            <Link
              to="/signup"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm text-white hover:bg-slate-800"
            >
              Start Free — No Credit Card
            </Link>
          </div>

          {/* AI Tier */}
          <div className="rounded-2xl border border-fuchsia-200 bg-gradient-to-b from-white to-fuchsia-50 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight">AI Evaluations</h3>
              <span className="text-xs rounded-full bg-fuchsia-600/10 text-fuchsia-700 px-2 py-0.5">
                Pay as you go
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Claude 3.5 Haiku evaluations with structured scoring and summaries.
            </p>
            <div className="mt-4">
              <span className="text-3xl font-semibold tracking-tight">$0.01</span>
              <span className="text-sm text-slate-500">/ candidate (Haiku)</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-fuchsia-600 mt-0.5 flex-shrink-0" />
                Qualifications, Experience, Risk Flags
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-fuchsia-600 mt-0.5 flex-shrink-0" />
                Interview guide generation
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-fuchsia-600 mt-0.5 flex-shrink-0" />
                PDF reports & ATS sync
              </li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Also available: $0.05/candidate (GPT‑4o).
            </p>
            <Link
              to="/signup"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-fuchsia-600 px-4 py-2.5 text-sm text-white hover:bg-fuchsia-500"
            >
              Upgrade
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
