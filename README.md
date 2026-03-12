# VocalMind - AI Voice Agent Platform

VocalMind is a powerful platform for creating, deploying, and managing intelligent conversational AI voice agents. Built for healthcare consultations and beyond, VocalMind combines state-of-the-art voice recognition, natural language processing, and real-time audio interactions to deliver exceptional user experiences.

## Features

- 🎙️ **Voice-First Design** - Natural voice conversations with real-time transcription and TTS
- 🤖 **Intelligent Agents** - Create customizable AI agents with unique personalities and knowledge bases  
- 📊 **Analytics & Insights** - Track conversations, evaluate performance, and collect structured data
- 🎨 **Beautiful UI** - Modern, responsive dashboard with glassmorphism design
- 🔒 **Secure** - Built-in authentication and session management
- 🎯 **Healthcare-Ready** - Pre-configured for medical consultations with HIPAA-aware design

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd voice-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration values. At minimum, set `AUTH_SECRET` for production:
```bash
openssl rand -base64 32
```

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

Default login credentials:
- Email: `demo@voiceai.com`
- Password: `password123`

### Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes
│   └── consult/           # Public consultation interface
├── components/            # React components
│   ├── agent/            # Agent-specific components
│   ├── chat/             # Chat interface components
│   ├── layout/           # Layout components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility libraries
│   ├── auth.ts          # NextAuth configuration
│   ├── store.ts         # In-memory data store
│   └── utils.ts         # Helper functions
└── types/               # TypeScript type definitions
```

## Key Features

### Agent Management
- Create and configure custom AI agents
- Set system prompts and personality traits
- Configure LLM providers and models
- Attach knowledge bases
- Set up evaluation criteria

### Voice Capabilities
- Real-time speech recognition (Web Speech API)
- Text-to-speech with multiple voice options
- Voice activity detection
- Audio recording and playback

### Analytics & Evaluation
- Conversation tracking and history
- Custom evaluation criteria
- Data collection and analysis
- Performance metrics

### Public Consultation
- Shareable consultation links
- Beautiful consultation interface with animated orb
- Voice and text input modes
- Session recording

## Built With

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **NextAuth** - Authentication
- **Recharts** - Data visualization
- **Zustand** - State management
- **Radix UI** - Accessible components

## Recent Fixes

- ✅ Fixed knowledge base API crash (store initialization issue)
- ✅ Fixed React Hook dependency warnings
- ✅ Optimized agent card component for better list density
- ✅ Removed agent type selection from creation flow
- ✅ Fixed orb particle overflow on public consultation page

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deployment

### GitHub Repository
🔗 [https://github.com/NithiyananthamNathi/voice-app](https://github.com/NithiyananthamNathi/voice-app)

### Quick Deploy to Cloudflare Pages (Recommended)
Deploy your Next.js app with Cloudflare Pages for excellent global performance with their CDN and generous free tier.

**Automatic Deployments Enabled:**
- ✅ Push to `main` branch → Production deployment
- ✅ Push to other branches → Preview deployments  
- ✅ Pull requests → Automatic preview URLs

**Get Started:**
1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Connect your GitHub account
3. Select the `voice-app` repository
4. Configure build settings (auto-detected for Next.js)
5. Add environment variables
6. Deploy! 🚀

Your app will be live at: `https://your-project.pages.dev`

For detailed deployment instructions including Cloudflare, Vercel, Railway, and Netlify setup, see our **[DEPLOYMENT.md](./DEPLOYMENT.md)** guide.

### Required Environment Variables
Set these in your deployment platform:
- `NEXTAUTH_SECRET` - Required for production (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your production URL (e.g., `https://your-app.pages.dev`)
- `NODE_VERSION` - Set to `18` or `20` for Cloudflare Pages

Check out the [DEPLOYMENT.md](./DEPLOYMENT.md) guide for platform-specific instructions.
