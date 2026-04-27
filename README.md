# Tempo - Food Goal Tracker

Goal-based food analysis using the Nutrition Quality Scale (NQS).

## Features (MVP)

- ✅ Set personal goals (body composition, diet preferences)
- ✅ Search foods by name
- ✅ AI-powered analysis via Chuck (Claude Sonnet 4.5)
- ✅ Goal-specific insights (not universal scoring)
- ✅ PWA-ready (mobile-first design)

## Roadmap

- [ ] Barcode scanning
- [ ] Open Food Facts integration
- [ ] USDA FoodData Central integration
- [ ] User accounts & saved history
- [ ] Offline mode (service worker)
- [ ] Native iOS app wrapper

## Tech Stack

- React + Vite
- Chuck API (OpenClaw gateway)
- Nutrition Quality Scale (1-10)

## Development

```bash
npm install
npm run dev
```

## Deployment

Built on Heyron server. Access via:
```
http://c3-0108.c3.heyron.ai:3000
```

## Author

Ky Harvey (FreeHeelRN)  
Analysis engine: Chuck (Claude Sonnet 4.5)
