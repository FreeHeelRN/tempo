import { useState, useEffect, useRef } from 'react'
import './App.css'
import { CHUCK_ENDPOINT, CHUCK_TOKEN } from './config'

const SYSTEM_PROMPT = `You are Chuck, the AI coach behind Tempo — a nutrition app built on the science of Peter Attia (metabolic health, body composition, protein adequacy ~1g/lb target body weight, DEXA > scale), Andrew Huberman (sleep, cortisol, circadian rhythm), and Sachin Panda (time-restricted eating, 10–12 hour eating windows, front-load calories earlier in the day).

The scale is a poor proxy for body composition — reference DEXA and Hume Pod body composition scales when relevant. Poor sleep raises cortisol and ghrelin — factor in user's sleep data.

IMPORTANT: If user is lifting weights + eating high protein, the scale won't move much because muscle gain masks fat loss. Emphasize this during onboarding and when they express frustration about scale not moving. Recommend DEXA scans (gold standard), measuring tape (waist/hips), or 8-electrode scales like Hume Pod to track real body composition changes.

Tone: direct, encouraging, knowledgeable friend. Weave in expert perspectives naturally. Keep responses short (2-3 sentences unless providing detailed feedback). Ask ONE question at a time during onboarding.

When analyzing meals, respond with JSON:
{"nqs": <1-10>, "summary": "<one sentence>", "goalInsights": [{"goal": "<name>", "verdict": "positive|neutral|caution", "reason": "<1-2 sentences>"}], "suggestion": "<one tip>", "encouragement": "<optional motivating line>"}

During onboarding, gather:
1. What they're currently doing for nutrition
2. What they've tried before
3. What worked and what didn't
4. Their weight/body composition goal
5. How aggressive they want to be
6. Their sleep quality
7. What tracking tools they currently use (Apple Watch, Fitbit, Whoop, Oura, smart scale like Hume Pod/Withings/DEXA access, food tracking apps, etc.)

Note their tracking setup so you can:
- Reference their existing data sources
- Suggest better alternatives if relevant (e.g., if they use a regular scale, mention DEXA or Hume Pod for body composition)
- Tailor advice based on what metrics they can already track

After onboarding, you're their ongoing coach. Answer questions, analyze meals, provide encouragement, and adjust advice based on their logged data.`;

const DAILY_TIPS = [
  "DEXA > scale for body comp. Consider one every 3-6 months. (Attia)",
  "Target ~1g protein per lb of target body weight distributed across meals. (Attia)",
  "Poor sleep raises cortisol and ghrelin — fat loss is nearly impossible on chronic sleep deprivation. (Huberman)",
  "Get bright light in eyes within 30-60 min of waking to anchor circadian rhythm. (Huberman)",
  "Eat within a consistent 10-12 hour window. Same food at 7am vs 10pm = different metabolic outcome. (Panda)",
  "Stop eating 2-3 hours before bed. Late eating disrupts overnight metabolic repair. (Panda)",
  "Zone 2 cardio 3-4x/week is the highest-leverage cardiovascular investment. (Attia)",
  "Consistency of eating window matters more than perfection. (Panda)",
  "Lifting + high protein = muscle gain can mask fat loss. The scale won't move much. Use DEXA, measuring tape, or 8-electrode scale like Hume Pod to see real progress. (Attia)"
]

function App() {
  const [view, setView] = useState('welcome') // welcome, chat, logMeal, stats
  const [chatHistory, setChatHistory] = useState([])
  const [userProfile, setUserProfile] = useState({})
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const savedProfile = localStorage.getItem('tempo_profile')
    const savedChat = localStorage.getItem('tempo_chat')
    const savedMeals = localStorage.getItem('tempo_meals')
    
    if (savedProfile) setUserProfile(JSON.parse(savedProfile))
    if (savedChat) setChatHistory(JSON.parse(savedChat))
    if (savedMeals) setMeals(JSON.parse(savedMeals))
    
    if (savedProfile && savedChat) {
      setView('home')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('tempo_chat', JSON.stringify(chatHistory))
  }, [chatHistory])

  useEffect(() => {
    localStorage.setItem('tempo_profile', JSON.stringify(userProfile))
  }, [userProfile])

  useEffect(() => {
    localStorage.setItem('tempo_meals', JSON.stringify(meals))
  }, [meals])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const startOnboarding = () => {
    setView('chat')
    setChatHistory([{
      role: 'chuck',
      content: "Hey! I'm Chuck, your nutrition coach. Let's figure out what's going to work best for you.\n\nFirst, tell me: What are you currently using to track your health? (Apple Watch, Fitbit, Whoop, Oura, smart scale, food tracking apps, or nothing yet?)"
    }])
  }

  const sendMessage = async (message) => {
    if (!message?.trim()) return

    const newHistory = [...chatHistory, { role: 'user', content: message }]
    setChatHistory(newHistory)
    setInput('')
    setLoading(true)

    try {
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
            ...newHistory.map(m => ({
              role: m.role === 'chuck' ? 'assistant' : 'user',
              content: m.content
            }))
          ]
        })
      })

      const data = await response.json()
      const reply = data.choices[0].message.content

      setChatHistory([...newHistory, { role: 'chuck', content: reply }])
    } catch (error) {
      console.error('Chat error:', error)
      setChatHistory([...newHistory, { role: 'system', content: 'Failed to connect. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const logMeal = async (mealDescription) => {
    if (!mealDescription?.trim()) return

    setLoading(true)
    const timestamp = new Date().toISOString()

    try {
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
            { 
              role: 'user', 
              content: `Analyze this meal for my goals:\n\nMeal: ${mealDescription}\n\nMy profile:\n${JSON.stringify(userProfile, null, 2)}\n\nProvide analysis as JSON.`
            }
          ]
        })
      })

      const data = await response.json()
      const analysis = JSON.parse(data.choices[0].message.content)

      const newMeal = {
        id: Date.now(),
        timestamp,
        description: mealDescription,
        analysis
      }

      setMeals([newMeal, ...meals])
      setView('home')
      
      // Add to chat history
      setChatHistory([
        ...chatHistory,
        { role: 'user', content: `I just ate: ${mealDescription}` },
        { role: 'chuck', content: `${analysis.summary}\n\n${analysis.suggestion}` }
      ])
    } catch (error) {
      console.error('Meal analysis error:', error)
      alert('Failed to analyze meal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getTodaysTip = () => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
    return DAILY_TIPS[dayOfYear % DAILY_TIPS.length]
  }

  const getMealsToday = () => {
    const today = new Date().toDateString()
    return meals.filter(m => new Date(m.timestamp).toDateString() === today)
  }

  return (
    <div className="app">
      {view === 'welcome' && (
        <div className="welcome">
          <div className="welcome-content">
            <h1>🥗 Tempo</h1>
            <p className="tagline">Your AI nutrition coach</p>
            <p className="subtext">
              Built on science from Attia, Huberman, and Panda. Personalized to your goals.
            </p>
          </div>
          <div className="welcome-actions">
            <button className="btn-primary" onClick={startOnboarding}>Get Started</button>
            {userProfile.onboardingComplete && (
              <button className="btn-secondary" onClick={() => setView('home')}>Continue</button>
            )}
          </div>
        </div>
      )}

      {view === 'home' && (
        <div className="home">
          <div className="daily-tip">
            <h3>💡 Today's Tip</h3>
            <p>{getTodaysTip()}</p>
          </div>

          <div className="quick-stats">
            <div className="stat-card">
              <span className="stat-value">{getMealsToday().length}</span>
              <span className="stat-label">Meals Today</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{userProfile.lastWeight || '--'}</span>
              <span className="stat-label">Last Weight</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{userProfile.lastSleep || '--'}</span>
              <span className="stat-label">Last Sleep</span>
            </div>
          </div>

          <div className="action-buttons">
            <button className="action-btn" onClick={() => setView('logMeal')}>
              📝 Log Meal
            </button>
            <button className="action-btn" onClick={() => setView('chat')}>
              💬 Chat with Chuck
            </button>
            <button className="action-btn" onClick={() => setView('stats')}>
              📊 View Stats
            </button>
          </div>

          {meals.length > 0 && (
            <div className="recent-meals">
              <h3>Recent Meals</h3>
              {meals.slice(0, 3).map(meal => (
                <div key={meal.id} className="meal-card">
                  <div className="meal-header">
                    <span className="meal-desc">{meal.description}</span>
                    <span className={`nqs-badge nqs-${Math.floor(meal.analysis.nqs)}`}>
                      {meal.analysis.nqs}
                    </span>
                  </div>
                  <p className="meal-summary">{meal.analysis.summary}</p>
                  <span className="meal-time">
                    {new Date(meal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'chat' && (
        <div className="chat-view">
          <div className="chat-header">
            <button className="back-btn" onClick={() => setView('home')}>←</button>
            <h2>Chuck</h2>
            <div></div>
          </div>
          <div className="chat-messages">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Type your message..."
              disabled={loading}
            />
            <button onClick={() => sendMessage(input)} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      )}

      {view === 'logMeal' && (
        <div className="log-meal-view">
          <div className="view-header">
            <button className="back-btn" onClick={() => setView('home')}>←</button>
            <h2>Log Meal</h2>
            <div></div>
          </div>
          <div className="log-meal-content">
            <p className="instruction">Describe what you just ate:</p>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., Grilled chicken breast with broccoli and brown rice"
              rows="4"
            />
            <button 
              className="btn-primary"
              onClick={() => logMeal(input)}
              disabled={loading || !input.trim()}
            >
              {loading ? 'Analyzing...' : 'Analyze Meal'}
            </button>
          </div>
        </div>
      )}

      {view === 'stats' && (
        <div className="stats-view">
          <div className="view-header">
            <button className="back-btn" onClick={() => setView('home')}>←</button>
            <h2>Stats</h2>
            <div></div>
          </div>
          <div className="stats-content">
            <p>Stats tracking coming soon...</p>
            <p>Total meals logged: {meals.length}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
