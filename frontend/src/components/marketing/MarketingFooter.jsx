import { Sparkles } from 'lucide-react'

export function MarketingFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="pb-10 pt-10 border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-tr from-indigo-600 to-fuchsia-600 flex items-center justify-center text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">Evala</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
            <a href="#features" className="text-slate-600 hover:text-slate-900">
              Features
            </a>
            <a href="#framework" className="text-slate-600 hover:text-slate-900">
              Framework
            </a>
            <a href="#pricing" className="text-slate-600 hover:text-slate-900">
              Pricing
            </a>
            <a href="#faq" className="text-slate-600 hover:text-slate-900">
              FAQ
            </a>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            © {currentYear} Evala, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-900">
              Privacy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-slate-900">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
