import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react"
import { useNavigate } from "react-router-dom"

import { authApi, userApi, setLogoutHandler } from "../services/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  // ─────────────────────────────────────────────────────────────
  // SESSION HELPERS
  // ─────────────────────────────────────────────────────────────

  const clearSession = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    setToken(null)
  }

  // ─────────────────────────────────────────────────────────────
  // SESSION RESTORE
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user")
      const storedToken = localStorage.getItem("token")

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser)

        setUser(parsedUser)
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
  // LOGOUT (defined early to avoid reference issues)
  // ─────────────────────────────────────────────────────────────

  const logout = () => {
    clearSession()
    navigate("/login")
  }

  // ─────────────────────────────────────────────────────────────
  // CONNECT GLOBAL LOGOUT HANDLER (Axios 401)
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    setLogoutHandler(logout)
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
  // UPDATE PROFILE
  // ─────────────────────────────────────────────────────────────

  const updateProfile = async (data) => {
    try {
      const response = await userApi.updateProfile(data)

      // support both response shapes
      const updatedUser = response.user || response

      if (!updatedUser) {
        throw new Error("Invalid server response")
      }

      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))

      return updatedUser
    } catch (error) {
      throw error
    }
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
      updateProfile, // ✅ KEY ADDITION
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