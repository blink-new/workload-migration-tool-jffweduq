import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Server, 
  MapPin, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Building,
  Cloud,
  Database,
  Network
} from 'lucide-react'
import { blink } from '@/blink/client'
import { DataCenter, Workload } from '@/types/migration'

export function DataCenterMap() {
  const [dataCenters, setDataCenters] = useState<DataCenter[]>([])
  const [workloads, setWorkloads] = useState<Workload[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedDataCenter, setSelectedDataCenter] = useState<DataCenter | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const mapRef = useRef<HTMLDivElement>(null)
  
  const [newDataCenter, setNewDataCenter] = useState({
    name: '',
    location: '',
    capacity: 100,
    currentUtilization: 0,
    type: 'source' as 'source' | 'target'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const user = await blink.auth.me()
      const [dataCentersData, workloadsData] = await Promise.all([
        blink.db.dataCenters.list({ where: { userId: user.id } }),
        blink.db.workloads.list({ where: { userId: user.id } })
      ])
      setDataCenters(dataCentersData)
      setWorkloads(workloadsData)
    } catch (error) {
      console.error('Error loading data:', error)
      // If database doesn't exist, use empty arrays
      setDataCenters([])
      setWorkloads([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddDataCenter = async () => {
    try {
      const user = await blink.auth.me()
      const dataCenter = await blink.db.dataCenters.create({
        ...newDataCenter,
        id: `dc_${Date.now()}`,
        coordinates: {
          x: Math.random() * 800 + 100,
          y: Math.random() * 400 + 100
        },
        userId: user.id,
        createdAt: new Date().toISOString()
      })
      setDataCenters([...dataCenters, dataCenter])
      setIsAddDialogOpen(false)
      setNewDataCenter({
        name: '',
        location: '',
        capacity: 100,
        currentUtilization: 0,
        type: 'source'
      })
    } catch (error) {
      console.error('Error adding data center:', error)
      // Show user-friendly error message
      alert('Unable to save data center. Database may not be initialized yet. Please try again later.')
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === mapRef.current) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.2, 0.5))
  }

  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const getWorkloadsForDataCenter = (dcName: string, type: 'source' | 'target') => {
    return workloads.filter(w => 
      type === 'source' ? w.currentLocation === dcName : w.targetLocation === dcName
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Data Center Map</h1>
          <p className="text-muted-foreground">
            Visualize and manage your data center infrastructure
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Data Center
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Data Center</DialogTitle>
                <DialogDescription>
                  Define a new data center location
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dcName">Data Center Name</Label>
                  <Input
                    id="dcName"
                    value={newDataCenter.name}
                    onChange={(e) => setNewDataCenter({ ...newDataCenter, name: e.target.value })}
                    placeholder="e.g., AWS us-east-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dcLocation">Location</Label>
                  <Input
                    id="dcLocation"
                    value={newDataCenter.location}
                    onChange={(e) => setNewDataCenter({ ...newDataCenter, location: e.target.value })}
                    placeholder="e.g., Virginia, USA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dcType">Type</Label>
                  <Select
                    value={newDataCenter.type}
                    onValueChange={(value: 'source' | 'target') => 
                      setNewDataCenter({ ...newDataCenter, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="source">Source (Current)</SelectItem>
                      <SelectItem value="target">Target (Destination)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dcCapacity">Capacity</Label>
                    <Input
                      id="dcCapacity"
                      type="number"
                      value={newDataCenter.capacity}
                      onChange={(e) => setNewDataCenter({ ...newDataCenter, capacity: Number(e.target.value) })}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dcUtilization">Current Utilization (%)</Label>
                    <Input
                      id="dcUtilization"
                      type="number"
                      value={newDataCenter.currentUtilization}
                      onChange={(e) => setNewDataCenter({ ...newDataCenter, currentUtilization: Number(e.target.value) })}
                      placeholder="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDataCenter}>
                  Add Data Center
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Controls */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Infrastructure Map</CardTitle>
                  <CardDescription>
                    Interactive view of your data center estate
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                ref={mapRef}
                className="relative bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg overflow-hidden cursor-move"
                style={{ height: '500px' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div 
                  className="absolute inset-0"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: '0 0'
                  }}
                >
                  {/* Grid Background */}
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
                        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
                      `,
                      backgroundSize: '50px 50px'
                    }}
                  />
                  
                  {/* Data Centers */}
                  {dataCenters.map((dc) => {
                    const dcWorkloads = getWorkloadsForDataCenter(dc.name, dc.type)
                    const utilizationPercent = (dc.currentUtilization / dc.capacity) * 100
                    
                    return (
                      <div
                        key={dc.id}
                        className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                          selectedDataCenter?.id === dc.id ? 'z-10' : 'z-0'
                        }`}
                        style={{
                          left: dc.coordinates.x,
                          top: dc.coordinates.y
                        }}
                        onClick={() => setSelectedDataCenter(dc)}
                      >
                        <div className={`
                          p-4 rounded-lg border-2 shadow-lg transition-all hover:shadow-xl
                          ${dc.type === 'source' 
                            ? 'bg-blue-50 border-blue-200 hover:border-blue-300' 
                            : 'bg-green-50 border-green-200 hover:border-green-300'
                          }
                          ${selectedDataCenter?.id === dc.id ? 'ring-2 ring-primary' : ''}
                        `}>
                          <div className="flex items-center space-x-2 mb-2">
                            {dc.type === 'source' ? (
                              <Building className="h-6 w-6 text-blue-600" />
                            ) : (
                              <Cloud className="h-6 w-6 text-green-600" />
                            )}
                            <div>
                              <h3 className="font-semibold text-sm">{dc.name}</h3>
                              <p className="text-xs text-muted-foreground">{dc.location}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Utilization:</span>
                              <span>{utilizationPercent.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  utilizationPercent > 80 ? 'bg-red-500' :
                                  utilizationPercent > 60 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {dcWorkloads.length} workloads
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* Migration Arrows */}
                  {workloads.map((workload) => {
                    const sourceDC = dataCenters.find(dc => dc.name === workload.currentLocation && dc.type === 'source')
                    const targetDC = dataCenters.find(dc => dc.name === workload.targetLocation && dc.type === 'target')
                    
                    if (!sourceDC || !targetDC) return null
                    
                    const dx = targetDC.coordinates.x - sourceDC.coordinates.x
                    const dy = targetDC.coordinates.y - sourceDC.coordinates.y
                    const length = Math.sqrt(dx * dx + dy * dy)
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI
                    
                    return (
                      <div
                        key={`arrow-${workload.id}`}
                        className="absolute pointer-events-none"
                        style={{
                          left: sourceDC.coordinates.x,
                          top: sourceDC.coordinates.y,
                          width: length,
                          height: '2px',
                          background: 'linear-gradient(to right, #3b82f6, #10b981)',
                          transformOrigin: '0 50%',
                          transform: `rotate(${angle}deg)`,
                          opacity: 0.6
                        }}
                      >
                        <div 
                          className="absolute right-0 top-1/2 transform -translate-y-1/2"
                          style={{
                            width: 0,
                            height: 0,
                            borderLeft: '8px solid #10b981',
                            borderTop: '4px solid transparent',
                            borderBottom: '4px solid transparent'
                          }}
                        />
                      </div>
                    )
                  })}
                  
                  {dataCenters.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Data Centers</h3>
                        <p className="text-muted-foreground mb-4">
                          Add your first data center to start mapping
                        </p>
                        <Button onClick={() => setIsAddDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Data Center
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Center Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Centers</CardTitle>
              <CardDescription>
                {dataCenters.length} locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataCenters.map((dc) => {
                  const dcWorkloads = getWorkloadsForDataCenter(dc.name, dc.type)
                  const utilizationPercent = (dc.currentUtilization / dc.capacity) * 100
                  
                  return (
                    <div 
                      key={dc.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedDataCenter?.id === dc.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-muted-foreground'
                      }`}
                      onClick={() => setSelectedDataCenter(dc)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {dc.type === 'source' ? (
                            <Building className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Cloud className="h-4 w-4 text-green-600" />
                          )}
                          <span className="font-medium text-sm">{dc.name}</span>
                        </div>
                        <Badge variant={dc.type === 'source' ? 'secondary' : 'default'}>
                          {dc.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{dc.location}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Utilization:</span>
                          <span>{utilizationPercent.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              utilizationPercent > 80 ? 'bg-red-500' :
                              utilizationPercent > 60 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {dcWorkloads.length} workloads
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {selectedDataCenter && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {selectedDataCenter.type === 'source' ? (
                    <Building className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Cloud className="h-5 w-5 text-green-600" />
                  )}
                  <span>{selectedDataCenter.name}</span>
                </CardTitle>
                <CardDescription>
                  {selectedDataCenter.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Capacity Utilization</span>
                      <span>{((selectedDataCenter.currentUtilization / selectedDataCenter.capacity) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${Math.min((selectedDataCenter.currentUtilization / selectedDataCenter.capacity) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{selectedDataCenter.currentUtilization} used</span>
                      <span>{selectedDataCenter.capacity} total</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Workloads</h4>
                    <div className="space-y-2">
                      {getWorkloadsForDataCenter(selectedDataCenter.name, selectedDataCenter.type).map((workload) => (
                        <div key={workload.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                          <span>{workload.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {workload.strategy}
                          </Badge>
                        </div>
                      ))}
                      {getWorkloadsForDataCenter(selectedDataCenter.name, selectedDataCenter.type).length === 0 && (
                        <p className="text-sm text-muted-foreground">No workloads assigned</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}