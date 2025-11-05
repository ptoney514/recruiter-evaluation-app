export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Upload Resumes',
      description: 'Drag & drop 1–50 PDFs or DOCX files. We parse titles, skills, and experience automatically.'
    },
    {
      number: 2,
      title: 'Define Job Requirements',
      description: 'Set must-have skills and preferred qualifications. Keep your criteria front-and-center.'
    },
    {
      number: 3,
      title: 'Get Ranked Results',
      description: 'See instant keyword matches or upgrade for AI evaluations of the top candidates.'
    }
  ]

  return (
    <section id="how" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white">
                <span className="text-xs">{step.number}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
