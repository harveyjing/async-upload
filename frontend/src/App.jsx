import UploadForm from './components/UploadForm'
import FileList from './components/FileList'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Upload Form - Left Side */}
          <div className="space-y-6">
            <UploadForm />
          </div>
          
          {/* File List - Right Side */}
          <div className="space-y-6">
            <FileList />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
