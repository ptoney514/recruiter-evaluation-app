export function LogoSection() {
  const logos = [
    'LinkedIn',
    'Greenhouse',
    'Lever',
    'Ashby',
    'Google Drive',
    'Dropbox'
  ]

  return (
    <section className="py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs text-slate-500 mb-6">
          Works with your hiring stack
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center opacity-80">
          {logos.map((logo) => (
            <div
              key={logo}
              className="flex items-center justify-center rounded-md border border-slate-200 bg-white py-3"
            >
              <span className="text-sm text-slate-700">{logo}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
