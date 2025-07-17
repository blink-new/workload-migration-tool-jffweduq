import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, Clock, CheckCircle, AlertCircle, Play, Pause, Plus } from 'lucide-react'
import { blink } from '@/blink/client'
import { Workload, MigrationPlan, migrationStrategies } from '@/types/migration'

export function MigrationTimeline() {
  const [workloads, setWorkloads] = useState<Workload[]>([])
  const [plans, setPlans] = useState<MigrationPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const user = await blink.auth.me()
      const [workloadsData, plansData] = await Promise.all([
        blink.db.workloads.list({ 
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        }),
        blink.db.migrationPlans.list({ 
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        })
      ])
      setWorkloads(workloadsData)
      setPlans(plansData)
    } catch (error) {
      console.error('Error loading data:', error)
      // If database doesn't exist, use empty arrays
      setWorkloads([])
      setPlans([])
    } finally {
      setLoading(false)
    }
  }

  const timelineData = workloads.map(workload => ({
    ...workload,
    startDate: new Date(workload.createdAt),
    endDate: new Date(new Date(workload.createdAt).getTime() + workload.estimatedDuration * 24 * 60 * 60 * 1000)
  })).sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

  const statusStats = {
    planning: workloads.filter(w => w.status === 'planning').length,
    inProgress: workloads.filter(w => w.status === 'in-progress').length,
    completed: workloads.filter(w => w.status === 'completed').length,
    onHold: workloads.filter(w => w.status === 'on-hold').length
  }

  const totalProgress = workloads.length > 0 
    ? (statusStats.completed / workloads.length) * 100 
    : 0

  const upcomingMilestones = timelineData
    .filter(w => w.status !== 'completed')
    .slice(0, 5)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Migration Timeline</h1>
          <p className="text-muted-foreground">
            Track and manage your migration schedule and milestones
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Migration Plan
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Planning</p>
                <p className="text-2xl font-bold">{statusStats.planning}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{statusStats.inProgress}</p>
              </div>
              <Play className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{statusStats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Hold</p>
                <p className="text-2xl font-bold">{statusStats.onHold}</p>
              </div>
              <Pause className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Migration Progress</CardTitle>
          <CardDescription>
            {statusStats.completed} of {workloads.length} workloads completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={totalProgress} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0%</span>
              <span className="font-medium">{totalProgress.toFixed(1)}% Complete</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Migration Timeline</CardTitle>
              <CardDescription>
                Visual timeline of your migration activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timelineData.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No migrations scheduled</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding workloads to see your migration timeline
                  </p>
                  <Button variant="outline">
                    Add Workloads
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {timelineData.map((workload, index) => (
                    <div key={workload.id} className="relative">
                      {/* Timeline line */}
                      {index < timelineData.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />
                      )}
                      
                      <div className="flex items-start space-x-4">
                        {/* Timeline dot */}
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center text-white text-lg
                          ${workload.status === 'completed' ? 'bg-green-500' :
                            workload.status === 'in-progress' ? 'bg-yellow-500' :
                            workload.status === 'on-hold' ? 'bg-red-500' :
                            'bg-blue-500'
                          }
                        `}>
                          {migrationStrategies[workload.strategy].icon}
                        </div>
                        
                        {/* Timeline content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{workload.name}</h3>
                            <Badge variant={
                              workload.status === 'completed' ? 'default' :
                              workload.status === 'in-progress' ? 'secondary' :
                              workload.status === 'on-hold' ? 'destructive' :
                              'outline'
                            }>
                              {workload.status}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-3">{workload.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Strategy</p>
                              <p className="font-medium">{migrationStrategies[workload.strategy].name}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Duration</p>
                              <p className="font-medium">{workload.estimatedDuration} days</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Priority</p>
                              <Badge variant={
                                workload.priority === 'high' ? 'destructive' :
                                workload.priority === 'medium' ? 'default' :
                                'secondary'
                              }>
                                {workload.priority}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Cost</p>
                              <p className="font-medium">${workload.estimatedCost.toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Start: {workload.startDate.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>End: {workload.endDate.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Milestones */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Milestones</CardTitle>
              <CardDescription>
                Next items in your migration pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingMilestones.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">All migrations completed!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingMilestones.map((workload) => (
                    <div key={workload.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{workload.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {workload.estimatedDuration}d
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {migrationStrategies[workload.strategy].name}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Due: {workload.endDate.toLocaleDateString()}
                        </span>
                        <Badge variant={
                          workload.priority === 'high' ? 'destructive' :
                          workload.priority === 'medium' ? 'default' :
                          'secondary'
                        } className="text-xs">
                          {workload.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Migration Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Migration Plans</CardTitle>
              <CardDescription>
                Organized migration initiatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              {plans.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">No migration plans yet</p>
                  <Button variant="outline" size="sm">
                    Create Plan
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {plans.map((plan) => (
                    <div key={plan.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{plan.name}</h4>
                        <Badge variant={
                          plan.status === 'completed' ? 'default' :
                          plan.status === 'in-progress' ? 'secondary' :
                          'outline'
                        } className="text-xs">
                          {plan.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{plan.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {plan.workloadIds.length} workloads
                        </span>
                        <span className="font-medium">
                          ${plan.totalCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}