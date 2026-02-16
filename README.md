# SMAuto

Short setup guide for running the frontend locally.

## Requirements
- Node.js 20+
- npm

## Setup
1. Install dependencies:
```bash
npm install
```
2. Create `.env` and add:
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Run
- Development:
```bash
npm run dev
```
- Production build:
```bash
npm run build
npm start
```

Optional server listener:
```bash
npm run listener
```
