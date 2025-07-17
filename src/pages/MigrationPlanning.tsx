import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Search, Filter, ArrowRight, DollarSign, Clock, AlertTriangle } from 'lucide-react'
import { blink } from '@/blink/client'
import { Workload, MigrationStrategy, migrationStrategies } from '@/types/migration'

export function MigrationPlanning() {
  const [workloads, setWorkloads] = useState<Workload[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStrategy, setFilterStrategy] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newWorkload, setNewWorkload] = useState({
    name: '',
    description: '',
    currentLocation: '',
    targetLocation: '',
    strategy: 'rehost' as MigrationStrategy,
    complexity: 'medium' as const,
    priority: 'medium' as const,
    estimatedCost: 0,
    estimatedDuration: 0,
    riskLevel: 'medium' as const
  })

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

  const handleAddWorkload = async () => {
    try {
      const user = await blink.auth.me()
      const workload = await blink.db.workloads.create({
        ...newWorkload,
        id: `workload_${Date.now()}`,
        dependencies: [],
        status: 'planning' as const,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      setWorkloads([workload, ...workloads])
      setIsAddDialogOpen(false)
      setNewWorkload({
        name: '',
        description: '',
        currentLocation: '',
        targetLocation: '',
        strategy: 'rehost',
        complexity: 'medium',
        priority: 'medium',
        estimatedCost: 0,
        estimatedDuration: 0,
        riskLevel: 'medium'
      })
    } catch (error) {
      console.error('Error adding workload:', error)
      // Show user-friendly error message
      alert('Unable to save workload. Database may not be initialized yet. Please try again later.')
    }
  }

  const filteredWorkloads = workloads.filter(workload => {
    const matchesSearch = workload.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workload.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStrategy = filterStrategy === 'all' || workload.strategy === filterStrategy
    return matchesSearch && matchesStrategy
  })

  const strategyStats = Object.keys(migrationStrategies).map(strategy => {
    const strategyWorkloads = workloads.filter(w => w.strategy === strategy)
    return {
      strategy,
      count: strategyWorkloads.length,
      totalCost: strategyWorkloads.reduce((sum, w) => sum + w.estimatedCost, 0),
      avgDuration: strategyWorkloads.length > 0 
        ? strategyWorkloads.reduce((sum, w) => sum + w.estimatedDuration, 0) / strategyWorkloads.length 
        : 0,
      ...migrationStrategies[strategy as keyof typeof migrationStrategies]
    }
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
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
          <h1 className="text-3xl font-bold text-foreground">Migration Planning</h1>
          <p className="text-muted-foreground">
            Plan your workload migrations using the 6 Rs framework
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Workload
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Workload</DialogTitle>
              <DialogDescription>
                Define a new workload for migration planning
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workload Name</Label>
                <Input
                  id="name"
                  value={newWorkload.name}
                  onChange={(e) => setNewWorkload({ ...newWorkload, name: e.target.value })}
                  placeholder="e.g., Customer Database"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="strategy">Migration Strategy</Label>
                <Select
                  value={newWorkload.strategy}
                  onValueChange={(value: MigrationStrategy) => 
                    setNewWorkload({ ...newWorkload, strategy: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(migrationStrategies).map(([key, strategy]) => (
                      <SelectItem key={key} value={key}>
                        {strategy.icon} {strategy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newWorkload.description}
                  onChange={(e) => setNewWorkload({ ...newWorkload, description: e.target.value })}
                  placeholder="Describe the workload and its requirements"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentLocation">Current Location</Label>
                <Input
                  id="currentLocation"
                  value={newWorkload.currentLocation}
                  onChange={(e) => setNewWorkload({ ...newWorkload, currentLocation: e.target.value })}
                  placeholder="e.g., On-premises DC1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetLocation">Target Location</Label>
                <Input
                  id="targetLocation"
                  value={newWorkload.targetLocation}
                  onChange={(e) => setNewWorkload({ ...newWorkload, targetLocation: e.target.value })}
                  placeholder="e.g., AWS us-east-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complexity">Complexity</Label>
                <Select
                  value={newWorkload.complexity}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setNewWorkload({ ...newWorkload, complexity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newWorkload.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setNewWorkload({ ...newWorkload, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Estimated Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={newWorkload.estimatedCost}
                  onChange={(e) => setNewWorkload({ ...newWorkload, estimatedCost: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newWorkload.estimatedDuration}
                  onChange={(e) => setNewWorkload({ ...newWorkload, estimatedDuration: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddWorkload}>
                Add Workload
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Migration Strategies Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategyStats.map(({ strategy, count, totalCost, avgDuration, name, description, icon, complexity, timeframe, costSaving }) => (
          <Card key={strategy} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <CardTitle className="text-lg">{name}</CardTitle>
                    <CardDescription className="text-sm">{description}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">{count}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Complexity:</span>
                  <Badge variant="outline" className="text-xs">
                    {complexity}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Timeframe:</span>
                  <span>{timeframe}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cost Saving:</span>
                  <span>{costSaving}</span>
                </div>
                {count > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Cost:</span>
                      <span>${totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Duration:</span>
                      <span>{Math.round(avgDuration)} days</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search workloads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStrategy} onValueChange={setFilterStrategy}>
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Strategies</SelectItem>
            {Object.entries(migrationStrategies).map(([key, strategy]) => (
              <SelectItem key={key} value={key}>
                {strategy.icon} {strategy.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Workloads List */}
      <Card>
        <CardHeader>
          <CardTitle>Workloads ({filteredWorkloads.length})</CardTitle>
          <CardDescription>
            Manage and track your workload migrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredWorkloads.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-lg font-medium mb-2">No workloads found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterStrategy !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding your first workload to begin migration planning'
                }
              </p>
              {!searchTerm && filterStrategy === 'all' && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Workload
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWorkloads.map((workload) => (
                <div key={workload.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">
                        {migrationStrategies[workload.strategy].icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{workload.name}</h3>
                        <p className="text-muted-foreground mb-3">{workload.description}</p>
                        
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span>{workload.currentLocation}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span>{workload.targetLocation}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-3">
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
                          <Badge variant={
                            workload.complexity === 'high' ? 'destructive' :
                            workload.complexity === 'medium' ? 'default' :
                            'secondary'
                          }>
                            {workload.complexity} complexity
                          </Badge>
                          <Badge variant={
                            workload.riskLevel === 'high' ? 'destructive' :
                            workload.riskLevel === 'medium' ? 'default' :
                            'secondary'
                          }>
                            {workload.riskLevel} risk
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${workload.estimatedCost.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{workload.estimatedDuration} days</span>
                      </div>
                      <Badge variant={
                        workload.status === 'completed' ? 'default' :
                        workload.status === 'in-progress' ? 'secondary' :
                        'outline'
                      }>
                        {workload.status}
                      </Badge>
                    </div>
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