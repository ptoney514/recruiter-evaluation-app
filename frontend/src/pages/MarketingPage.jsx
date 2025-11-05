import { UploadCloud } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MarketingHeader } from '../components/marketing/MarketingHeader'
import { HeroSection } from '../components/marketing/HeroSection'
import { ProblemStatement } from '../components/marketing/ProblemStatement'
import { LogoSection } from '../components/marketing/LogoSection'
import { FeaturesOverview } from '../components/marketing/FeaturesOverview'
import { HowItWorks } from '../components/marketing/HowItWorks'
import { Framework } from '../components/marketing/Framework'
import { UseCases } from '../components/marketing/UseCases'
import { Testimonials } from '../components/marketing/Testimonials'
import { TrustSignals } from '../components/marketing/TrustSignals'
import { Pricing } from '../components/marketing/Pricing'
import { FAQ } from '../components/marketing/FAQ'
import { FinalCTA } from '../components/marketing/FinalCTA'
import { MarketingFooter } from '../components/marketing/MarketingFooter'

export function MarketingPage() {
  return (
    <div className="min-h-full bg-white text-slate-900">
      {/* Background Accents */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-8rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-200 via-fuchsia-200 to-cyan-200 blur-3xl opacity-50"></div>
        <div className="absolute right-[-10rem] bottom-[-8rem] h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-indigo-100 via-purple-200 to-pink-100 blur-3xl opacity-60"></div>
      </div>

      {/* Header */}
      <MarketingHeader />

      {/* Main Content */}
      <main>
        <HeroSection />
        <ProblemStatement />
        <LogoSection />
        <FeaturesOverview />
        <HowItWorks />
        <Framework />
        <UseCases />
        <Testimonials />
        <TrustSignals />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>

      {/* Footer */}
      <MarketingFooter />

      {/* Floating Action Button */}
      <Link
        to="/signup"
        className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm text-white shadow-lg hover:bg-slate-800 transition-all hover:scale-105"
      >
        <UploadCloud className="h-4 w-4" />
        Get started
      </Link>
    </div>
  )
}
