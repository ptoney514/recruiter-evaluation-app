import { CheckCircle2, UploadCloud, Zap, BrainCircuit, ListChecks, Download, MonitorSmartphone, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'

export function FeaturesOverview() {
  return (
    <section id="features" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            What makes this different
          </h2>
          <p className="mt-3 text-slate-600">
            Start free with instant keyword ranking. Upgrade when you want AI evaluations powered by Claude 3.5 Haiku.
          </p>
        </div>

        {/* Two Flavor Cards: Free vs Pro */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free: Keyword Match */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                Keyword Match
              </h3>
              <span className="text-xs rounded-full bg-indigo-600/10 text-indigo-700 px-2 py-0.5">
                Free
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Instantly scores resumes against the job description and extracts top keywords, years of experience, and required skills coverage.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-indigo-600 flex-shrink-0" />
                Bulk upload 50 files at once
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-indigo-600 flex-shrink-0" />
                Keyword coverage & match score
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-indigo-600 flex-shrink-0" />
                Export CSV shortlists
              </li>
            </ul>
            <Link
              to="/signup"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              Try it free
            </Link>
          </div>

          {/* Pro: AI-Powered */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                AI-Powered Analysis
              </h3>
              <span className="text-xs rounded-full bg-fuchsia-600/10 text-fuchsia-700 px-2 py-0.5">
                Pro
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Structured evaluations with competency scoring, experience alignment, risk flags, and clear rationales—ready to share with hiring managers.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-fuchsia-600 flex-shrink-0" />
                Two-stage evaluation framework
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-fuchsia-600 flex-shrink-0" />
                Bias-aware, criteria-based scoring
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-fuchsia-600 flex-shrink-0" />
                Candidate summaries & interview prompts
              </li>
            </ul>
            <a
              href="#pricing"
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 hover:bg-slate-50"
            >
              <CreditCard className="h-4 w-4" />
              See pricing
            </a>
          </div>
        </div>

        {/* 6 Feature Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-indigo-600" />
              <h4 className="text-base font-medium tracking-tight">Batch Upload & Parse</h4>
            </div>
            <ul className="mt-2 text-sm text-slate-700 space-y-1">
              <li>Upload 1–50 resumes at once (PDF, DOCX)</li>
              <li>Automatic text extraction — no manual entry</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-600" />
              <h4 className="text-base font-medium tracking-tight">Instant Keyword Ranking (Free)</h4>
            </div>
            <ul className="mt-2 text-sm text-slate-700 space-y-1">
              <li>Regex-based matching against requirements</li>
              <li>Ranked list in seconds, zero AI cost</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-fuchsia-600" />
              <h4 className="text-base font-medium tracking-tight">AI-Powered Evaluation (Paid)</h4>
            </div>
            <ul className="mt-2 text-sm text-slate-700 space-y-1">
              <li>Claude 3.5 Haiku evaluates top candidates</li>
              <li>Scores: Qualifications, Experience, Risk Flags</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-indigo-600" />
              <h4 className="text-base font-medium tracking-tight">Interview Guide Generation</h4>
            </div>
            <ul className="mt-2 text-sm text-slate-700 space-y-1">
              <li>AI creates custom questions</li>
              <li>Based on each candidate's background</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-indigo-600" />
              <h4 className="text-base font-medium tracking-tight">Export to PDF</h4>
            </div>
            <ul className="mt-2 text-sm text-slate-700 space-y-1">
              <li>Professional evaluation reports</li>
              <li>Share with hiring managers instantly</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <MonitorSmartphone className="h-5 w-5 text-indigo-600" />
              <h4 className="text-base font-medium tracking-tight">Multi-Device Access</h4>
            </div>
            <ul className="mt-2 text-sm text-slate-700 space-y-1">
              <li>Web + iOS (coming soon)</li>
              <li>Access your evaluations anywhere</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
