# EasyJob - Your AI-powered career assistant

A full-stack web application for CV editing, project polishing, and cover letter writing with AI assistance.

## Project Structure

```
EasyJob/
├── frontend/          # React + Vite + TypeScript frontend
├── backend/          # Node.js + Express + TypeScript backend
└── README.md         # This file
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn or pnpm
- PostgreSQL (for database)

## Setup Instructions

### 1. Database Setup

First, make sure PostgreSQL is running and create a database:

```bash
createdb easyjob
```

Or using psql:
```sql
CREATE DATABASE easyjob;
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and update DATABASE_URL and JWT_SECRET if needed
npm run init-db  # 初始化数据库表
npm run dev
```

The backend will run on `http://localhost:4000`

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if you need to change API base URL
npm run dev
```

The frontend will run on `http://localhost:3000`

## Environment Variables

### Backend (.env)

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/easyjob
JWT_SECRET=your-secret-key-change-in-production  # Required for authentication
LLM_API_KEY=your_api_key_here  # Optional, for future LLM integration
LLM_API_URL=https://api.example.com/v1  # Optional
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## Development

- **Frontend**: `cd frontend && npm run dev`
- **Backend**: `cd backend && npm run dev`

## Features (Current Status)

- ✅ Home page with 3 feature cards
- ✅ Routing setup for all 3 features
- ✅ Backend API structure with placeholder endpoints
- ✅ Database connection configuration
- ✅ LLM service placeholder for future integration
- ✅ User authentication (login, register with email verification code)
- ✅ JWT token-based authentication
- ✅ Password encryption with bcrypt

## Future Development

- CV Editor: Detailed implementation with AI suggestions
- Project Polish: AI-powered project description enhancement
- Cover Letter Writing: Automated cover letter generation

## Deployment

The project is structured to be easily deployable to cloud servers or Docker containers. Configuration files and environment variables are set up to support both local development and production deployment.

