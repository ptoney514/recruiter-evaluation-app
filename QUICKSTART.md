# Quick Start Guide

Get the Resume Scanner Pro app running locally in minutes.

## Prerequisites (One-Time Setup)

Ensure you have the required software installed:
- **Node.js** 18 or higher
- **Python** 3.13 or higher

### Install Dependencies

**Frontend dependencies:**
```bash
cd frontend && npm install
```

**Backend dependencies:**
```bash
pip3 install --break-system-packages anthropic pdfplumber python-docx Pillow flask flask-cors
```

## Configuration

Create `api/.env` file with your API keys:
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...  # Optional
```

## Quick Start (3 Steps)

### Terminal 1 - Start the Backend API

```bash
cd api && python3 flask_server.py
```

This starts the Flask API server on **http://localhost:8000**

### Terminal 2 - Start the Frontend

```bash
cd frontend && npm run dev
```

This starts the React development server on **http://localhost:3000**

## Access Points

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000

## Testing

### Frontend Unit Tests
```bash
cd frontend && npm run test:run
```

### Frontend E2E Tests (Playwright)
```bash
cd frontend && npm run test:e2e
```

### Backend Unit Tests
```bash
cd api && python3 -m pytest api/test_database.py -v
```

### Backend API Integration Tests
```bash
cd api && python3 -m pytest api/test_crud_routes.py -v
```

## Production Build

```bash
cd frontend && npm run build
```

## Linting

```bash
cd frontend && npm run lint
```

## Important Notes

- **Keep two terminal windows open** - one for the API server, one for the frontend dev server
- The app uses **single-user mode** by default (no authentication needed locally)
- All data is stored locally in SQLite at `data/recruiter.db`
- Changes to code will **auto-reload** in development mode
- The app starts with no jobs or candidates - create a job first, then upload resumes

## Troubleshooting

**Port already in use?**
- API defaults to `:8000` - check if another service is using it
- Frontend defaults to `:3000` - check if another service is using it

**Module not found errors?**
- Make sure you ran `npm install` in the frontend directory
- Make sure you installed Python dependencies with the pip command above

**API connection errors?**
- Verify the API server is running (`http://localhost:8000` should show a response)
- Check that `VITE_API_URL=http://localhost:8000` in frontend environment

## Next Steps

1. Create a job posting
2. Upload resumes (PDF, DOCX, or TXT)
3. Run AI evaluation (Quick Score, Stage 1, or Stage 2)
4. Review results and export reports

For more detailed documentation, see:
- `CLAUDE.md` - Architecture and design decisions
- `PROJECT_STATUS.md` - Current implementation status
