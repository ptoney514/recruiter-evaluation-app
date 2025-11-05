import { useState, useRef } from 'react'
import { Bolt, Rocket, Play, FolderUp, Plus, FileText, SearchCheck, Sparkles, ListChecks, BrainCircuit, BarChart3, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

export function HeroSection() {
  const [files, setFiles] = useState([])
  const [jobDescription, setJobDescription] = useState('')
  const [results, setResults] = useState(null)
  const [resultType, setResultType] = useState('waiting') // waiting, keyword, ai
  const fileInputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      f => f.type === 'application/pdf' || f.name.endsWith('.docx')
    )
    handleFiles(droppedFiles)
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || [])
    handleFiles(selectedFiles)
  }

  const handleFiles = (newFiles) => {
    if (newFiles.length > 0) {
      setFiles(newFiles.slice(0, 50))
      setResultType('waiting')
    }
  }

  const handleClear = () => {
    setFiles([])
    setJobDescription('')
    setResults(null)
    setResultType('waiting')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleKeywordMatch = () => {
    if (files.length === 0 || !jobDescription.trim()) {
      alert('Add resumes and paste a job description to run matching.')
      return
    }

    // Simulate keyword matching
    const mockResults = files.slice(0, 8).map((file) => ({
      name: file.name,
      score: Math.floor(Math.random() * (95 - 45 + 1)) + 45,
      coverage: Math.floor(Math.random() * (98 - 60 + 1)) + 60
    }))

    const scoreDistribution = [
      { range: '40-49', count: Math.floor(Math.random() * 3) },
      { range: '50-59', count: Math.floor(Math.random() * 5) + 1 },
      { range: '60-69', count: Math.floor(Math.random() * 7) + 2 },
      { range: '70-79', count: Math.floor(Math.random() * 8) + 3 },
      { range: '80-89', count: Math.floor(Math.random() * 7) + 2 },
      { range: '90-100', count: Math.floor(Math.random() * 5) + 1 }
    ]

    setResults({ candidates: mockResults, distribution: scoreDistribution })
    setResultType('keyword')
  }

  const handleAIAnalysis = () => {
    if (files.length === 0) {
      alert('Add resumes first to run AI analysis.')
      return
    }
    setResultType('ai')
  }

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10 sm:pt-24 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Hero Copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600/10 text-indigo-700 px-2 py-0.5">
                <Bolt className="h-3.5 w-3.5" />
                New
              </span>
              Batch resume evaluation in minutes
            </div>
            <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-slate-900">
              Evaluate 50 Resumes in Minutes, Not Hours
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600">
              AI-powered batch resume screening for recruiters. Upload resumes, get instant rankings, evaluate top candidates with Claude AI.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-5 py-3 text-sm text-white shadow-sm hover:bg-indigo-500"
              >
                <Rocket className="h-4 w-4" />
                Start Free Trial
              </Link>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm text-slate-800 hover:bg-slate-50"
              >
                <Play className="h-4 w-4" />
                Watch demo (1‑min)
              </a>
            </div>
            <div className="mt-6 flex items-center gap-6">
              <div className="flex -space-x-2">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=80&auto=format&fit=crop"
                  alt=""
                  className="h-8 w-8 rounded-full ring-2 ring-white object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=80&auto=format&fit=crop"
                  alt=""
                  className="h-8 w-8 rounded-full ring-2 ring-white object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=80&auto=format&fit=crop"
                  alt=""
                  className="h-8 w-8 rounded-full ring-2 ring-white object-cover"
                />
              </div>
              <p className="text-sm text-slate-600">
                500+ evaluations completed — trusted by recruiters.
              </p>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              50 resumes → ~10 minutes. Stop drowning in manual screening and focus on interviews.
            </p>
          </div>

          {/* Right: Interactive Demo Card */}
          <div className="relative">
            <div className="rounded-xl border border-slate-200 bg-white/80 shadow-[0_10px_30px_rgba(2,6,23,0.06)] backdrop-blur">
              <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
                </div>
                <div className="text-xs text-slate-500">Evala Demo</div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {/* Left: Upload */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-800">Resumes</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`mt-2 flex flex-col items-center justify-center rounded-lg border border-dashed ${
                        isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50'
                      } px-4 py-8 text-center hover:bg-slate-100 cursor-pointer transition-colors`}
                    >
                      <FolderUp className="h-6 w-6 text-slate-500" />
                      <p className="mt-2 text-sm text-slate-600">
                        Drag & drop PDFs, or click to browse
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          fileInputRef.current?.click()
                        }}
                        className="mt-3 inline-flex items-center gap-2 rounded-md bg-slate-900 px-3.5 py-2 text-xs text-white hover:bg-slate-800"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add files
                      </button>
                    </div>

                    {files.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            Selected ({files.length})
                          </span>
                          <button
                            onClick={handleClear}
                            className="text-xs text-slate-600 hover:text-slate-900"
                          >
                            Clear
                          </button>
                        </div>
                        <ul className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                          {files.slice(0, 5).map((file, i) => (
                            <li
                              key={i}
                              className="rounded-md border border-slate-200 bg-white p-2 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-slate-500 flex-shrink-0" />
                                <span className="text-sm text-slate-700 truncate">
                                  {file.name}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500 flex-shrink-0">
                                {Math.max(1, Math.round(file.size / 1024))} KB
                              </span>
                            </li>
                          ))}
                          {files.length > 5 && (
                            <li className="text-xs text-slate-500 text-center">
                              +{files.length - 5} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4">
                      <label className="text-sm font-medium text-slate-800">
                        Job description
                      </label>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows="4"
                        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Paste the role summary and requirements..."
                      ></textarea>
                    </div>
                    <button
                      onClick={handleKeywordMatch}
                      disabled={files.length === 0 || !jobDescription.trim()}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SearchCheck className="h-4 w-4" />
                      Run keyword match
                    </button>
                    <button
                      onClick={handleAIAnalysis}
                      disabled={files.length === 0}
                      className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="h-4 w-4 text-fuchsia-600" />
                      Upgrade: AI deep analysis
                    </button>
                  </div>

                  {/* Right: Results */}
                  <div className="md:col-span-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium tracking-tight text-slate-900">
                        Results
                      </h3>
                      <span className="text-xs rounded-full bg-slate-100 text-slate-700 px-2 py-0.5">
                        {resultType === 'waiting' ? 'Waiting' : resultType === 'keyword' ? 'Keyword Fit' : 'AI Deep Dive'}
                      </span>
                    </div>

                    {resultType === 'waiting' && (
                      <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4 text-center">
                        <p className="text-sm text-slate-600">
                          No results yet. Add resumes and a job description to begin.
                        </p>
                      </div>
                    )}

                    {resultType === 'keyword' && results && (
                      <div className="mt-3 space-y-3">
                        <div className="rounded-lg border border-slate-200 bg-white p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600/10">
                                <ListChecks className="h-3.5 w-3.5 text-indigo-600" />
                              </span>
                              <h4 className="text-sm font-medium tracking-tight text-slate-900">
                                Stage 1 — Keyword Fit
                              </h4>
                            </div>
                            <span className="text-xs text-slate-500">Free</span>
                          </div>
                          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                            {results.candidates.map((candidate, i) => {
                              const pass = candidate.score >= 70
                              return (
                                <div key={i} className="rounded-md border border-slate-200 p-3">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-800 truncate">
                                      {candidate.name}
                                    </p>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full ${
                                        pass
                                          ? 'text-indigo-700 bg-indigo-600/10'
                                          : 'text-slate-700 bg-slate-100'
                                      }`}
                                    >
                                      {candidate.score}
                                    </span>
                                  </div>
                                  <div className="mt-2 h-2 w-full rounded bg-slate-100 overflow-hidden">
                                    <div
                                      className={`h-full ${
                                        pass ? 'bg-indigo-600' : 'bg-slate-400'
                                      }`}
                                      style={{ width: `${candidate.score}%` }}
                                    ></div>
                                  </div>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Keyword coverage: {candidate.coverage}%
                                  </p>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Mini Chart */}
                        <div className="rounded-lg border border-slate-200 bg-white p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-slate-800">
                              Fit score distribution
                            </p>
                            <BarChart3 className="h-4 w-4 text-slate-500" />
                          </div>
                          <div className="mt-2 h-32">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={results.distribution}>
                                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    )}

                    {resultType === 'ai' && (
                      <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-fuchsia-600/10">
                              <BrainCircuit className="h-3.5 w-3.5 text-fuchsia-600" />
                            </span>
                            <h4 className="text-sm font-medium tracking-tight text-slate-900">
                              Stage 2 — AI Deep Dive
                            </h4>
                          </div>
                          <span className="text-xs text-slate-500">Pro</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          Competencies, experience alignment, risk flags, and a concise summary for each candidate.
                        </p>
                        <div className="mt-3 p-4 bg-fuchsia-50 border border-fuchsia-200 rounded-lg text-center">
                          <p className="text-sm text-slate-700">
                            🎯 AI analysis available in full version
                          </p>
                          <Link
                            to="/signup"
                            className="mt-2 inline-flex items-center gap-2 text-sm text-fuchsia-700 hover:text-fuchsia-800 font-medium"
                          >
                            Sign up to unlock →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
