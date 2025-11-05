export function Testimonials() {
  const testimonials = [
    {
      quote: 'We screened 42 resumes for a PM role in under 15 minutes. The AI summaries made manager alignment trivial.',
      author: 'Recruiting Lead',
      company: 'Growth-stage SaaS',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=80&auto=format&fit=crop'
    },
    {
      quote: 'The two-stage workflow reduced bias and kept our criteria front-and-center. Exported shortlist to our ATS seamlessly.',
      author: 'Head of Talent',
      company: 'Fintech',
      avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=80&auto=format&fit=crop'
    },
    {
      quote: 'It\'s the fastest way we\'ve found to get consistent candidate notes and interview prompts.',
      author: 'Talent Partner',
      company: 'Agency',
      avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=80&auto=format&fit=crop'
    }
  ]

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            What recruiters say
          </h2>
          <p className="mt-3 text-slate-600">
            Shortlists in minutes, clean summaries for hiring managers, and transparent scoring criteria.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-700">"{testimonial.quote}"</p>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">{testimonial.author}</p>
                  <p className="text-xs text-slate-500">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
