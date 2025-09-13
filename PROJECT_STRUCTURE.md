# Freelancer Super-App - Project Structure

```
freelancer-super-app/
├── frontend/                          # Next.js Frontend
│   ├── app/                          # App Router
│   │   ├── (auth)/                   # Auth routes group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── (dashboard)/              # Dashboard routes group
│   │   │   ├── dashboard/
│   │   │   │   ├── projects/
│   │   │   │   ├── tasks/
│   │   │   │   ├── tools/
│   │   │   │   ├── profile/
│   │   │   │   └── billing/
│   │   │   └── layout.tsx
│   │   ├── api/                      # API routes
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/                   # Reusable components
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── auth/                     # Auth components
│   │   ├── dashboard/                # Dashboard components
│   │   ├── tools/                    # AI tool components
│   │   └── layout/                   # Layout components
│   ├── lib/                          # Utilities
│   │   ├── api.ts                    # API client
│   │   ├── auth.ts                   # Auth utilities
│   │   ├── utils.ts                  # General utilities
│   │   └── validations.ts            # Form validations
│   ├── hooks/                        # Custom React hooks
│   ├── types/                        # TypeScript types
│   ├── public/                       # Static assets
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── next.config.js
├── backend/                          # FastAPI Backend
│   ├── app/                          # Main application
│   │   ├── api/                      # API routes
│   │   │   ├── v1/                   # API version 1
│   │   │   │   ├── auth.py
│   │   │   │   ├── users.py
│   │   │   │   ├── projects.py
│   │   │   │   ├── tasks.py
│   │   │   │   ├── tools.py
│   │   │   │   ├── payments.py
│   │   │   │   └── ai.py
│   │   │   └── deps.py               # Dependencies
│   │   ├── core/                     # Core functionality
│   │   │   ├── config.py             # Configuration
│   │   │   ├── security.py           # JWT auth
│   │   │   ├── database.py           # Database setup
│   │   │   └── ai_service.py         # AI service
│   │   ├── models/                   # Database models
│   │   │   ├── user.py
│   │   │   ├── project.py
│   │   │   ├── task.py
│   │   │   ├── tool_usage.py
│   │   │   └── subscription.py
│   │   ├── schemas/                  # Pydantic schemas
│   │   │   ├── user.py
│   │   │   ├── project.py
│   │   │   ├── task.py
│   │   │   └── ai.py
│   │   ├── services/                 # Business logic
│   │   │   ├── auth_service.py
│   │   │   ├── user_service.py
│   │   │   ├── project_service.py
│   │   │   ├── ai_service.py
│   │   │   └── payment_service.py
│   │   ├── utils/                    # Utilities
│   │   │   ├── file_parser.py
│   │   │   ├── pdf_generator.py
│   │   │   └── email_service.py
│   │   └── main.py                   # FastAPI app
│   ├── tests/                        # Tests
│   ├── alembic/                      # Database migrations
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── docs/                             # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── ROADMAP.md
├── scripts/                          # Deployment scripts
│   ├── deploy.sh
│   ├── setup.sh
│   └── migrate.sh
├── docker-compose.yml                # Local development
├── README.md
└── .gitignore
```

## 🎯 Core Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Password reset functionality
- Profile management

### AI-Powered Tools
- Proposal Generator
- Cover Letter/Bio Writer
- Contract & Invoice Generator
- Price Estimator
- Task Planner
- Communication Templates
- Portfolio Case Study Writer
- Feedback Analyzer
- Proposal Translator
- Time Tracker with AI summary

### Project Management
- Project CRUD operations
- Task management
- Time tracking
- File uploads
- Collaboration features

### Payment System
- Stripe integration
- Subscription tiers
- Usage tracking
- Freemium model

### UI/UX
- Dark glassmorphic theme
- Olive green accents
- Responsive design
- Real-time updates
- Skeleton loading states
