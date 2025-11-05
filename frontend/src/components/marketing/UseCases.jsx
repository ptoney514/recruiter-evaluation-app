import { Building2, Briefcase, Cpu } from 'lucide-react'

export function UseCases() {
  const personas = [
    {
      icon: Building2,
      title: 'Corporate Recruiter',
      description: 'Hiring for multiple roles, 100+ applications per posting.',
      outcome: 'Shortlists in minutes, consistent scoring.'
    },
    {
      icon: Briefcase,
      title: 'Recruiting Agency',
      description: 'Manage candidates across 5+ clients simultaneously.',
      outcome: 'Shareable reports, faster client alignment.'
    },
    {
      icon: Cpu,
      title: 'Hiring Manager',
      description: 'Tech startup screening engineers quickly.',
      outcome: 'Interview the best candidates faster.'
    }
  ]

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Built for real recruiting workflows
          </h2>
          <p className="mt-3 text-slate-600">
            Choose your path and see how Evala fits your day-to-day.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map((persona) => {
            const Icon = persona.icon
            return (
              <div key={persona.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-lg font-medium tracking-tight">{persona.title}</h3>
                </div>
                <p className="mt-2 text-sm text-slate-600">{persona.description}</p>
                <p className="mt-2 text-sm text-slate-700">
                  <span className="text-slate-500">Outcome:</span> {persona.outcome}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
