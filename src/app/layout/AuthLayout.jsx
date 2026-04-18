import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth()

  // Show loader while restoring session
  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-6 md:p-10">
      <Outlet />
    </div>
  )
}