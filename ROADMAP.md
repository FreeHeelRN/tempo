# Tempo - Development Roadmap

## Phase 1: Chat + Meal Logging (Current)
**Goal:** Conversational AI coach with real-time meal feedback

### Features
- ✅ Conversational onboarding (asks about current habits, goals, sleep)
- ✅ Persistent chat with Chuck (context-aware, remembers conversation)
- ✅ Meal logging (text entry: "grilled chicken + broccoli")
- ✅ Real-time analysis per meal (NQS score + goal-specific feedback)
- ✅ Daily personalized tip card (rotates daily, filtered by user goals)
- ✅ Quick stats dashboard (meals today, recent weight, sleep)
- ✅ Sleep + weight tracking
- ✅ localStorage persistence (chat history, user profile, logged meals)

### Tech Stack
- React + Vite
- Chuck API (Claude Sonnet 4.5)
- localStorage (no backend yet)
- PWA-ready (manifest, service worker)

### Screens
1. **Welcome** → conversational onboarding
2. **Home Dashboard** → daily tip, quick stats, action buttons
3. **Chat** → persistent conversation with Chuck
4. **Log Meal** → text entry, Chuck analyzes in real-time
5. **Stats** → weight/sleep tracking, meal history

---

## Phase 2: Menu Planning + Shopping List (Next)
**Goal:** Automated meal prep planning with export to iOS Reminders

### Features
- [ ] Menu builder: "How many meals/week?" → Chuck generates personalized menu
- [ ] Shopping list generation (aggregated ingredients)
- [ ] iOS Reminders export (via iOS Shortcuts or share sheet)
- [ ] Recipe detail view (ingredients, instructions, macros)
- [ ] Budget-aware menu planning (cheap/moderate/premium)
- [ ] Meal prep mode (batch cooking optimization)

### New Screens
6. **Menu Planner** → configure meals/week, preferences
7. **Weekly Menu** → breakfast/lunch/dinner grid
8. **Shopping List** → categorized by store section, export button
9. **Recipe Detail** → full recipe with nutritional breakdown

---

## Phase 3: Enhanced Features (Future)
- [ ] Barcode scanning (BarcodeDetector API or ZXing)
- [ ] Photo meal logging (image → AI analysis)
- [ ] Open Food Facts integration (packaged foods)
- [ ] USDA FoodData Central integration (whole foods)
- [ ] User accounts (Firebase or Supabase)
- [ ] Progress photos + body composition tracking
- [ ] Community features (share recipes, tips)
- [ ] Native iOS app (React Native or Capacitor wrapper)

---

## Design System
**Colors:**
- Deep green: #1B4332
- Medium green: #2D6A4F
- Light green: #52B788
- Background: #F4FAF6
- White: #FFFFFF

**Typography:**
- Headers: SF Pro Display (iOS) / -apple-system
- Body: SF Pro Text

**NQS Badge Colors:**
- 1-2: Red (#DC2626)
- 3-4: Orange (#EA580C)
- 5-6: Yellow (#CA8A04)
- 7-8: Green (#16A34A)
- 9-10: Dark Green (#15803D)
