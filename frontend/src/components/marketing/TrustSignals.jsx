import { ShieldCheck, Lock, Cpu } from 'lucide-react'

export function TrustSignals() {
  const signals = [
    {
      icon: ShieldCheck,
      title: 'Security',
      description: 'SOC 2-ready practices, data encrypted at rest and in transit.'
    },
    {
      icon: Lock,
      title: 'Privacy',
      description: 'Your resumes stay private. Optional deletion after 30 days upon request.'
    },
    {
      icon: Cpu,
      title: 'Technology',
      description: 'Powered by Claude 3.5 Haiku and Supabase for reliable performance.'
    }
  ]

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {signals.map((signal) => {
            const Icon = signal.icon
            return (
              <div key={signal.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-lg font-medium tracking-tight">{signal.title}</h3>
                </div>
                <p className="mt-2 text-sm text-slate-600">{signal.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
