# 🚀 Freelancer Super-App

A comprehensive AI-powered platform for freelancers to manage projects, generate proposals, contracts, and grow their business with intelligent automation.

## ✨ Features

### 🤖 AI-Powered Tools
- **Proposal Generator** - Create compelling project proposals
- **Cover Letter/Bio Writer** - Generate professional bios and cover letters
- **Contract & Invoice Generator** - Create legal documents with PDF output
- **Price Estimator** - Get accurate project pricing estimates
- **Task Planner** - Break down projects into manageable tasks
- **Communication Templates** - Professional client communication templates
- **Portfolio Case Study Writer** - Create compelling case studies
- **Feedback Analyzer** - Analyze client feedback for insights
- **Proposal Translator** - Translate proposals to different languages
- **Time Tracker** - Track time with AI-powered summaries

### 📊 Project Management
- Project CRUD operations
- Task management with time tracking
- Client management
- File uploads and storage
- Real-time collaboration features

### 💳 Payment System
- Stripe integration
- Subscription tiers (Free, Pro, Enterprise)
- Usage tracking and limits
- Freemium model with premium features

### 🎨 Modern UI/UX
- Dark glassmorphic theme with olive green accents
- Responsive design for all devices
- Real-time updates with WebSocket support
- Skeleton loading states
- Copy-to-clipboard and PDF download features

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **shadcn/ui** for components
- **Framer Motion** for animations
- **React Hook Form** with Zod validation
- **Axios** for API calls

### Backend
- **FastAPI** with Python 3.11+
- **PostgreSQL** for database
- **SQLAlchemy** ORM with Alembic migrations
- **JWT** authentication
- **OpenAI API** for AI features
- **Stripe** for payments
- **Redis** for caching
- **Celery** for background tasks

### Infrastructure
- **Docker** for containerization
- **Vercel** for frontend deployment
- **Render/Railway** for backend deployment
- **AWS S3** for file storage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/freelancer-super-app.git
cd freelancer-super-app
```

### 2. Run Setup Script
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 3. Configure Environment Variables
Update the following files with your API keys:

**backend/.env**
```env
OPENAI_API_KEY=your-openai-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
DATABASE_URL=postgresql://user:password@localhost/freelancer_app
```

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### 4. Start the Application

#### Option A: Docker Compose (Recommended)
```bash
docker-compose up
```

#### Option B: Manual Setup
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📁 Project Structure

```
freelancer-super-app/
├── frontend/                 # Next.js frontend
│   ├── app/                 # App Router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities and API client
│   ├── hooks/               # Custom React hooks
│   └── types/               # TypeScript types
├── backend/                 # FastAPI backend
│   ├── app/                 # Main application
│   │   ├── api/             # API routes
│   │   ├── core/            # Core functionality
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utilities
│   └── alembic/             # Database migrations
├── scripts/                 # Setup and deployment scripts
├── docs/                    # Documentation
└── docker-compose.yml       # Docker services
```

## 🔧 Development

### Backend Development
```bash
cd backend
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### Database Migrations
```bash
cd backend
source venv/bin/activate

# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render/Railway)
1. Connect your GitHub repository
2. Set environment variables
3. Configure build command: `pip install -r requirements.txt`
4. Configure start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Environment Variables for Production
```env
# Backend
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-production-secret-key
OPENAI_API_KEY=your-openai-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
REDIS_URL=redis://host:port

# Frontend
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## 📊 Usage Limits

| Tier | Daily AI Requests | Storage | Features |
|------|------------------|---------|----------|
| Free | 10 | 100MB | Basic tools |
| Pro | 100 | 1GB | All tools + priority support |
| Enterprise | 1000 | 10GB | Custom integrations + dedicated support |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@freelancersuperapp.com
- 💬 Discord: [Join our community](https://discord.gg/freelancersuperapp)
- 📖 Documentation: [docs.freelancersuperapp.com](https://docs.freelancersuperapp.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/freelancer-super-app/issues)

## 🙏 Acknowledgments

- OpenAI for providing the AI capabilities
- Stripe for payment processing
- Vercel for hosting
- The open-source community for amazing tools and libraries

---

**Built with ❤️ for freelancers worldwide**