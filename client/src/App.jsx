import { useState } from 'react'
import Navigation from './components/Navigation'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navigation />
      <div className="main-content">
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>🌾 Agricultural Super App</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Welcome to the Agricultural Super App! Connect with experts, share knowledge, and grow together.
          </p>
        </div>
        <p className="read-the-docs">
          Click on the navigation links above to explore different sections
        </p>
      </div>
    </>
  )
}

export default App
