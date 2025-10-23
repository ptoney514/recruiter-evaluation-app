import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { JobInputPage } from './pages/JobInputPage'
import { ResumeUploadPage } from './pages/ResumeUploadPage'
import { ReviewPage } from './pages/ReviewPage'
import { ResultsPage } from './pages/ResultsPage'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/job-input" element={<JobInputPage />} />
          <Route path="/upload-resumes" element={<ResumeUploadPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
