import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Dashboard from './app/dashboard/Dashboard'
import Layout from './app/layout/Layout'
import AuthLayout from './app/layout/AuthLayout'
import Login from './app/Auth/Login'
import Register from './app/Auth/Register'
import Trades from './app/trades/Trades'
import Analytics from './app/analytics/Analytics'
import Strategies from './app/strategies/Strategies'
import Transactions from './app/transactions/Transactions'
import Accounts from './app/accounts/Accounts'
import NotFound from './app/NotFound'
import Insights from './app/insights/Insights'
import { ThemeProvider } from './components/theme-provider'
import { TooltipProvider } from './components/ui/tooltip'
import { AuthProvider } from './app/context/AuthContext'
import { Toaster } from './components/ui/sonner'

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
             <Toaster richColors position="top-right" />
            <Routes>

              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Protected App Routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/trades" element={<Trades />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/strategies" element={<Strategies />} />
                <Route path="/insights" element={<Insights />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />

            </Routes>

          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App