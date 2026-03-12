# Nexus CRM — Network Intelligence Platform

A relationship management platform that models professional connections as an **interactive force-directed network graph**, not a traditional list. Built with React, TypeScript, D3.js, and Firebase.

---

## ✨ Features

- **Interactive Network Graph** — D3.js force-directed visualization with zoom, pan, and drag
- **Node Types** — People, Companies, Opportunities, and Projects
- **Relationship Edges** — 10 edge types (introduction, collaboration, reports_to, influences, etc.)
- **Relationship Strength** — Weak / Moderate / Strong connections with visual encoding
- **Graph Intelligence** — Key influencer detection (degree centrality), BFS path finding, connected component analysis
- **Firebase Auth** — Email/password + Google OAuth sign-in
- **Firestore** — Real-time data sync with per-user security rules
- **Dashboard** — Stats, influencer ranking, recent activity
- **Contacts List** — Searchable, filterable table of all nodes
- **Clean Architecture** — Strict separation of services, hooks, and UI components

---

## 🏗️ Architecture

```
src/
├── config/
│   └── firebase.ts          # Firebase app init
├── types/
│   └── index.ts             # All TypeScript interfaces
├── services/                # ← Pure logic, no React
│   ├── auth.service.ts      # Firebase Auth operations
│   └── firestore.service.ts # Firestore CRUD operations
├── contexts/
│   └── AuthContext.tsx      # Auth state provider
├── hooks/                   # ← React logic layer
│   ├── useAuth.ts           # Auth operations + navigation
│   ├── useNodes.ts          # Node CRUD with real-time sync
│   ├── useEdges.ts          # Edge CRUD with real-time sync
│   └── useGraph.ts          # Graph state, filtering, connect mode
├── utils/
│   ├── graph.utils.ts       # BFS, centrality, graph algorithms
│   └── node.utils.ts        # Colors, icons, formatters
├── components/              # ← Pure UI, no business logic
│   ├── auth/
│   │   └── AuthForms.tsx
│   ├── layout/
│   │   └── AppLayout.tsx
│   ├── graph/
│   │   ├── NetworkGraph.tsx  # D3 visualization component
│   │   └── GraphControls.tsx # Search, filters, action buttons
│   ├── panels/
│   │   ├── NodeDetailPanel.tsx
│   │   ├── AddNodeModal.tsx
│   │   └── AddEdgeModal.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Badge.tsx
└── pages/
    ├── AuthPage.tsx
    ├── DashboardPage.tsx
    ├── GraphPage.tsx
    ├── ContactsPage.tsx
    └── SettingsPage.tsx
```

---

## 🚀 Getting Started

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Sign-in methods → Email/Password + Google
4. Enable **Firestore Database** (start in test mode, then apply security rules)
5. Go to Project Settings → Web app → copy config values

### 2. Environment Variables

```bash
cp .env.example .env
```

Fill in your Firebase config values in `.env`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3. Install & Run

```bash
npm install
npm run dev
```

### 4. Firestore Security Rules

Copy the contents of `firestore.rules` into your Firebase Console → Firestore → Rules tab and publish.

### 5. Build for Production

```bash
npm run build
```

---

## 🎮 Usage Guide

### Adding Nodes
1. Open **Network Graph** page
2. Click **Add Node** → choose type (Person / Company / Opportunity / Project)
3. Fill in details and save
4. Node appears in the force-directed graph

### Connecting Nodes
**Method 1 — Quick connect from panel:**
1. Click a node to open its detail panel
2. Click **Connect** button
3. Click another node to create the connection
4. Fill in relationship details

**Method 2 — Add Edge modal:**
1. Click **Connect** in the toolbar
2. Choose source and target nodes from dropdowns

### Graph Navigation
- **Zoom** — Mouse wheel / pinch
- **Pan** — Click and drag the canvas
- **Select** — Click any node
- **Drag nodes** — Drag individual nodes to rearrange

### Intelligence Features
- **Dashboard → Key Influencers** — Nodes with most connections (degree centrality)
- **Network Clusters** — Count of connected components in your network
- **Relationship strength** — Visualized as line thickness and opacity

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Graph | D3.js v7 (force simulation) |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Routing | React Router v6 |
| Icons | Lucide React |

---

## 📋 Firestore Data Model

### `/nodes/{nodeId}`
```typescript
{
  id: string
  type: 'person' | 'company' | 'opportunity' | 'project'
  label: string
  description?: string
  email?: string
  phone?: string
  website?: string
  tags: string[]
  // Type-specific fields...
  userId: string        // ← Used in security rules
  createdAt: string
  updatedAt: string
}
```

### `/edges/{edgeId}`
```typescript
{
  id: string
  sourceId: string
  targetId: string
  type: EdgeType
  strength: 'weak' | 'moderate' | 'strong'
  label?: string
  notes?: string
  userId: string
  createdAt: string
  updatedAt: string
}
```
