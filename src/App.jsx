import './App.css'
import Layout from './app/layout/Layout'
import { ThemeProvider } from './components/theme-provider'
import { TooltipProvider } from './components/ui/tooltip'

function App() {
  

  return (
    <>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
         <TooltipProvider>
         <Layout/>
        </TooltipProvider>
        </ThemeProvider>
    </>
  )
}

export default App
