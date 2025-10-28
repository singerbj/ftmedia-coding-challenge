# Architecture Overview

This document explains the system design and data flow of the Internal Team Dashboard.

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    USER BROWSER / FRONTEND                    │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  React 19 Components (Client-Side)                       │ │
│  │  ├─ ChatInterface.tsx (Chat UX)                          │ │
│  │  ├─ SaveAnswerDialog.tsx (Save Q&A)                      │ │
│  │  ├─ RecentMessages.tsx (Knowledge Base Display)          │ │
│  │  └─ KnowledgeBaseSidebar.tsx (Filters & Search)         │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────┬──────────────────────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
┌───────▼─────────────┐    ┌─────────▼──────────────┐
│  NEXT.JS API ROUTES │    │  CONVEX BACKEND       │
│                     │    │                       │
│ POST /api/chat      │    │ ┌───────────────────┐ │
│ ├─ OpenAI Streaming │    │ │ Queries           │ │
│ ├─ Moderation       │    │ ├─ getMessages      │ │
│ └─ Error Handling   │    │ ├─ getAllTags       │ │
│                     │    │ ├─ getCategories    │ │
│                     │    │ └─ getRecentMessages│ │
│                     │    │                     │ │
│                     │    │ Mutations           │ │
│                     │    │ ├─ saveMessage      │ │
│                     │    │ ├─ togglePin        │ │
│                     │    │ ├─ flagMessage      │ │
│                     │    │ ├─ deleteMessage    │ │
│                     │    │ └─ addCategory      │ │
└─────────┬───────────┘    └──────────┬──────────┘
          │                           │
          │        ┌──────────────────┘
          │        │
   ┌──────▼────────▼──────────┐
   │  EXTERNAL SERVICES       │
   │                          │
   │ OpenAI API               │
   │ ├─ GPT-4o-mini Model    │
   │ ├─ Streaming            │
   │ └─ Content Moderation   │
   │                          │
   │ Convex Cloud Database    │
   │ ├─ Messages Table        │
   │ ├─ Tags Table            │
   │ ├─ Categories Table      │
   │ └─ Real-time Sync        │
   └──────────────────────────┘
```

## Component Architecture

### Frontend Components

#### 1. **ChatInterface.tsx**
**Purpose**: Main chat UI for asking questions

**Responsibilities**:
- Manage chat messages state
- Handle user input
- Stream OpenAI responses
- Trigger save dialog
- Display loading states

**State Management**:
```typescript
- messages: Message[]         // Chat history
- input: string               // Current input
- isLoading: boolean          // Loading state
- showSaveDialog: boolean     // Dialog visibility
- selectedAnswerIndex: number // Selected for saving
```

**Props**:
```typescript
- onMessageSaved?: () => void // Callback when Q&A saved
```

#### 2. **SaveAnswerDialog.tsx**
**Purpose**: Dialog to save Q&A pairs to knowledge base

**Responsibilities**:
- Display question and answer
- Let user select category
- Let user add tags
- Call saveMessage mutation
- Provide feedback on save

**Key Features**:
- Tag management (add/remove)
- Category selection dropdown
- Preview of Q&A being saved
- Disabled state during save

#### 3. **TagManager.tsx**
**Purpose**: Component for managing tags (adding, removing, displaying)

**Responsibilities**:
- Display current tags
- Allow users to add new tags
- Allow users to remove existing tags
- Handle tag input and validation

**Props**:
```typescript
- initialTags: string[]       // Tags to display initially
- onTagsChange: (tags: string[]) => void // Callback when tags change
```

#### 4. **ThemeProvider.tsx**
**Purpose**: Provides theme context to the application

**Responsibilities**:
- Encapsulate theme-related logic and state
- Make theme available to all child components
- Potentially handle theme switching (light/dark mode)

**Props**:
```typescript
- children: React.ReactNode   // Child components to be themed
```

#### 5. **Utility Functions**
**Files**: `/lib/animations.ts`, `/lib/themeColors.ts`

**Purpose**: Provide reusable helper functions and constants.

**Responsibilities**:
- `animations.ts`: Defines animation-related utilities (e.g., framer-motion variants).
- `themeColors.ts`: Defines theme-related color constants and utility functions.

#### 3. **RecentMessages.tsx**
**Purpose**: Display and manage saved Q&A pairs

**Responsibilities**:
- Show saved Q&A list
- Handle pin/unpin toggle
- Handle flagging for moderation
- Handle deletion
- Expand/collapse answers
- Show metadata (category, tags, date)

**Features**:
- Pin toggle with visual indicator
- Flag dialog for content moderation
- Delete confirmation
- Expandable answer preview

#### 4. **KnowledgeBaseSidebar.tsx**
**Purpose**: Search and filter interface

**Responsibilities**:
- Search by keyword
- Filter by category
- Filter by tag
- Show tag cloud with counts
- Display pinned items
- Show category list

**Features**:
- Real-time search filtering
- Interactive tag selection
- Category buttons
- Pinned items quick access
- Tag count display

### Backend Components

#### 1. **API Route: /api/chat**
**File**: `/app/api/chat/route.ts`

**Responsibilities**:
- Receive chat messages
- Apply content moderation
- Call OpenAI API
- Stream response back to client
- Handle errors gracefully

**Request Format**:
```json
{
  "messages": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
```

**Response**:
- Streaming text/event-stream

**Moderation**:
1. Check for flagged keywords
2. Validate message length (3-5000 chars)
3. Return error if fails

**Error Handling**:
- Missing API key → 500 error
- Moderation failure → 400 error
- API error → 500 error with details

#### 2. **API Route: /api/generate-title**
**File**: `/app/api/generate-title/route.ts`

**Responsibilities**:
- Receive a message to generate a title for.
- Call OpenAI API to generate a concise title.
- Return the generated title.

**Request Format**:
```json
{
  "message": "..."
}
```

**Response**:
```json
{
  "title": "Generated Title"
}
```

**Error Handling**:
- Missing API key → 500 error
- API error → 500 error with details

#### 2. **Convex Functions: /convex/messages.ts**

**Queries**:

- `getMessages(category?, tag?, searchTerm?, limit?)`
  - Filters messages by category, tag, and search term
  - Excludes flagged messages
  - Sorts by pinned status, then by creation date
  - Returns array of messages

- `getAllTags()`
  - Returns all tags with usage counts
  - Sorted by count (descending)

- `getCategories()`
  - Returns all available categories

- `getRecentMessages(limit?)`
  - Returns most recent messages
  - Default limit: 10

**Mutations**:

- `saveMessage(question, answer, tags, category)`
  - Creates message document
  - Updates tag counts
  - Returns message ID

- `togglePin(messageId)`
  - Toggles isPinned flag
  - Updates updatedAt timestamp

- `flagMessage(messageId, reason)`
  - Sets isFlagged to true
  - Stores flag reason
  - Removes from visible results

- `deleteMessage(messageId)`
  - Deletes message document
  - Decrements tag counts
  - Removes unused tags

- `addCategory(name, description?, color?)`
  - Creates new category
  - Returns category ID

#### 3. **Convex Schema: /convex/schema.ts**

**Messages Table**:
```
_id: Id<"messages">
question: string
answer: string
tags: string[]
isPinned: boolean
category: string
createdAt: number
updatedAt: number
isFlagged: boolean
flagReason?: string

Indexes:
- by_category: [category]
- by_pinned: [isPinned]
- by_flagged: [isFlagged]
- by_created: [createdAt]
```

**Tags Table**:
```
_id: Id<"tags">
name: string
count: number
color?: string

Indexes:
- by_name: [name]
```

**Categories Table**:
```
_id: Id<"categories">
name: string
description?: string
color?: string

Indexes:
- by_name: [name]
```

## Data Flow Diagrams

### 1. Asking a Question

```
User Types Question
        ↓
[ChatInterface] User submits
        ↓
POST /api/chat
        ↓
[API Route] Content Moderation Check
        ├─ Fails → Return error to client
        └─ Passes → Call OpenAI API
                ↓
         [OpenAI] Stream response
                ↓
         [API Route] Stream back to browser
                ↓
    [ChatInterface] Display streaming text
```

### 2. Saving an Answer

```
User clicks "Save Answer"
        ↓
[SaveAnswerDialog] Opens with Q&A
        ↓
User selects category and tags
        ↓
User clicks "Save Answer"
        ↓
[SaveAnswerDialog] Calls saveMessage mutation
        ↓
[Convex] saveMessage handler:
    ├─ Create message document
    ├─ For each tag: Find or create tag doc
    └─ Increment tag count
        ↓
[RecentMessages] Refetch data
        ↓
Knowledge base updates
```

### 3. Searching and Filtering

```
User interacts with sidebar:
├─ Types in search box
├─ Clicks category button
└─ Clicks tag badge

        ↓

[KnowledgeBaseSidebar] Updates state
        ↓
[Dashboard] Calls getMessages with filters
        ↓
[Convex] Queries database:
    ├─ Filter by category
    ├─ Filter by tag
    ├─ Filter by search term
    ├─ Exclude flagged
    └─ Sort by pinned, then date
        ↓
[RecentMessages] Displays filtered results
```

## Type System

### Frontend Types

```typescript
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface SavedMessage {
  _id: Id<"messages">
  question: string
  answer: string
  tags: string[]
  isPinned: boolean
  category: string
  createdAt: number
  updatedAt: number
  isFlagged: boolean
  flagReason?: string
}
```

### API Contract

**POST /api/chat**

Request:
```typescript
{
  messages: {
    role: "user" | "assistant"
    content: string
  }[]
}
```

Response:
- Success (200): Streaming text
- Moderation Failure (400): `{ error, reason }`
- Server Error (500): `{ error, details }`

## Database Design

### Indexes for Performance

1. **Messages**:
   - `by_category`: Fast filtering by category
   - `by_pinned`: Quick access to pinned items
   - `by_flagged`: Hide flagged messages
   - `by_created`: Sort by date

2. **Tags**:
   - `by_name`: Quick tag lookup

3. **Categories**:
   - `by_name`: Quick category lookup

### Query Optimization

- Filters applied during query for efficiency
- Sorting done in database for large datasets
- Client-side post-filtering for complex logic

## Security Considerations

### Content Moderation

1. **Server-Side Validation**:
   - All moderation happens on API route
   - Client cannot bypass checks

2. **Flagged Content**:
   - Automatically excluded from queries
   - Preserved for manual review

3. **Input Validation**:
   - Length checks (3-5000 chars)
   - Keyword filtering
   - Error messages don't leak system info

### Data Privacy

- No user authentication (login-free as requested)
- All data stored in Convex (encrypted at rest)
- API keys stored in environment variables
- No sensitive data in frontend

## Performance Optimization

### Frontend

1. **Lazy Message Loading**:
   - Recent messages paginated
   - Sidebar filters applied client-side for instant feedback

2. **State Management**:
   - Convex hooks handle caching
   - React state for UI-only data

3. **Streaming Responses**:
   - Real-time feedback to user
   - No waiting for complete response

### Backend

1. **Database Indexes**:
   - Fast filtering by common fields
   - Efficient sorting operations

2. **API Optimization**:
   - Stream responses instead of buffering
   - Efficient moderation checks

3. **Tag Counting**:
   - Incremental updates on save/delete
   - Pre-aggregated counts

## Error Handling

### API Route Error Handling

```
├─ Missing API Key → 500
├─ Moderation Failure → 400
├─ OpenAI Error → 500
└─ Stream Error → Auto-close with error message
```

### Convex Mutation Error Handling

```
├─ Document Not Found → Error thrown
├─ Database Error → Propagated to client
└─ Validation Error → Caught and handled
```

### Frontend Error Handling

```
├─ Network Error → Display error message
├─ API Error → Show reason to user
└─ Convex Error → Retry or show message
```

## Scaling Considerations

### Current Limitations

- Single API instance
- No rate limiting yet
- All data in single Convex database
- Streaming not optimized for many concurrent users

### Future Scaling

1. **Horizontal Scaling**:
   - API route runs on Vercel Edge Functions
   - Convex handles multi-instance databases

2. **Caching**:
   - Cache popular questions
   - Redis for tag/category caching

3. **Rate Limiting**:
   - Implement per-user rate limits
   - Backoff strategy for API failures

4. **Database Optimization**:
   - Sharding by user/team
   - Archiving old messages

## Deployment Architecture

### Development
```
Local Machine → Convex Dev Deployment
              → OpenAI API (dev key)
```

### Production
```
Vercel Edge → Convex Production Deployment
           → OpenAI API (prod key)
```

## Monitoring & Debugging

### Available Tools

1. **Convex Dashboard**:
   ```bash
   npx convex dashboard
   ```
   - View all database documents
   - Monitor deployment
   - Check usage metrics

2. **Browser DevTools**:
   - Network tab: See API requests
   - Console: Error messages
   - React DevTools: Component state

3. **Logs**:
   - API route: Server-side console.error
   - Convex: Mutation/query logs
   - Browser: Client-side errors

### Debugging Tips

1. **Chat Not Working**:
   - Check API key in .env.local
   - Verify OpenAI API availability
   - Check browser console for errors

2. **Database Errors**:
   - Check Convex dashboard
   - Verify schema matches reality
   - Check network requests in DevTools

3. **UI Issues**:
   - Clear browser cache
   - Check Radix UI component props
   - Verify TypeScript types match runtime

---

**Questions about architecture?** Check `/DASHBOARD_README.md` for more details on specific features.
