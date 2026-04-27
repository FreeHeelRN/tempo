# Phase 2: Menu Planning + Shopping List

## User Flow

### 1. Menu Planning Entry
From home dashboard → "Plan This Week" button

**Initial Questions:**
- "How many meals do you want to prep this week?" (3 / 5 / 7 / 14)
- "How many servings per meal?" (1 / 2 / 4)
- "What's your budget?" (Cheap / Moderate / Premium)
- "Any foods to avoid?" (allergies, dislikes)

### 2. Menu Generation
Chuck generates personalized menu based on:
- User's goals (from onboarding)
- Budget constraints
- Serving size
- Dietary preferences
- Previous successful meals

**Output Format:**
```
MONDAY
Breakfast: Greek yogurt + berries (2 servings)
Lunch: Chicken + broccoli + rice (2 servings)
Dinner: Salmon + asparagus (2 servings)

TUESDAY
...
```

### 3. Shopping List
Auto-generated from menu, organized by store section:
- Produce
- Meat/Seafood
- Dairy
- Pantry
- Frozen

**Features:**
- Check off items as you shop
- Add custom items
- Export to iOS Reminders

### 4. iOS Reminders Export
**Method 1: Share Sheet (Native)**
- Tap "Export to Reminders"
- System share sheet opens
- Select "Reminders" app
- Creates new list "Tempo Shopping - [Date]"

**Method 2: iOS Shortcuts Integration**
- One-tap shortcut
- Automatically creates checklist in Reminders
- Pre-configured list name

## UI Screens

### Menu Planner
```
┌─────────────────────────────┐
│ 🗓️ PLAN THIS WEEK           │
│                             │
│ How many meals to prep?     │
│ [3] [5] [7] [14]           │
│                             │
│ Servings per meal?          │
│ [1] [2] [4]                │
│                             │
│ Budget?                     │
│ [Cheap] [Moderate] [Premium]│
│                             │
│ [GENERATE MENU]             │
└─────────────────────────────┘
```

### Weekly Menu View
```
┌─────────────────────────────┐
│ THIS WEEK'S MENU            │
│ 5 meals | 2 servings each   │
└─────────────────────────────┘

MON • Apr 28
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Breakfast: Greek yogurt bowl
Lunch: Chicken + broccoli
Dinner: Salmon + asparagus

TUE • Apr 29
━━━━━━━━━━━━━━━━━━━━━━━━━━━
...

[VIEW SHOPPING LIST]
[REGENERATE MENU]
```

### Shopping List
```
┌─────────────────────────────┐
│ SHOPPING LIST               │
│ 15 items • $87 estimated    │
└─────────────────────────────┘

PRODUCE
☐ Broccoli (2 lbs)
☐ Asparagus (1 bunch)
☐ Berries (2 containers)

MEAT/SEAFOOD
☐ Chicken breast (3 lbs)
☐ Salmon (1.5 lbs)

DAIRY
☐ Greek yogurt (32 oz)

[✓ EXPORT TO REMINDERS]
[+ ADD ITEM]
```

## Technical Implementation

### Menu Generation Prompt
```
Generate a {num_meals}-meal plan for {num_servings} servings each.

User profile:
- Goal: {goal}
- Budget: {budget}
- Diet: {dietary_prefs}
- Avoid: {avoid_foods}

Requirements:
- Variety (no repeats)
- Macro balance for their goal
- Realistic prep/cooking
- {budget}-friendly ingredients

Return JSON:
{
  "meals": [
    {
      "day": "Monday",
      "breakfast": {...},
      "lunch": {...},
      "dinner": {...}
    }
  ],
  "shoppingList": {
    "produce": [...],
    "meat": [...],
    "dairy": [...],
    "pantry": [...]
  },
  "estimatedCost": 87,
  "prepTime": "2 hours"
}
```

### iOS Reminders Export

**Method 1: URL Scheme**
```javascript
const reminderURL = `x-apple-reminderkit://add-reminder?title=${encodeURIComponent(item)}&list=Tempo Shopping`
window.location.href = reminderURL
```

**Method 2: Share API**
```javascript
if (navigator.share) {
  navigator.share({
    title: 'Tempo Shopping List',
    text: shoppingList.join('\n')
  })
}
```

**Method 3: iOS Shortcuts**
- Create a shortcut that accepts text input
- Parse line-by-line
- Create reminders in specified list
- User runs shortcut, pastes list

## Data Storage

```javascript
localStorage.setItem('tempo_menu', JSON.stringify({
  week: '2026-04-28',
  meals: [...],
  shoppingList: [...],
  checked: [],
  generated: timestamp
}))
```

## Phase 2 Screens Needed
1. Menu Planner (input form)
2. Weekly Menu View (meal grid)
3. Recipe Detail (ingredients, steps, macros)
4. Shopping List (checkable items)
5. Export Options (Reminders, Copy, Print)

---

Ready to build when you can deploy Phase 1.

Chuck
