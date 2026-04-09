# Unwind — No-Pressure Journaling

A beautiful, minimalist, and privacy-focused journaling application designed to help you clear your mind without the clutter. Built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), and [Framer Motion](https://www.framer.com/motion/).

## 🌸 **Live App**
**Start journaling now:** [https://v0-journaling-app-mvp.vercel.app](https://v0-journaling-app-mvp.vercel.app)

*Perfect for mobile and desktop — no signup required, your thoughts stay yours.*

## Features

### Core Journaling
- **Distraction-Free Editor**: A clean, expansive writing space with relaxed line spacing and autofocus, designed for flow.
- **Inspiring Prompts**: Not sure where to start? Use quick prompts like *"What happened today?"* or *"How do you feel?"* to break the ice.
- **7 Expressive Moods**: Track your emotional landscape with a range of moods from *Calm* and *Reflective* to *Frustrated* and *Anxious*.
- **Timeline Archive**: Your entries are automatically organized into a beautiful chronological timeline with smart date grouping (Today, Yesterday, etc.).
- **Advanced Search**: Debounced full-text search with no-results feedback and mood filtering.

### Export & Data Management
- **Professional PDFs**: Beautifully formatted exports with ordinal dates (8th April, 2026) and mood labels.
- **Plain Text Exports**: Consistent formatting matching PDF exports for compatibility.
- **Smart Date Filtering**: Calendar range picker for selective timeframe exports.
- **JSON Portability**: Complete database backup with enhanced validation and security.
- **Import Security**: Comprehensive validation with file size limits, content sanitization, and duplicate detection.
- **Cloud Sync**: Optional Supabase-powered cloud backup with automatic sync, restore, and multi-device support.

### Performance & Reliability
- **Smart Storage Management**: Automatic localStorage quota monitoring with warnings and graceful degradation.
- **Error Boundaries**: Comprehensive error handling prevents app crashes with graceful recovery options.
- **Search Optimization**: 300ms debounced search handles thousands of entries smoothly.
- **Loading Skeletons**: Perceived performance improvements with skeleton loading states.

### Accessibility & UX
- **Cross-Platform Keyboard Navigation**: Mobile shortcuts (N, T, S) and desktop shortcuts (Alt+N, Alt+T, Alt+S).
- **Screen Reader Support**: Full ARIA labels and keyboard accessibility throughout.
- **Toast Notifications**: Real-time feedback for all operations (exports, imports, errors, warnings).
- **Micro-interactions**: Smooth hover states, scale effects, and animated transitions.
- **View Transitions**: Directional animations between Write, Timeline, and Settings views.

### Privacy & Experience
- **Local-First Privacy**: Data never leaves your device by default. Secure localStorage storage.
- **Seamless Dark Mode**: Automatic system theme detection with manual toggle.
- **Premium Animations**: Fluid, tactile feel with Framer Motion.
- **No Tracking**: No analytics, no data collection - your thoughts remain completely private.

## Implementation Highlights

### Advanced Features
- **Error Recovery**: React error boundaries with try-again and refresh options.
- **Storage Quota Handling**: 5MB limit monitoring with 80% warning threshold.
- **Import Validation**: 10MB file limit, 10,000 entry max, date range validation (2000-2030).
- **Search Performance**: Optimized for large datasets with debouncing and efficient filtering.
- **Mobile Optimization**: Touch-friendly interface with responsive design.

### Security & Data Integrity
- **Content Sanitization**: 100KB per entry limit prevents abuse.
- **Duplicate Detection**: Automatic ID collision handling.
- **JSON Parsing Safety**: Protected against malformed data.
- **Date Validation**: Reasonable date range enforcement.
- **Error Logging**: Detailed console warnings for debugging.

### User Experience Enhancements
- **No Results Messaging**: Helpful feedback when searches return empty.
- **Progress Indicators**: Visual feedback for save operations.
- **Keyboard Navigation**: Arrow keys for mood selection, Tab navigation loops.
- **Hover Effects**: Scale transforms, gradient overlays, and shadow effects.
- **Typography**: Enhanced hierarchy with improved contrast and readability.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/v0-journaling-app-mvp.git
cd v0-journaling-app-mvp
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### Writing Entries
1. Click the **Pen icon** (New entry) to open the editor.
2. Choose a **Prompt** if you need a nudge, or just start typing.
3. Select a **Mood** that fits your current state.
4. Hit **Save Entry** (or `Ctrl/Cmd + Enter`) to archive your thoughts.

### Searching & Exporting
1. Navigate to the **Timeline** (Book icon) to search through past entries.
2. Head to **Settings** (Gear icon) to manage your data.
3. Use the **Date Range Picker** to filter which entries you'd like to export.
4. Choose between **PDF**, **Text**, or **JSON Backup**.

## 🔧 Technical Details

### Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF)
- **Icons**: [Lucide React](https://lucide.dev)
- **Components**: Radix UI & [shadcn/ui](https://ui.shadcn.com)
- **State Management**: Custom React Hooks with LocalStorage persistence

### Project Structure
```
├── app/                    # Next.js app directory (Layouts, Pages)
├── components/
│   ├── ui/                # Base UI components (Radix/Shadcn)
│   └── journal/           # Core features (Editor, Timeline, Data Management)
├── hooks/
│   ├── use-journal.ts     # Local state & CRUD logic
│   └── use-supabase-sync.ts # Experimental cloud sync logic
└── lib/                   # Utility functions & Supabase client
```

## 🌐 Cloud Backup & Sync

The app includes an **optional** cloud backup feature using **Supabase**. Your data stays local-first - cloud sync is entirely opt-in.

### Features
- **Automatic Sync**: New entries automatically sync to cloud when signed in
- **Smart Restore**: Only downloads missing entries, prevents duplicates
- **Delete Sync**: Deleting local entries also removes them from cloud
- **Multi-Device**: Access your journal from multiple devices
- **Google OAuth**: Quick sign-in with your Google account
- **Visual Status**: Sync indicator in header shows when syncing and last sync time

### Setup (Optional)
1. Create a project at [supabase.com](https://supabase.com)
2. Run `database-setup.sql` in your Supabase SQL Editor
3. Create `.env.local` with your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Sign in via **Settings → Cloud Backup**

### Usage
- **Sign In**: Click "Continue with Google" in Cloud Backup settings
- **Auto-Sync**: Entries sync automatically when you create or edit
- **Restore**: Click "Restore from Cloud" to download entries from another device
- **Sign Out**: Click the user icon in the header, then logout icon

## Testing

### Test Data & Cases
The app includes comprehensive testing tools for quality assurance:

- **`generate-test-data.js`** - Creates sample entries across multiple dates for testing
- **`quota-test-data.js`** - Generates large entries to test localStorage quota handling
- **`test-cases.md`** - 5 comprehensive test cases covering all functionality

### Running Tests
1. Open the app in your browser
2. Open Developer Console (F12)
3. Copy and paste the test data scripts
4. Follow the test cases in `test-cases.md`

### Performance Testing
- Use quota test data to test storage limits and warnings
- Test search performance with 1000+ entries
- Verify error boundaries with intentional errors
- Test keyboard navigation on mobile and desktop

## 🎨 Design Principles

- **Minimalism**: Removing "feature bloat" to prioritize the writing experience.
- **No-Pressure**: No word counts, no streaks, no judgment. Just a space to be.
- **Privacy**: Your journal is for your eyes only. No tracking, no analytics on your content.
- **Accessibility**: High contrast, keyboard-friendly navigation, and reduced motion support.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
