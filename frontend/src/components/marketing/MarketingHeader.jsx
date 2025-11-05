import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, PlayCircle, Rocket, Menu, X } from 'lucide-react'

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/60 border-b border-slate-200/60">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-tr from-indigo-600 to-fuchsia-600 flex items-center justify-center text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Evala</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-sm text-slate-600 hover:text-slate-900">
              How it works
            </a>
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900">
              Features
            </a>
            <a href="#framework" className="text-sm text-slate-600 hover:text-slate-900">
              Framework
            </a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900">
              Pricing
            </a>
            <a href="#faq" className="text-sm text-slate-600 hover:text-slate-900">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="#how"
              className="hidden sm:inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 hover:bg-slate-50"
            >
              <PlayCircle className="h-4 w-4" />
              Watch demo
            </a>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
            >
              <Rocket className="h-4 w-4" />
              Start Free Trial
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center rounded-md border border-slate-300 bg-white p-2 text-slate-700"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-2">
              <a href="#how" className="text-sm text-slate-700 py-2">
                How it works
              </a>
              <a href="#features" className="text-sm text-slate-700 py-2">
                Features
              </a>
              <a href="#framework" className="text-sm text-slate-700 py-2">
                Framework
              </a>
              <a href="#pricing" className="text-sm text-slate-700 py-2">
                Pricing
              </a>
              <a href="#faq" className="text-sm text-slate-700 py-2">
                FAQ
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
