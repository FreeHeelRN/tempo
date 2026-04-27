import { useState, useEffect, useRef } from 'react'
import './App.css'
import { CHUCK_ENDPOINT, CHUCK_TOKEN } from './config'

const SYSTEM_PROMPT = `You are Chuck, the AI coach behind Tempo — a nutrition app built on the science of Peter Attia (metabolic health, body composition, protein adequacy ~1g/lb target body weight, DEXA > scale), Andrew Huberman (sleep, cortisol, circadian rhythm), and Sachin Panda (time-restricted eating, 10–12 hour eating windows, front-load calories earlier in the day).

The scale is a poor proxy for body composition — reference DEXA and Hume Pod body composition scales when relevant. Poor sleep raises cortisol and ghrelin — factor in user's sleep data.

IMPORTANT: If user is lifting weights + eating high protein, the scale won't move much because muscle gain masks fat loss. Emphasize this during onboarding and when they express frustration about scale not moving. Recommend DEXA scans (gold standard), measuring tape (waist/hips), or 8-electrode scales like Hume Pod to track real body composition changes.

Tone: direct, encouraging, knowledgeable friend. Reference expert frameworks naturally (Attia's focus on body composition over scale weight, Huberman's circadian/sleep science, Panda's time-restricted eating research) but DO NOT quote them directly unless it's an actual quote. Keep responses short (2-3 sentences unless providing detailed feedback). Ask ONE question at a time during onboarding.

When analyzing meals, respond with JSON:
{"summary": "<one sentence>", "goalInsights": [{"goal": "<name>", "verdict": "positive|neutral|caution", "reason": "<1-2 sentences>"}], "suggestion": "<one tip>", "encouragement": "<optional motivating line>"}

During onboarding, gather:
1. What tracking tools they currently use (Apple Watch, Fitbit, Whoop, Oura, smart scale like Hume Pod/Withings/DEXA access, food tracking apps, etc.)
2. What they're currently doing for nutrition
3. What they've tried before
4. What worked and what didn't
5. Their weight/body composition goal
6. How aggressive they want to be
7. Their sleep quality

Note their tracking setup so you can:
- Reference their existing data sources
- Suggest better alternatives if relevant (e.g., if they use a regular scale, mention DEXA or Hume Pod for body composition)
- Tailor advice based on what metrics they can already track

After onboarding, you're their ongoing coach. Answer questions, analyze meals, provide encouragement, and adjust advice based on their logged data.`;

const DAILY_TIPS = [
  "DEXA scans show body composition better than scale weight. Consider one every 3-6 months.",
  "Target ~1g protein per lb of target body weight distributed across meals.",
  "Poor sleep raises cortisol and ghrelin — fat loss is nearly impossible on chronic sleep deprivation.",
  "Get bright light in eyes within 30-60 min of waking to anchor circadian rhythm.",
  "Eat within a consistent 10-12 hour window. Same food at 7am vs 10pm = different metabolic outcome.",
  "Stop eating 2-3 hours before bed. Late eating disrupts overnight metabolic repair.",
  "Zone 2 cardio 3-4x/week is one of the highest-leverage cardiovascular investments.",
  "Consistency of eating window matters more than perfection.",
  "Lifting + high protein = muscle gain can mask fat loss. The scale won't move much. Use DEXA, measuring tape, or 8-electrode scale like Hume Pod to see real progress."
]

const CARD_TYPES = [
  { id: 'weight', label: 'Weight', icon: '⚖️', prompt: 'Enter current weight (lbs)' },
  { id: 'sleep', label: 'Sleep', icon: '😴', prompt: 'Hours slept last night' },
  { id: 'meals', label: 'Meals Today', icon: '🍽️', prompt: null },
  { id: 'streak', label: 'Streak', icon: '🎯', prompt: null },
  { id: 'water', label: 'Water', icon: '💧', prompt: 'Cups of water today' },
  { id: 'steps', label: 'Steps', icon: '👟', prompt: 'Steps today' }
]

function App() {
  const [view, setView] = useState('welcome')
  const [chatHistory, setChatHistory] = useState([])
  const [userProfile, setUserProfile] = useState({})
  const [meals, setMeals] = useState([])
  const [stats, setStats] = useState({})
  const [dashboardCards, setDashboardCards] = useState(['weight', 'sleep', 'meals', 'streak'])
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [editingCard, setEditingCard] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const savedProfile = localStorage.getItem('tempo_profile')
    const savedChat = localStorage.getItem('tempo_chat')
    const savedMeals = localStorage.getItem('tempo_meals')
    const savedStats = localStorage.getItem('tempo_stats')
    const savedCards = localStorage.getItem('tempo_cards')
    
    if (savedProfile) setUserProfile(JSON.parse(savedProfile))
    if (savedChat) setChatHistory(JSON.parse(savedChat))
    if (savedMeals) setMeals(JSON.parse(savedMeals))
    if (savedStats) setStats(JSON.parse(savedStats))
    if (savedCards) setDashboardCards(JSON.parse(savedCards))
    
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
    localStorage.setItem('tempo_stats', JSON.stringify(stats))
  }, [stats])

  useEffect(() => {
    localStorage.setItem('tempo_cards', JSON.stringify(dashboardCards))
  }, [dashboardCards])

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

  const updateStat = (cardId, value) => {
    setStats({
      ...stats,
      [cardId]: {
        value,
        timestamp: new Date().toISOString()
      }
    })
    setEditingCard(null)
  }

  const getTodaysTip = () => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
    return DAILY_TIPS[dayOfYear % DAILY_TIPS.length]
  }

  const getMealsToday = () => {
    const today = new Date().toDateString()
    return meals.filter(m => new Date(m.timestamp).toDateString() === today)
  }

  const getCardValue = (cardId) => {
    switch(cardId) {
      case 'weight':
        return stats.weight ? `${stats.weight.value} lbs` : '--'
      case 'sleep':
        return stats.sleep ? `${stats.sleep.value} hrs` : '--'
      case 'meals':
        return `${getMealsToday().length} today`
      case 'streak':
        return stats.streak ? `${stats.streak.value} days` : '0 days'
      case 'water':
        return stats.water ? `${stats.water.value} / 8` : '0 / 8'
      case 'steps':
        return stats.steps ? stats.steps.value.toLocaleString() : '--'
      default:
        return '--'
    }
  }

  const getCardType = (id) => CARD_TYPES.find(c => c.id === id)

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
          <div className="greeting">
            <h2>Good Morning 👋</h2>
          </div>

          <div className="daily-tip">
            <h3>💡 Today's Tip</h3>
            <p>{getTodaysTip()}</p>
          </div>

          <div className="stat-cards">
            {dashboardCards.map(cardId => {
              const card = getCardType(cardId)
              return (
                <div 
                  key={cardId} 
                  className="stat-card"
                  onClick={() => card.prompt && setEditingCard(cardId)}
                >
                  <div className="stat-icon">{card.icon}</div>
                  <div className="stat-value">{getCardValue(cardId)}</div>
                  <div className="stat-label">{card.label}</div>
                </div>
              )
            })}
          </div>

          <button className="customize-btn" onClick={() => setView('customize')}>
            ⚙️ Customize Cards
          </button>

          <div className="action-buttons">
            <button className="action-btn primary" onClick={() => setView('logMeal')}>
              📝 Log Meal
            </button>
            <button className="action-btn" onClick={() => setView('chat')}>
              💬 Chat with Chuck
            </button>
          </div>

          {meals.length > 0 && (
            <div className="recent-meals">
              <h3>Recent Meals</h3>
              {meals.slice(0, 3).map(meal => (
                <div key={meal.id} className="meal-card">
                  <div className="meal-header">
                    <span className="meal-desc">{meal.description}</span>
                    <span className="meal-time">
                      {new Date(meal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="meal-summary">{meal.analysis.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'customize' && (
        <div className="customize-view">
          <div className="view-header">
            <button className="back-btn" onClick={() => setView('home')}>←</button>
            <h2>Customize Dashboard</h2>
            <div></div>
          </div>
          <div className="customize-content">
            <p className="instruction">Select 4 cards to show on your dashboard:</p>
            <div className="card-selector">
              {CARD_TYPES.map(card => (
                <button
                  key={card.id}
                  className={`card-option ${dashboardCards.includes(card.id) ? 'selected' : ''}`}
                  onClick={() => {
                    if (dashboardCards.includes(card.id)) {
                      setDashboardCards(dashboardCards.filter(c => c !== card.id))
                    } else if (dashboardCards.length < 4) {
                      setDashboardCards([...dashboardCards, card.id])
                    }
                  }}
                  disabled={!dashboardCards.includes(card.id) && dashboardCards.length >= 4}
                >
                  {card.icon} {card.label}
                </button>
              ))}
            </div>
            <button className="btn-primary" onClick={() => setView('home')}>
              Save
            </button>
          </div>
        </div>
      )}

      {editingCard && (
        <div className="modal">
          <div className="modal-content">
            <h3>{getCardType(editingCard).prompt}</h3>
            <input
              type="number"
              autoFocus
              placeholder="Enter value"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value) {
                  updateStat(editingCard, e.target.value)
                }
              }}
            />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setEditingCard(null)}>Cancel</button>
              <button 
                className="btn-primary"
                onClick={(e) => {
                  const modal = e.target.closest('.modal-content')
                  const input = modal.querySelector('input')
                  if (input && input.value) updateStat(editingCard, input.value)
                }}
              >
                Save
              </button>
            </div>
          </div>
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
            <p className="instruction">What did you just eat?</p>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., Grilled chicken breast with broccoli and brown rice"
              rows="4"
              autoFocus
            />
            <button 
              className="btn-primary"
              onClick={() => logMeal(input)}
              disabled={loading || !input.trim()}
            >
              {loading ? 'Analyzing...' : 'Log & Analyze'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
