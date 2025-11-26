# SmartNotebook

A modern, production-ready document analysis and content generation tool with enterprise-grade security, monitoring, and performance optimizations.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- API keys for AutoContent, OpenAI, and Google Gemini

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/deangilmoreremix/new-notebook-api.git
cd new-notebook-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual API keys and configuration.

4. **Start development server**
```bash
npm run dev
```

## 🔐 Security & Authentication

This application implements enterprise-grade security measures:

- **API Authentication**: All API routes require Bearer token authentication
- **Secure API Keys**: Sensitive keys are never exposed to the client-side
- **Input Validation**: All API requests are validated with Zod schemas
- **Error Monitoring**: Integrated Sentry for real-time error tracking

### API Authentication
Include the Authorization header in all API requests:
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" https://your-app.com/api/sources
```

## 📊 Monitoring & Logging

### Sentry Error Tracking
- Real-time error monitoring for both client and server
- Performance tracking and release monitoring
- Configurable alerts and issue tracking

### Structured Logging
- Winston-based logging with configurable levels
- JSON-formatted logs with timestamps
- File output: `logs/error.log` and `logs/combined.log`
- Console output with color coding

Configure log level with `LOG_LEVEL` environment variable:
- `error` - Only errors
- `warn` - Warnings and errors
- `info` - Info, warnings, and errors (default)
- `debug` - All logs including debug information

## ⚙️ Environment Variables

### Required Variables
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.autocontentapi.com
NEXT_PUBLIC_API_KEY=your_api_key_here

# AI Services
GOOGLE_API_KEY=your_google_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Error Tracking (Production)
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=your_public_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project

# Logging
LOG_LEVEL=info

# Environment
NODE_ENV=development
```

### Getting API Keys

1. **AutoContent API**: Sign up at [autocontentapi.com](https://autocontentapi.com)
2. **OpenAI**: Get your API key from [platform.openai.com](https://platform.openai.com)
3. **Google Gemini**: Create credentials at [Google AI Studio](https://makersuite.google.com/app/apikey)
4. **Sentry**: Create a project at [sentry.io](https://sentry.io)

## 🏗️ Production Deployment

### Pre-deployment Checklist
- [ ] All environment variables configured
- [ ] `npm run build` passes without ESLint errors
- [ ] Sentry project set up and DSN configured
- [ ] API keys tested and validated
- [ ] Log aggregation configured (optional)

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Run tests
npm test
```

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

Run the comprehensive test suite:
```bash
npm test
```

Tests include:
- API route testing with mocked responses
- Component testing
- Integration tests
- Input validation testing

## 📋 Features

- **Document Analysis**: Advanced AI-powered document processing
- **Content Generation**: Multiple output formats (Study Guide, FAQ, Timeline, etc.)
- **Deep Dive Conversations**: Interactive AI discussions
- **Source Management**: Organize and manage document sources
- **Real-time Chat**: Interactive chat interface
- **Voice Cloning**: Generate custom voices for content
- **Podcast Generation**: Create podcast scripts and audio
- **Knowledge Graphs**: Visual representation of content relationships

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Icons**: Lucide React
- **State Management**: React hooks with context
- **API Validation**: Zod schemas
- **Error Monitoring**: Sentry
- **Logging**: Winston
- **Testing**: Jest with React Testing Library

## 📝 API Documentation

### Authentication
All API endpoints require Bearer token authentication:
```
Authorization: Bearer YOUR_API_KEY
```

### Key Endpoints
- `GET /api/sources` - List document sources
- `POST /api/content` - Generate content from documents
- `GET /api/voices` - Get available voices
- `POST /api/clonevoice` - Clone a voice

See individual route files in `app/api/` for detailed documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and add tests
4. Run linting: `npm run lint`
5. Commit your changes: `git commit -m 'feat: add your feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/deangilmoreremix/new-notebook-api/issues)
- **Documentation**: See CHANGELOG.md for detailed change history
- **Security**: Report security issues to security@smartnotebook.com

---

**Note**: This application is production-ready with enterprise-grade security, monitoring, and performance optimizations. Ensure all environment variables are properly configured before deployment.
