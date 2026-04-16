import heroImg from './assets/hero.png'
import './App.css'

function App() {
  

  return (
    <>
      <div>
        <div className="card">
          <h1 className="text-4xl font-bold text-center mb-4">Welcome to Eanto Journal</h1>
          <p className="text-center text-gray-600 mb-8">Your ultimate trading journal to track and analyze your trades.</p>
          <img src={heroImg} alt="Hero" className="mx-auto mb-8" />
          <div className="flex justify-center gap-4">
            <a href="/login" className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Login</a>
            <a href="/signup" className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition">Sign Up</a>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
