import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Database, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react'

interface DatabaseNotReadyProps {
  onRetry: () => void
}

export function DatabaseNotReady({ onRetry }: DatabaseNotReadyProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <Database className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-2xl">Database Setup Required</CardTitle>
          <CardDescription>
            The database for this project needs to be initialized before you can use the migration tool
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The database tables for workloads and migration plans haven't been created yet.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <h3 className="font-semibold">What you can do:</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                  <span className="text-primary text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Contact Support</p>
                  <p className="text-sm text-muted-foreground">
                    Reach out to support to help initialize your database
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                  <span className="text-primary text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Try Again Later</p>
                  <p className="text-sm text-muted-foreground">
                    The database might be initializing in the background
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                  <span className="text-primary text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Explore the Interface</p>
                  <p className="text-sm text-muted-foreground">
                    You can still navigate the app to see the migration planning interface
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">About This Tool</h4>
            <p className="text-sm text-muted-foreground">
              The Workload Migration Support Tool helps you plan and manage workload migrations using the 
              6 Rs framework (Rehost, Replatform, Refactor, Repurchase, Retire, Retain). Once the database 
              is ready, you'll be able to add workloads, create migration plans, and track progress.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:support@blink.new" className="flex items-center">
                <ExternalLink className="mr-2 h-4 w-4" />
                Contact Support
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}