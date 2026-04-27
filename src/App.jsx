import { useState, useEffect } from 'react'
import './App.css'
import { 
  CHUCK_ENDPOINT, 
  CHUCK_TOKEN, 
  SYSTEM_PROMPT,
  SLEEP_QUALITY_OPTIONS,
  BODY_COMP_OPTIONS,
  HEALTH_CONDITION_OPTIONS,
  DIET_PREFERENCE_OPTIONS
} from './config'

function App() {
  const [view, setView] = useState('welcome') // welcome, onboarding, search, results
  const [onboardingStep, setOnboardingStep] = useState(1) // 1: goals, 2: sleep, 3: diet
  const [profile, setProfile] = useState({
    bodyComposition: '',
    healthConditions: [],
    dietaryPreferences: '',
    sleepQuality: '',
    setupComplete: false
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  // Load profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tempoProfile')
    if (saved) {
      const parsed = JSON.parse(saved)
      setProfile(parsed)
      if (parsed.setupComplete) {
        setView('search')
      }
    }
  }, [])

  const saveProfile = (updates) => {
    const updated = { ...profile, ...updates }
    setProfile(updated)
    localStorage.setItem('tempoProfile', JSON.stringify(updated))
  }

  const analyzeFood = async (foodData) => {
    setLoading(true)
    try {
      const contextMessage = `Analyze this food using NQS:

Food: ${foodData.name}
Nutrition per ${foodData.nutrition.servingSize}:
- Calories: ${foodData.nutrition.calories}
- Protein: ${foodData.nutrition.protein}g
- Fat: ${foodData.nutrition.fat}g
- Carbs: ${foodData.nutrition.carbs}g
${foodData.nutrition.fiber ? `- Fiber: ${foodData.nutrition.fiber}g` : ''}
${foodData.nutrition.sugar ? `- Sugar: ${foodData.nutrition.sugar}g` : ''}
${foodData.nutrition.sodium ? `- Sodium: ${foodData.nutrition.sodium}mg` : ''}

User Context:
- Goal: ${profile.bodyComposition}
- Health: ${profile.healthConditions.length ? profile.healthConditions.join(', ') : 'None reported'}
- Diet: ${profile.dietaryPreferences}
- Sleep Quality: ${profile.sleepQuality}

Provide analysis in JSON format.`

      const response = await fetch(CHUCK_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CHUCK_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openclaw:main',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: contextMessage }
          ]
        })
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
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

    // Mock data for MVP - will integrate real APIs
    const mockFood = {
      name: searchQuery,
      nutrition: {
        servingSize: '100g',
        calories: 165,
        protein: 31,
        fat: 3.6,
        carbs: 0,
        fiber: 0,
        sugar: 0,
        sodium: 74
      }
    }

    await analyzeFood(mockFood)
  }

  const completeOnboarding = () => {
    saveProfile({ setupComplete: true })
    setView('search')
  }

  const toggleHealthCondition = (condition) => {
    const current = profile.healthConditions
    const updated = current.includes(condition)
      ? current.filter(c => c !== condition)
      : [...current, condition]
    setProfile({ ...profile, healthConditions: updated })
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Tempo</h1>
        <p>Food analysis tailored to you</p>
      </header>

      {view === 'welcome' && (
        <div className="welcome">
          <div className="welcome-content">
            <h2>Welcome to Tempo</h2>
            <p className="tagline">
              Unlike apps that give every food a universal score, Tempo analyzes food based on <strong>your</strong> goals, sleep, and health context.
            </p>
            <p className="subtext">
              Backed by insights from Peter Attia, Andrew Huberman, Sachin Panda, Rob Lustig, and Tim Spector.
            </p>
          </div>
          <button className="primary-btn" onClick={() => setView('onboarding')}>
            Get Started
          </button>
          {profile.setupComplete && (
            <button className="secondary-btn" onClick={() => setView('search')}>
              Skip to Search
            </button>
          )}
        </div>
      )}

      {view === 'onboarding' && (
        <div className="onboarding">
          {onboardingStep === 1 && (
            <>
              <h2>What's your primary goal?</h2>
              <div className="option-grid">
                {BODY_COMP_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`option-btn ${profile.bodyComposition === opt.value ? 'selected' : ''}`}
                    onClick={() => setProfile({ ...profile, bodyComposition: opt.value })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button 
                className="primary-btn" 
                disabled={!profile.bodyComposition}
                onClick={() => setOnboardingStep(2)}
              >
                Next
              </button>
            </>
          )}

          {onboardingStep === 2 && (
            <>
              <h2>How's your sleep?</h2>
              <p className="context-note">Sleep quality affects hunger hormones and food choices.</p>
              <div className="option-grid">
                {SLEEP_QUALITY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`option-btn ${profile.sleepQuality === opt.value ? 'selected' : ''}`}
                    onClick={() => setProfile({ ...profile, sleepQuality: opt.value })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="nav-buttons">
                <button className="secondary-btn" onClick={() => setOnboardingStep(1)}>Back</button>
                <button 
                  className="primary-btn" 
                  disabled={!profile.sleepQuality}
                  onClick={() => setOnboardingStep(3)}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {onboardingStep === 3 && (
            <>
              <h2>Dietary preference?</h2>
              <div className="option-grid">
                {DIET_PREFERENCE_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    className={`option-btn ${profile.dietaryPreferences === opt ? 'selected' : ''}`}
                    onClick={() => setProfile({ ...profile, dietaryPreferences: opt })}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <div className="nav-buttons">
                <button className="secondary-btn" onClick={() => setOnboardingStep(2)}>Back</button>
                <button 
                  className="primary-btn" 
                  disabled={!profile.dietaryPreferences}
                  onClick={completeOnboarding}
                >
                  Start Using Tempo
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {view === 'search' && (
        <div className="search">
          <div className="profile-summary">
            <p><strong>Goal:</strong> {profile.bodyComposition?.replace('_', ' ')}</p>
            <p><strong>Sleep:</strong> {profile.sleepQuality}</p>
            <button className="link-btn" onClick={() => setView('onboarding')}>Edit Profile</button>
          </div>

          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Enter food name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>

          <div className="future-features">
            <p className="coming-soon">📷 Barcode scanning coming soon</p>
          </div>
        </div>
      )}

      {view === 'results' && analysis && (
        <div className="results">
          <div className="nqs-badge">
            <div className="score">{analysis.nqs}</div>
            <div className="label">NQS</div>
          </div>

          <p className="summary">{analysis.summary}</p>
          
          <div className="insights">
            {analysis.goalInsights.map((insight, i) => (
              <div key={i} className={`insight ${insight.verdict}`}>
                <div className="insight-header">
                  <strong>{insight.goal}</strong>
                  <span className={`verdict-badge ${insight.verdict}`}>
                    {insight.verdict === 'positive' ? '✓' : insight.verdict === 'negative' ? '✗' : '~'}
                  </span>
                </div>
                <p>{insight.reason}</p>
              </div>
            ))}
          </div>

          {analysis.suggestion && (
            <div className="suggestion">
              <h3>💡 Suggestion</h3>
              <p>{analysis.suggestion}</p>
            </div>
          )}

          <button 
            className="primary-btn" 
            onClick={() => { 
              setView('search')
              setAnalysis(null)
              setSearchQuery('') 
            }}
          >
            Analyze Another
          </button>
        </div>
      )}
    </div>
  )
}

export default App
