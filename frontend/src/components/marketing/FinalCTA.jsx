import { Rocket, PlayCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export function FinalCTA() {
  return (
    <section id="cta" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-tr from-indigo-50 via-white to-fuchsia-50 p-8 sm:p-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-3xl font-semibold tracking-tight">
                Ready to Save 10+ Hours per Week?
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                14-day trial, no credit card required, cancel anytime.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-3 text-sm text-white hover:bg-slate-800"
              >
                <Rocket className="h-4 w-4" />
                Start Free Trial
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm text-slate-900 hover:bg-slate-50"
              >
                <PlayCircle className="h-4 w-4" />
                Watch demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
