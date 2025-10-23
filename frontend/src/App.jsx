import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { JobInputPage } from './pages/JobInputPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/job-input" element={<JobInputPage />} />
        {/* TODO: Add remaining routes */}
        {/* <Route path="/upload-resumes" element={<ResumeUploadPage />} /> */}
        {/* <Route path="/review" element={<ReviewPage />} /> */}
        {/* <Route path="/results" element={<ResultsPage />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
