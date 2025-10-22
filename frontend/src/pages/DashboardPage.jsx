import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { useJobs } from '../hooks/useJobs'

export function DashboardPage() {
  const { data: jobs } = useJobs()

  const stats = {
    totalJobs: jobs?.length || 0,
    openJobs: jobs?.filter((j) => j.status === 'open').length || 0,
    closedJobs: jobs?.filter((j) => j.status === 'closed').length || 0,
    onHoldJobs: jobs?.filter((j) => j.status === 'on_hold').length || 0
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your recruiting pipeline</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <p className="text-sm text-gray-600 mb-1">Total Jobs</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Open Positions</p>
          <p className="text-3xl font-bold text-green-600">{stats.openJobs}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">On Hold</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.onHoldJobs}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Closed</p>
          <p className="text-3xl font-bold text-gray-600">{stats.closedJobs}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
        <div className="space-y-3 text-gray-600">
          <p>• Candidate statistics and pipeline metrics</p>
          <p>• Evaluation cost tracking</p>
          <p>• Recommendation breakdown (ADVANCE vs DISPOSITION)</p>
          <p>• Recent activity feed</p>
          <p>• Quick access to pending evaluations</p>
        </div>
      </Card>
    </Layout>
  )
}
