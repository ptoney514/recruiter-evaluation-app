export function FAQ() {
  const faqs = [
    {
      question: 'Do I need a credit card to try it?',
      answer: 'No, keyword ranking is 100% free.'
    },
    {
      question: 'How accurate is the AI evaluation?',
      answer: 'Claude 3.5 Haiku scores based on your job requirements using structured criteria and rationales.'
    },
    {
      question: 'What file formats are supported?',
      answer: 'PDF and DOCX resumes.'
    },
    {
      question: 'Can I export results?',
      answer: 'Yes. Generate professional PDF reports and share instantly.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Encrypted storage, GDPR friendly, optional data deletion after 30 days upon request.'
    },
    {
      question: 'How much does AI evaluation cost?',
      answer: '$0.01 per candidate (Claude 3.5 Haiku), $0.05 per candidate (GPT‑4o).'
    }
  ]

  return (
    <section id="faq" className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-3xl font-semibold tracking-tight text-center">FAQ</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-medium tracking-tight">{faq.question}</h3>
              <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
