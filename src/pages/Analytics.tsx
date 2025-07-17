import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Target,
  PieChart,
  Activity,
  AlertTriangle
} from 'lucide-react'
import { blink } from '@/blink/client'
import { Workload, DataCenter, migrationStrategies } from '@/types/migration'

export function Analytics() {
  const [workloads, setWorkloads] = useState<Workload[]>([])
  const [dataCenters, setDataCenters] = useState<DataCenter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const user = await blink.auth.me()
      const [workloadsData, dataCentersData] = await Promise.all([
        blink.db.workloads.list({ where: { userId: user.id } }),
        blink.db.dataCenters.list({ where: { userId: user.id } })
      ])
      setWorkloads(workloadsData)
      setDataCenters(dataCentersData)
    } catch (error) {
      console.error('Error loading data:', error)
      // If database doesn't exist, use empty arrays
      setWorkloads([])
      setDataCenters([])
    } finally {
      setLoading(false)
    }
  }

  // Analytics calculations
  const analytics = {
    totalWorkloads: workloads.length,
    totalCost: workloads.reduce((sum, w) => sum + w.estimatedCost, 0),
    totalDuration: workloads.reduce((sum, w) => sum + w.estimatedDuration, 0),
    avgCostPerWorkload: workloads.length > 0 ? workloads.reduce((sum, w) => sum + w.estimatedCost, 0) / workloads.length : 0,
    avgDurationPerWorkload: workloads.length > 0 ? workloads.reduce((sum, w) => sum + w.estimatedDuration, 0) / workloads.length : 0,
    
    // Status distribution
    statusDistribution: {
      planning: workloads.filter(w => w.status === 'planning').length,
      inProgress: workloads.filter(w => w.status === 'in-progress').length,
      completed: workloads.filter(w => w.status === 'completed').length,
      onHold: workloads.filter(w => w.status === 'on-hold').length
    },
    
    // Strategy distribution
    strategyDistribution: Object.keys(migrationStrategies).map(strategy => ({
      strategy,
      count: workloads.filter(w => w.strategy === strategy).length,
      totalCost: workloads.filter(w => w.strategy === strategy).reduce((sum, w) => sum + w.estimatedCost, 0),
      avgDuration: workloads.filter(w => w.strategy === strategy).length > 0 
        ? workloads.filter(w => w.strategy === strategy).reduce((sum, w) => sum + w.estimatedDuration, 0) / workloads.filter(w => w.strategy === strategy).length 
        : 0,
      ...migrationStrategies[strategy as keyof typeof migrationStrategies]
    })),
    
    // Risk analysis
    riskAnalysis: {
      low: workloads.filter(w => w.riskLevel === 'low').length,
      medium: workloads.filter(w => w.riskLevel === 'medium').length,
      high: workloads.filter(w => w.riskLevel === 'high').length
    },
    
    // Complexity analysis
    complexityAnalysis: {
      low: workloads.filter(w => w.complexity === 'low').length,
      medium: workloads.filter(w => w.complexity === 'medium').length,
      high: workloads.filter(w => w.complexity === 'high').length
    },
    
    // Priority analysis
    priorityAnalysis: {
      low: workloads.filter(w => w.priority === 'low').length,
      medium: workloads.filter(w => w.priority === 'medium').length,
      high: workloads.filter(w => w.priority === 'high').length
    }
  }

  // Data center utilization
  const dcUtilization = dataCenters.map(dc => ({
    ...dc,
    utilizationPercent: (dc.currentUtilization / dc.capacity) * 100,
    workloadCount: workloads.filter(w => 
      dc.type === 'source' ? w.currentLocation === dc.name : w.targetLocation === dc.name
    ).length
  }))

  // Cost savings potential
  const costSavingsPotential = analytics.strategyDistribution.reduce((total, strategy) => {
    const multiplier = strategy.costSaving === 'very high' ? 0.4 :
                     strategy.costSaving === 'high' ? 0.3 :
                     strategy.costSaving === 'medium' ? 0.2 :
                     0
    return total + (strategy.totalCost * multiplier)
  }, 0)

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
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Insights and metrics for your migration portfolio
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Workloads</p>
                <p className="text-2xl font-bold">{analytics.totalWorkloads}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Investment</p>
                <p className="text-2xl font-bold">${analytics.totalCost.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potential Savings</p>
                <p className="text-2xl font-bold">${costSavingsPotential.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Duration</p>
                <p className="text-2xl font-bold">{analytics.totalDuration}d</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Migration Status</span>
                </CardTitle>
                <CardDescription>
                  Current status of all workloads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.statusDistribution).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${
                          status === 'completed' ? 'bg-green-500' :
                          status === 'inProgress' ? 'bg-yellow-500' :
                          status === 'onHold' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`} />
                        <span className="capitalize font-medium">
                          {status === 'inProgress' ? 'In Progress' : 
                           status === 'onHold' ? 'On Hold' : status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{count} workloads</span>
                        <Badge variant="secondary">
                          {analytics.totalWorkloads > 0 
                            ? Math.round((count / analytics.totalWorkloads) * 100)
                            : 0
                          }%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Priority Distribution</span>
                </CardTitle>
                <CardDescription>
                  Workload priorities breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.priorityAnalysis).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${
                          priority === 'high' ? 'bg-red-500' :
                          priority === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                        <span className="capitalize font-medium">{priority} Priority</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{count} workloads</span>
                        <Badge variant="secondary">
                          {analytics.totalWorkloads > 0 
                            ? Math.round((count / analytics.totalWorkloads) * 100)
                            : 0
                          }%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Average Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Average Cost per Workload</CardTitle>
                <CardDescription>
                  Mean investment per migration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  ${analytics.avgCostPerWorkload.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Based on {analytics.totalWorkloads} workloads
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Duration per Workload</CardTitle>
                <CardDescription>
                  Mean time per migration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {Math.round(analytics.avgDurationPerWorkload)} days
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Based on {analytics.totalWorkloads} workloads
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Migration Strategy Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of the 6 Rs framework adoption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analytics.strategyDistribution.map(({ strategy, count, totalCost, avgDuration, name, icon, complexity, costSaving }) => (
                  <Card key={strategy} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{icon}</span>
                        <div>
                          <CardTitle className="text-lg">{name}</CardTitle>
                          <CardDescription className="text-sm">{count} workloads</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Cost:</span>
                          <span className="font-medium">${totalCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Avg Duration:</span>
                          <span className="font-medium">{Math.round(avgDuration)} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Complexity:</span>
                          <Badge variant="outline">{complexity}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cost Saving:</span>
                          <Badge variant={
                            costSaving === 'very high' ? 'default' :
                            costSaving === 'high' ? 'secondary' :
                            'outline'
                          }>
                            {costSaving}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Portfolio %:</span>
                          <span className="font-medium">
                            {analytics.totalWorkloads > 0 
                              ? Math.round((count / analytics.totalWorkloads) * 100)
                              : 0
                            }%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Risk Distribution</span>
                </CardTitle>
                <CardDescription>
                  Risk levels across your migration portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.riskAnalysis).map(([risk, count]) => (
                    <div key={risk} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${
                          risk === 'high' ? 'bg-red-500' :
                          risk === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                        <span className="capitalize font-medium">{risk} Risk</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{count} workloads</span>
                        <Badge variant="secondary">
                          {analytics.totalWorkloads > 0 
                            ? Math.round((count / analytics.totalWorkloads) * 100)
                            : 0
                          }%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Complexity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Complexity Distribution</span>
                </CardTitle>
                <CardDescription>
                  Complexity levels across your migration portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.complexityAnalysis).map(([complexity, count]) => (
                    <div key={complexity} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${
                          complexity === 'high' ? 'bg-red-500' :
                          complexity === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                        <span className="capitalize font-medium">{complexity} Complexity</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{count} workloads</span>
                        <Badge variant="secondary">
                          {analytics.totalWorkloads > 0 
                            ? Math.round((count / analytics.totalWorkloads) * 100)
                            : 0
                          }%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Mitigation Recommendations</CardTitle>
              <CardDescription>
                Suggested actions to reduce migration risks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.riskAnalysis.high > 0 && (
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h3 className="font-semibold text-red-800 mb-2">High Risk Items ({analytics.riskAnalysis.high})</h3>
                    <p className="text-sm text-red-700">
                      Consider additional planning, proof of concepts, and phased approaches for high-risk workloads.
                    </p>
                  </div>
                )}
                
                {analytics.complexityAnalysis.high > 0 && (
                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <h3 className="font-semibold text-yellow-800 mb-2">High Complexity Items ({analytics.complexityAnalysis.high})</h3>
                    <p className="text-sm text-yellow-700">
                      Allocate additional resources and consider breaking down complex workloads into smaller components.
                    </p>
                  </div>
                )}
                
                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <h3 className="font-semibold text-green-800 mb-2">Quick Wins Available</h3>
                  <p className="text-sm text-green-700">
                    {analytics.riskAnalysis.low} low-risk workloads can be prioritized for early migration success.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Center Utilization</CardTitle>
              <CardDescription>
                Capacity and utilization across your infrastructure
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dcUtilization.length === 0 ? (
                <div className="text-center py-12">
                  <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No data centers configured</h3>
                  <p className="text-muted-foreground">
                    Add data centers to see utilization analytics
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dcUtilization.map((dc) => (
                    <div key={dc.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{dc.name}</h3>
                          <p className="text-sm text-muted-foreground">{dc.location}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={dc.type === 'source' ? 'secondary' : 'default'}>
                            {dc.type}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {dc.workloadCount} workloads
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Utilization:</span>
                          <span>{dc.utilizationPercent.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              dc.utilizationPercent > 80 ? 'bg-red-500' :
                              dc.utilizationPercent > 60 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(dc.utilizationPercent, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{dc.currentUtilization} used</span>
                          <span>{dc.capacity} total capacity</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}