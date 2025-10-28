# Internal Team Dashboard with AI Assistant

A modern full-stack web application for internal teams to ask questions and get answers from an AI assistant, with the ability to save and organize Q&A pairs in a knowledge base.

## Features

### 🤖 AI Assistant

- **Real-time Chat Interface**: Ask questions and get streaming responses from OpenAI's GPT-4 mini model
- **Message History**: Keep track of all conversations in the current session
- **Content Moderation**: Built-in content filtering to prevent inappropriate questions
- **Streaming Responses**: Real-time response streaming for better UX

### 💾 Knowledge Base Management

- **Save Answers**: Save AI responses to a persistent knowledge base
- **Tagging System**: Organize Q&A pairs with custom tags
- **Category Organization**: Pre-defined or custom categories (General, Technical, Process, Policy, Tools)
- **Search Functionality**: Search across questions and answers
- **Pin Important Answers**: Mark important Q&A pairs as pinned for quick access

### 🛡️ Content Moderation

- **Flagging System**: Report inappropriate content for review
- **Keyword Filtering**: Automatic detection of flagged keywords in questions
- **Length Validation**: Prevent extremely short or long questions
- **Manual Review**: Flag answers with custom reasons for moderation review

### 📊 Knowledge Base Sidebar

- **Category Filtering**: Browse by category
- **Tag Cloud**: See most-used tags with usage counts
- **Pinned Items**: Quick access to pinned knowledge
- **Recent Items**: View latest saved Q&A pairs

## Project Structure

```
/app
  /api
    /__tests__             # Unit tests for API routes
      /chat.route.test.ts
      /generate-title.route.test.ts
    /chat
      /route.ts          # OpenAI chat API endpoint with moderation
    /generate-title
      /route.ts          # API endpoint for generating titles
  /layout.tsx            # Root layout with Radix UI Theme provider
  /page.tsx              # Main dashboard page
  /globals.css           # Global styles

/components
  /__tests__             # Unit tests for components
    /ChatInterface.test.tsx
    /Header.test.tsx
    /KnowledgeBaseSidebar.test.tsx
    /RecentMessages.test.tsx
    /SaveAnswerDialog.test.tsx
    /SkeletonLoader.test.tsx
    /StreamdownRenderer.test.tsx
    /TagManager.test.tsx
  /ChatInterface.tsx     # Chat input and message display
  /ChatView.tsx          # Displays chat messages
  /Header.tsx            # Application header
  /KnowledgeBaseSidebar.tsx # Sidebar with search, filters, pinned items
  /RecentMessages.tsx    # Knowledge base display with management
  /SaveAnswerDialog.tsx  # Dialog to save Q&A to knowledge base
  /SkeletonLoader.tsx    # Skeleton loading component
  /streamdown.css        # Styling for streamdown renderer
  /StreamdownRenderer.tsx # Renders streamdown content
  /TagManager.tsx        # Component for managing tags
  /ThemeProvider.tsx     # Radix UI theme provider

/convex
  /__tests__             # Unit tests for Convex functions
    /messages.test.ts
  /_generated           # Auto-generated API types (DO NOT EDIT)
  /messages.ts          # Convex queries and mutations
  /README.md            # Convex specific README
  /schema.ts            # Convex database schema
  /tsconfig.json        # TypeScript configuration for Convex
```

## Technology Stack

- **Frontend Framework**: Next.js 16 with React 19
- **Styling**: Radix UI Themes 3.2.1
- **Database**: Convex (serverless database)
- **AI Integration**: OpenAI GPT-4 mini via OpenAI SDK
- **Language**: TypeScript 5
- **UI Components**: Radix UI React Icons

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key
- Convex account (already set up)

### Installation

1. **Install Dependencies**

```bash
npm install
```

2. **Set Up Environment Variables**

Add your OpenAI API key to `.env.local`:

```
OPENAI_API_KEY=
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
```

3. **Initialize Convex Database**

```bash
npx convex push
```

This will:

- Push the schema to your Convex deployment
- Generate TypeScript types for API functions

4. **Start Development Server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Push Convex schema
npx convex push

# View Convex dashboard
npx convex dashboard

# View Convex documentation
npx convex docs
```

## License

This project is part of the FT Media Coding Challenge.
