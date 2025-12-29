import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import CVEditor from './pages/CVEditor'
import ProjectPolish from './pages/ProjectPolish'
import CoverLetter from './pages/CoverLetter'
import MyAccount from './pages/MyAccount'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <Layout>
              <Login />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout>
              <Register />
            </Layout>
          }
        />
        <Route
          path="/"
          element={
            <Layout>
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/cv-editor"
          element={
            <Layout>
              <ProtectedRoute>
                <CVEditor />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/project-polish"
          element={
            <Layout>
              <ProtectedRoute>
                <ProjectPolish />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/cover-letter"
          element={
            <Layout>
              <ProtectedRoute>
                <CoverLetter />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/my-account"
          element={
            <Layout>
              <ProtectedRoute>
                <MyAccount />
              </ProtectedRoute>
            </Layout>
          }
        />
      </Routes>
    </Router>
  )
}

export default App

