import { Columns3, Filter, BadgeCheck, PieChart } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data for the line chart
const chartData = [
  { run: 'Run 1', score: 68 },
  { run: 'Run 2', score: 72 },
  { run: 'Run 3', score: 65 },
  { run: 'Run 4', score: 78 },
  { run: 'Run 5', score: 75 },
  { run: 'Run 6', score: 82 },
  { run: 'Run 7', score: 79 },
  { run: 'Run 8', score: 85 },
  { run: 'Run 9', score: 81 },
  { run: 'Run 10', score: 83 },
  { run: 'Run 11', score: 77 },
  { run: 'Run 12', score: 86 }
]

export function Framework() {
  return (
    <section id="framework" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Two-Stage Explanation */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <Columns3 className="h-5 w-5 text-indigo-600" />
              <h3 className="text-xl font-semibold tracking-tight">
                Two-stage evaluation framework
              </h3>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Designed to minimize bias and maximize speed. Start broad, then go deep—without rebuilding your process.
            </p>
            <div className="mt-4 space-y-4">
              {/* Stage 1 */}
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600/10">
                    <Filter className="h-3.5 w-3.5 text-indigo-600" />
                  </span>
                  <h4 className="text-sm font-medium tracking-tight">Stage 1 — Filter</h4>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Keyword coverage, must-have checks, years in role, title alignment, location proximity. Export a shortlist instantly.
                </p>
              </div>
              {/* Stage 2 */}
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-fuchsia-600/10">
                    <BadgeCheck className="h-3.5 w-3.5 text-fuchsia-600" />
                  </span>
                  <h4 className="text-sm font-medium tracking-tight">Stage 2 — Evaluate</h4>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Competency mapping, scope/impact assessment, risk flags, and follow-up questions. Transparent rationales, shareable with hiring managers.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Data Visualization */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold tracking-tight">
                Make data-driven hiring decisions
              </h3>
              <PieChart className="h-5 w-5 text-slate-500" />
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Visualize the talent pool by fit score. Focus interviews on the top quartile and save hours each week.
            </p>
            <div className="mt-4 rounded-lg border border-slate-200 p-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="run"
                      tick={{ fontSize: 10 }}
                      stroke="#94a3b8"
                    />
                    <YAxis
                      domain={[40, 95]}
                      tick={{ fontSize: 10 }}
                      stroke="#94a3b8"
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      fill="#4f46e5"
                      fillOpacity={0.1}
                      dot={{ fill: '#4f46e5', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Avg fit score</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">72</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Candidates</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">34</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Saved hrs/wk</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">8.5</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
