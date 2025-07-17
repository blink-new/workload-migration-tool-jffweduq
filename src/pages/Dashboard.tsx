import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Server, 
  Route, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Plus
} from 'lucide-react'
import { blink } from '@/blink/client'
import { Workload, MigrationPlan, migrationStrategies } from '@/types/migration'

export function Dashboard() {
  const [workloads, setWorkloads] = useState<Workload[]>([])
  const [plans, setPlans] = useState<MigrationPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const user = await blink.auth.me()
      const [workloadsData, plansData] = await Promise.all([
        blink.db.workloads.list({ where: { userId: user.id }, limit: 10 }),
        blink.db.migrationPlans.list({ where: { userId: user.id }, limit: 5 })
      ])
      setWorkloads(workloadsData)
      setPlans(plansData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // If database doesn't exist, use empty arrays
      setWorkloads([])
      setPlans([])
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalWorkloads: workloads.length,
    inProgress: workloads.filter(w => w.status === 'in-progress').length,
    completed: workloads.filter(w => w.status === 'completed').length,
    totalCost: workloads.reduce((sum, w) => sum + w.estimatedCost, 0)
  }

  const strategyDistribution = Object.keys(migrationStrategies).map(strategy => ({
    strategy,
    count: workloads.filter(w => w.strategy === strategy).length,
    ...migrationStrategies[strategy as keyof typeof migrationStrategies]
  }))

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your migration projects and workloads
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Migration Plan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Workloads</p>
                <p className="text-2xl font-bold">{stats.totalWorkloads}</p>
              </div>
              <Server className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Est. Total Cost</p>
                <p className="text-2xl font-bold">${stats.totalCost.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Migration Strategies Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Migration Strategies</CardTitle>
            <CardDescription>
              Distribution of workloads across the 6 Rs framework
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {strategyDistribution.map(({ strategy, count, name, icon }) => (
              <div key={strategy} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-sm text-muted-foreground">{count} workloads</p>
                  </div>
                </div>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Migration Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Migration Plans</CardTitle>
            <CardDescription>
              Your latest migration planning activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {plans.length === 0 ? (
              <div className="text-center py-8">
                <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No migration plans yet</p>
                <Button variant="outline" className="mt-4">
                  Create Your First Plan
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{plan.name}</h4>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant={
                          plan.status === 'completed' ? 'default' :
                          plan.status === 'in-progress' ? 'secondary' :
                          'outline'
                        }>
                          {plan.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ${plan.totalCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Workloads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Workloads</CardTitle>
          <CardDescription>
            Latest workloads added to your migration pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workloads.length === 0 ? (
            <div className="text-center py-8">
              <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No workloads added yet</p>
              <Button variant="outline" className="mt-4">
                Add Your First Workload
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {workloads.slice(0, 5).map((workload) => (
                <div key={workload.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {migrationStrategies[workload.strategy].icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{workload.name}</h4>
                      <p className="text-sm text-muted-foreground">{workload.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="outline">
                          {migrationStrategies[workload.strategy].name}
                        </Badge>
                        <Badge variant={
                          workload.priority === 'high' ? 'destructive' :
                          workload.priority === 'medium' ? 'default' :
                          'secondary'
                        }>
                          {workload.priority} priority
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ${workload.estimatedCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      workload.status === 'completed' ? 'default' :
                      workload.status === 'in-progress' ? 'secondary' :
                      'outline'
                    }>
                      {workload.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}