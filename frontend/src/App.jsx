import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import HomePage from "./pages/HomePage";
import V1Page from "./pages/V1Page";
import V2Page from "./pages/V2Page";
import { useJobQueueContext } from "./components/v2/hooks/JobQueueContext";
import FloatingUploadWidget from "./components/v2/FloatingUploadWidget";
import { useBeforeUnload } from "./components/v2/hooks/useBeforeUnload";

function App() {
  const jobQueue = useJobQueueContext();

  // Enable beforeunload warning when there are active jobs
  useBeforeUnload(true, 
    'You have active upload jobs in progress. Leaving this page will cancel all ongoing uploads and they cannot be resumed. Are you sure you want to leave?'
  );
  
  return (
    <>  
      <Router>
        <div className="min-h-screen bg-background">
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/v1" element={<V1Page />} />
            <Route path="/v2" element={<V2Page />} />
          </Routes>
        </div>
      </Router>
      <FloatingUploadWidget jobQueue={jobQueue} />
    </>
  );
}

export default App;
