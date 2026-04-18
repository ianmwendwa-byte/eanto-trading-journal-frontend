import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react"
import { useNavigate } from "react-router-dom"

import { authApi, setLogoutHandler } from "../services/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  // ─────────────────────────────────────────────────────────────
  // SESSION RESTORE
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user")
      const storedToken = localStorage.getItem("token")

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser))
        setToken(storedToken)
      }
    } catch (error) {
      console.error("Session restore failed:", error)
      clearSession()
    } finally {
      setLoading(false)
    }
  }, [])

  // ─────────────────────────────────────────────────────────────
  // CONNECT GLOBAL LOGOUT HANDLER
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    setLogoutHandler(() => logout)
  }, [])

  // ─────────────────────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────────────────────

  const login = async (email, password) => {
    try {
      const { user: userData, token: authToken } =
        await authApi.login({ email, password })

      if (!authToken || !userData) {
        throw new Error("Invalid server response")
      }

      localStorage.setItem("token", authToken)
      localStorage.setItem("user", JSON.stringify(userData))

      setUser(userData)
      setToken(authToken)

      navigate("/dashboard")

      return userData
    } catch (error) {
      // IMPORTANT:
      // Do NOT navigate or toast here
      // Let UI handle it
      throw error
    }
  }

  // ─────────────────────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────────────────────

  const register = async (name, email, password) => {
    try {
      const { user: userData, token: authToken } =
        await authApi.register({ name, email, password })

      if (!authToken || !userData) {
        throw new Error("Invalid server response")
      }

      localStorage.setItem("token", authToken)
      localStorage.setItem("user", JSON.stringify(userData))

      setUser(userData)
      setToken(authToken)

      navigate("/dashboard")

      return userData
    } catch (error) {
      throw error
    }
  }

  // ─────────────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────────────

  const clearSession = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    setToken(null)
  }

  const logout = () => {
    clearSession()
    navigate("/login")
  }

  // ─────────────────────────────────────────────────────────────
  // DERIVED STATE
  // ─────────────────────────────────────────────────────────────

  const isAuthenticated = !!token

  // ─────────────────────────────────────────────────────────────
  // MEMO VALUE
  // ─────────────────────────────────────────────────────────────

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
    }),
    [user, token, loading, isAuthenticated]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}