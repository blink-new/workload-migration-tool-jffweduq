import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react'
import { blink } from '@/blink/client'
import { Workload, migrationStrategies } from '@/types/migration'

export function WorkloadAssessment() {
  const [workloads, setWorkloads] = useState<Workload[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkloads()
  }, [])

  const loadWorkloads = async () => {
    try {
      const user = await blink.auth.me()
      const data = await blink.db.workloads.list({ 
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setWorkloads(data)
    } catch (error) {
      console.error('Error loading workloads:', error)
      // If database doesn't exist, use empty array
      setWorkloads([])
    } finally {
      setLoading(false)
    }
  }

  const assessmentMetrics = {
    totalWorkloads: workloads.length,
    assessed: workloads.filter(w => w.strategy && w.complexity && w.riskLevel).length,
    highRisk: workloads.filter(w => w.riskLevel === 'high').length,
    highComplexity: workloads.filter(w => w.complexity === 'high').length,
    totalCost: workloads.reduce((sum, w) => sum + w.estimatedCost, 0),
    avgDuration: workloads.length > 0 
      ? workloads.reduce((sum, w) => sum + w.estimatedDuration, 0) / workloads.length 
      : 0
  }

  const strategyRecommendations = Object.keys(migrationStrategies).map(strategy => {
    const strategyWorkloads = workloads.filter(w => w.strategy === strategy)
    const avgCost = strategyWorkloads.length > 0 
      ? strategyWorkloads.reduce((sum, w) => sum + w.estimatedCost, 0) / strategyWorkloads.length 
      : 0
    const avgDuration = strategyWorkloads.length > 0 
      ? strategyWorkloads.reduce((sum, w) => sum + w.estimatedDuration, 0) / strategyWorkloads.length 
      : 0
    
    return {
      strategy,
      count: strategyWorkloads.length,
      avgCost,
      avgDuration,
      ...migrationStrategies[strategy as keyof typeof migrationStrategies]
    }
  })

  const riskDistribution = [
    { level: 'low', count: workloads.filter(w => w.riskLevel === 'low').length, color: 'bg-green-500' },
    { level: 'medium', count: workloads.filter(w => w.riskLevel === 'medium').length, color: 'bg-yellow-500' },
    { level: 'high', count: workloads.filter(w => w.riskLevel === 'high').length, color: 'bg-red-500' }
  ]

  const complexityDistribution = [
    { level: 'low', count: workloads.filter(w => w.complexity === 'low').length, color: 'bg-green-500' },
    { level: 'medium', count: workloads.filter(w => w.complexity === 'medium').length, color: 'bg-yellow-500' },
    { level: 'high', count: workloads.filter(w => w.complexity === 'high').length, color: 'bg-red-500' }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-foreground">Workload Assessment</h1>
          <p className="text-muted-foreground">
            Analyze and evaluate your workloads for migration readiness
          </p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Import Assessment Data
        </Button>
      </div>

      {/* Assessment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Workloads</p>
                <p className="text-2xl font-bold">{assessmentMetrics.totalWorkloads}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assessment Progress</p>
                <p className="text-2xl font-bold">
                  {assessmentMetrics.totalWorkloads > 0 
                    ? Math.round((assessmentMetrics.assessed / assessmentMetrics.totalWorkloads) * 100)
                    : 0
                  }%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <Progress 
              value={assessmentMetrics.totalWorkloads > 0 
                ? (assessmentMetrics.assessed / assessmentMetrics.totalWorkloads) * 100
                : 0
              } 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk Items</p>
                <p className="text-2xl font-bold">{assessmentMetrics.highRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">{Math.round(assessmentMetrics.avgDuration)}d</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="strategies">Strategy Analysis</TabsTrigger>
          <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Risk Distribution</span>
                </CardTitle>
                <CardDescription>
                  Breakdown of workloads by risk level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskDistribution.map(({ level, count, color }) => (
                    <div key={level} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${color}`} />
                        <span className="capitalize font-medium">{level} Risk</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{count} workloads</span>
                        <Badge variant="secondary">
                          {assessmentMetrics.totalWorkloads > 0 
                            ? Math.round((count / assessmentMetrics.totalWorkloads) * 100)
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
                  Breakdown of workloads by complexity level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complexityDistribution.map(({ level, count, color }) => (
                    <div key={level} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${color}`} />
                        <span className="capitalize font-medium">{level} Complexity</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{count} workloads</span>
                        <Badge variant="secondary">
                          {assessmentMetrics.totalWorkloads > 0 
                            ? Math.round((count / assessmentMetrics.totalWorkloads) * 100)
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
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of migration strategies and their metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {strategyRecommendations.map(({ strategy, count, avgCost, avgDuration, name, description, icon, complexity, timeframe, costSaving }) => (
                  <Card key={strategy} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{icon}</span>
                        <div>
                          <CardTitle className="text-lg">{name}</CardTitle>
                          <CardDescription className="text-sm">{description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Workloads:</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                        {count > 0 && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Avg Cost:</span>
                              <span>${avgCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Avg Duration:</span>
                              <span>{Math.round(avgDuration)} days</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Complexity:</span>
                          <Badge variant="outline">{complexity}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cost Saving:</span>
                          <span>{costSaving}</span>
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
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>
                Identify and analyze potential migration risks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {workloads.filter(w => w.riskLevel === 'high').length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-600 mb-4">High Risk Workloads</h3>
                    <div className="space-y-3">
                      {workloads.filter(w => w.riskLevel === 'high').map((workload) => (
                        <div key={workload.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                          <div>
                            <h4 className="font-medium">{workload.name}</h4>
                            <p className="text-sm text-muted-foreground">{workload.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="destructive">High Risk</Badge>
                              <Badge variant="outline">{workload.complexity} complexity</Badge>
                              <Badge variant="outline">{migrationStrategies[workload.strategy].name}</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Est. Cost</p>
                            <p className="font-semibold">${workload.estimatedCost.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {workloads.filter(w => w.complexity === 'high').length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-600 mb-4">High Complexity Workloads</h3>
                    <div className="space-y-3">
                      {workloads.filter(w => w.complexity === 'high').map((workload) => (
                        <div key={workload.id} className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                          <div>
                            <h4 className="font-medium">{workload.name}</h4>
                            <p className="text-sm text-muted-foreground">{workload.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="destructive">High Complexity</Badge>
                              <Badge variant="outline">{workload.riskLevel} risk</Badge>
                              <Badge variant="outline">{migrationStrategies[workload.strategy].name}</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Est. Duration</p>
                            <p className="font-semibold">{workload.estimatedDuration} days</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Migration Recommendations</span>
              </CardTitle>
              <CardDescription>
                AI-powered recommendations for your migration strategy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <h3 className="font-semibold text-blue-800 mb-2">Quick Wins</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Start with these low-risk, high-impact migrations to build momentum
                  </p>
                  <div className="space-y-2">
                    {workloads
                      .filter(w => w.riskLevel === 'low' && w.complexity === 'low')
                      .slice(0, 3)
                      .map((workload) => (
                        <div key={workload.id} className="flex items-center justify-between text-sm">
                          <span>{workload.name}</span>
                          <Badge variant="outline">{migrationStrategies[workload.strategy].name}</Badge>
                        </div>
                      ))
                    }
                  </div>
                </div>

                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <h3 className="font-semibold text-green-800 mb-2">Cost Optimization</h3>
                  <p className="text-sm text-green-700 mb-3">
                    Consider these strategies to maximize cost savings
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Retire unused applications</span>
                      <Badge variant="outline">
                        {workloads.filter(w => w.strategy === 'retire').length} candidates
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Repurchase with SaaS alternatives</span>
                      <Badge variant="outline">
                        {workloads.filter(w => w.strategy === 'repurchase').length} candidates
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                  <h3 className="font-semibold text-yellow-800 mb-2">Risk Mitigation</h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    Address these high-risk items with careful planning
                  </p>
                  <div className="space-y-2">
                    {workloads
                      .filter(w => w.riskLevel === 'high')
                      .slice(0, 3)
                      .map((workload) => (
                        <div key={workload.id} className="flex items-center justify-between text-sm">
                          <span>{workload.name}</span>
                          <Badge variant="destructive">Requires attention</Badge>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}