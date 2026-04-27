import { useState } from 'react'
import './App.css'

function App() {
  const [view, setView] = useState('home') // home, goals, search, results
  const [goals, setGoals] = useState({
    bodyComposition: '',
    healthConditions: [],
    dietaryPreferences: [],
    performanceLongevity: ''
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyzeFood = async (foodData) => {
    setLoading(true)
    try {
      const response = await fetch('https://c3-0108.c3.heyron.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer token-07ed1b603e23d289e29f135b15689f99',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openclaw:main',
          messages: [
            {
              role: 'system',
              content: 'You are a nutrition analysis engine. When given food data and user goals, evaluate the food using the Nutrition Quality Scale (1–10) in the context of the user\'s specific goals. Never give a single universal score. Instead, give: (1) an NQS rating, (2) 2–3 goal-specific insights explaining why this food helps or hurts each goal, and (3) one practical suggestion. Be brief. No fluff.\n\nFormat your response as JSON:\n{ "nqs": 8, "summary": "one line", "goalInsights": [{"goal": "muscle gain", "verdict": "positive", "reason": "..."}], "suggestion": "..." }'
            },
            {
              role: 'user',
              content: `Analyze this food using NQS:\n\nFood: ${foodData.name}\nNutrition: ${JSON.stringify(foodData.nutrition)}\n\nUser goals:\n${JSON.stringify(goals, null, 2)}\n\nProvide analysis in JSON format.`
            }
          ]
        })
      })

      const data = await response.json()
      const result = JSON.parse(data.choices[0].message.content)
      setAnalysis(result)
      setView('results')
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Failed to analyze food. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    // Mock food data for MVP - will integrate real APIs later
    const mockFood = {
      name: searchQuery,
      nutrition: {
        servingSize: '100g',
        calories: 165,
        protein: 31,
        fat: 3.6,
        carbs: 0
      }
    }

    await analyzeFood(mockFood)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Tempo</h1>
        <p>Goal-based food analysis</p>
      </header>

      {view === 'home' && (
        <div className="home">
          <button className="primary-btn" onClick={() => setView('goals')}>
            Set Your Goals
          </button>
          <button className="secondary-btn" onClick={() => setView('search')}>
            Search Food
          </button>
        </div>
      )}

      {view === 'goals' && (
        <div className="goals">
          <h2>Set Your Goals</h2>
          <form onSubmit={(e) => { e.preventDefault(); setView('search') }}>
            <label>
              Body Composition:
              <select value={goals.bodyComposition} onChange={(e) => setGoals({...goals, bodyComposition: e.target.value})}>
                <option value="">Select...</option>
                <option value="weight loss">Weight Loss</option>
                <option value="muscle gain">Muscle Gain</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </label>

            <label>
              Dietary Preference:
              <select value={goals.dietaryPreferences[0] || ''} onChange={(e) => setGoals({...goals, dietaryPreferences: [e.target.value]})}>
                <option value="">Select...</option>
                <option value="high protein">High Protein</option>
                <option value="low carb">Low Carb</option>
                <option value="vegan">Vegan</option>
                <option value="keto">Keto</option>
              </select>
            </label>

            <button type="submit" className="primary-btn">Save Goals</button>
            <button type="button" className="secondary-btn" onClick={() => setView('home')}>Back</button>
          </form>
        </div>
      )}

      {view === 'search' && (
        <div className="search">
          <h2>Search Food</h2>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Enter food name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
            <button type="button" className="secondary-btn" onClick={() => setView('home')}>Back</button>
          </form>
        </div>
      )}

      {view === 'results' && analysis && (
        <div className="results">
          <h2>Analysis Results</h2>
          <div className="nqs-score">
            <span className="score">{analysis.nqs}</span>
            <span className="label">/10 NQS</span>
          </div>
          <p className="summary">{analysis.summary}</p>
          
          <div className="insights">
            <h3>Goal Insights</h3>
            {analysis.goalInsights.map((insight, i) => (
              <div key={i} className={`insight ${insight.verdict}`}>
                <strong>{insight.goal}:</strong> {insight.reason}
              </div>
            ))}
          </div>

          <div className="suggestion">
            <h3>Suggestion</h3>
            <p>{analysis.suggestion}</p>
          </div>

          <button className="primary-btn" onClick={() => { setView('search'); setAnalysis(null); setSearchQuery('') }}>
            Analyze Another
          </button>
        </div>
      )}
    </div>
  )
}

export default App
