import { AIStatusIndicator } from "./ai-status-indicator"

const EnhancedModernDashboard = () => {
  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CrisisNetX
          </h1>
          <p className="text-muted-foreground">AI-Powered Disaster Response Coordination</p>
        </div>
        <AIStatusIndicator />
      </div>

      {/* Rest of the dashboard content goes here */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>
        <p>Welcome to the CrisisNetX dashboard. This is where you can monitor and manage disaster response efforts.</p>
      </div>
    </div>
  )
}

export default EnhancedModernDashboard
