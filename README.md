# Recruiter Evaluation App

An AI-powered candidate evaluation system that helps recruiters make data-driven hiring decisions using Claude AI.

## Features

- **Job Management**: Create and manage job postings with detailed requirements
- **Candidate Tracking**: Add candidates with resumes, cover letters, and supporting materials
- **AI Evaluation**: Automated candidate assessments using Claude Haiku API
- **Smart Ranking**: Rank candidates based on AI evaluations and manual input
- **Cost Tracking**: Monitor API usage and costs per evaluation

## Tech Stack

**Frontend:**
- Vite + React
- Tailwind CSS
- React Router
- React Query
- Supabase Client

**Backend:**
- Supabase (PostgreSQL, Storage, Edge Functions)
- Python Serverless Functions (Vercel)
- Claude Haiku API (Anthropic)

**Deployment:**
- Vercel (Frontend + API)
- Supabase (Database)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Supabase account
- Anthropic API key
- Vercel account (for deployment)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd recruiter-evaluation-app
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration:
   ```bash
   # Copy the contents of supabase/migrations/001_initial_schema.sql
   # Paste and run in Supabase SQL Editor
   ```
3. Get your project credentials:
   - Go to **Settings** → **API**
   - Copy **Project URL** and **anon public** key

### 3. Set Up Frontend

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your Supabase credentials:
# VITE_SUPABASE_URL=your-supabase-project-url
# VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Set Up Python API

```bash
cd ../api

# Create .env file
cp .env.example .env

# Edit .env and add your Anthropic API key:
# ANTHROPIC_API_KEY=your-anthropic-api-key
```

### 5. Run Locally

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:3000`

**Terminal 2 - API (Optional for local testing):**
```bash
cd api
python -m http.server 8000
```

### 6. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Configure environment variables in Vercel:
   - Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - API: `ANTHROPIC_API_KEY`
4. Deploy!

## Project Structure

```
recruiter-evaluation-app/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   │   ├── jobs/         # Job-related components
│   │   │   ├── candidates/   # Candidate components (Phase 2)
│   │   │   ├── evaluations/  # Evaluation components (Phase 3)
│   │   │   ├── ui/           # Reusable UI components
│   │   │   └── layout/       # Layout components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # React Query hooks
│   │   ├── services/         # API services
│   │   └── utils/            # Utility functions
│   └── package.json
│
├── api/                      # Python serverless functions
│   ├── parse_resume.py       # Resume parsing (PDF/DOCX)
│   ├── evaluate_candidate.py # Claude API integration
│   └── requirements.txt
│
├── supabase/
│   └── migrations/           # Database migrations
│       └── 001_initial_schema.sql
│
└── README.md
```

## Database Schema

- **jobs**: Job postings with requirements
- **candidates**: Candidate profiles and materials
- **evaluations**: AI-generated candidate assessments
- **candidate_rankings**: Manual ranking overrides

## API Endpoints

**POST /api/parse_resume**
- Extracts text from PDF or DOCX resume files
- Input: `{ file_data: base64, file_type: 'pdf'|'docx' }`
- Output: `{ text: string, length: number }`

**POST /api/evaluate_candidate**
- Evaluates candidate using Claude Haiku
- Input: `{ job: {...}, candidate: {...} }`
- Output: `{ evaluation: {...}, usage: {...}, cost: number }`

## Cost Estimates

**Claude Haiku Pricing:**
- Input: $0.25 per million tokens
- Output: $1.25 per million tokens

**Per Evaluation:** ~$0.003 (much cheaper than Sonnet!)
- 100 candidates: ~$0.30
- 1,000 candidates: ~$3.00

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Job management (CRUD)
- [x] Database schema
- [x] Basic UI and navigation

### Phase 2: Candidate Management (Next)
- [ ] Add/edit candidates
- [ ] Resume file upload
- [ ] Text parsing (PDF/DOCX)
- [ ] Candidate profiles

### Phase 3: AI Evaluation
- [ ] Claude API integration
- [ ] Evaluation display
- [ ] Cost tracking

### Phase 4: Ranking & Comparison
- [ ] Auto-ranking by score
- [ ] Manual ranking overrides
- [ ] Side-by-side comparison
- [ ] Filters and search

### Phase 5: Polish
- [ ] Batch evaluation
- [ ] Excel export
- [ ] Analytics dashboard
- [ ] Mobile responsive

## Environment Variables

**Frontend (.env):**
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**API (.env):**
```
ANTHROPIC_API_KEY=your-anthropic-api-key
```

## Contributing

This is a personal project, but feel free to fork and customize for your needs!

## License

MIT

## Support

For issues or questions, please open a GitHub issue.
