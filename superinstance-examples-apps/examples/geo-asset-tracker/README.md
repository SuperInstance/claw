# Geographic Asset Tracker

Production-ready mobile application for tracking assets with geographic positioning and FPS perspective filtering.

## Overview

A mobile application that tracks assets across geographic regions using SuperInstance's spatial indexing and perspective-based filtering.

## Features

### Spatial Tracking
- GPS-based asset positioning
- Real-time location updates
- Geofencing and alerts
- Spatial queries with KD-tree

### FPS Perspective Filtering
- Agent-based view filtering
- Orientation-based relevance
- Distance-based prioritization
- Asymmetric information

### Dodecet Encoding
- Efficient location storage
- 12-bit geometric encoding
- Reduced memory footprint
- Fast spatial operations

## Tech Stack

- **Frontend:** React Native, TypeScript
- **Maps:** Mapbox, Google Maps
- **Backend:** Node.js, PostgreSQL
- **Spatial:** constrainttheory, dodecet-encoder

## Quick Start

```bash
# Install dependencies
npm install

# iOS
npm run ios

# Android
npm run android
```

## Usage

### Track Asset

```typescript
import { AssetTracker } from './services/AssetTracker';

const tracker = new AssetTracker({
  endpoint: 'http://localhost:3000',
  apiKey: process.env.API_KEY
});

// Update asset location
await tracker.updateLocation(assetId, {
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: 10
});
```

### Query Nearby Assets

```typescript
import { GeoEngine } from '@superinstance/constrainttheory';

const geo = new GeoEngine();

// Create agent for perspective
const agentId = await geo.createAgent({
  position: [lat, lon, alt],
  orientation: [heading, pitch, roll]
});

// Query from perspective
const nearby = await geo.queryFromPerspective(agentId, {
  radius: 1000, // 1km
  fieldOfView: Math.PI / 2
});
```

### Set Geofence

```typescript
await tracker.setGeofence(assetId, {
  latitude: 37.7749,
  longitude: -122.4194,
  radius: 500,
  onExit: async (asset) => {
    console.log('Asset exited geofence:', asset.id);
    await sendAlert(asset);
  }
});
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Geographic Asset Tracker                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Mobile App (React Native)                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Map View                          Asset List         │    │
│  │  • Real-time tracking            • Filtered by pos   │    │
│  │  • GPS updates                   • FPS perspective   │    │
│  │  • Geofences                     • Alerts            │    │
│  └─────────────────────────────────────────────────────┘    │
│                           ↓↑ WebSocket                       │
│  Backend API                                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Location Service                  Asset Manager     │    │
│  │  • GPS processing                • CRUD operations   │    │
│  │  • Geofence logic                • Status updates    │    │
│  │  • Spatial queries               • Alert system     │    │
│  └─────────────────────────────────────────────────────┘    │
│                           ↓↑                                 │
│  Spatial Engine (constrainttheory)                            │
│  ┌──────────────────┐      ┌──────────────────┐             │
│  │  KD-tree Index   │      │  Dodecet Enc.    │             │
│  │  • Fast lookup   │      │  • 12-bit loc    │             │
│  │  • FPS filter    │      │  • Compact       │             │
│  │  • Perspective   │      │  • Efficient     │             │
│  └──────────────────┘      └──────────────────┘             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Performance

| Metric | Value |
|--------|-------|
| Assets Tracked | 10,000+ |
| Location Updates | ~5ms |
| Spatial Queries | ~2ms |
| Memory Usage | ~200MB |
| Battery Impact | Low |

## Testing

```bash
npm test
```

## Deployment

```bash
# iOS
npm run build:ios
open ios/Runner.xcworkspace

# Android
npm run build:android
```

## License

MIT
