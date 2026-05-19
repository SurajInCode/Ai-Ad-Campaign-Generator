import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-indigo-600">AI Ad-Campaign Generator</h1>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Welcome</h2>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              This is your AI Ad-Campaign Generator application. The frontend and backend are ready to be configured.
            </p>
            
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4">
              <h3 className="font-semibold text-indigo-900 mb-2">Getting Started</h3>
              <ul className="list-disc list-inside text-indigo-800 space-y-1">
                <li>Backend running on port 5000</li>
                <li>Frontend configured with Tailwind CSS</li>
                <li>Ready for feature development</li>
              </ul>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCount((count) => count + 1)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
              >
                Count is {count}
              </button>
              <p className="text-gray-600">Click the button to test interactivity</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
