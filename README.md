# Unwind — No-Pressure Journaling

A beautiful, privacy-focused journaling application built with [Next.js](https://nextjs.org) and [v0](https://v0.app).

## ✨ Features

### Core Journaling
- **Writing Editor**: Clean, distraction-free writing interface with mood tracking
- **Timeline View**: Chronologically organized entries with date grouping
- **Entry Management**: View, edit, and delete past entries
- **Mood Tracking**: 6 mood options with beautiful illustrations
- **Auto-save**: Automatically saves your work as you type

### Search & Discovery
- **Full-text Search**: Search through all your journal entries
- **Mood Search**: Find entries by mood emoji
- **Instant Results**: Real-time search with result highlighting

### Data Management
- **Export**: Download all entries as JSON backup
- **Import**: Restore entries from backup files
- **Duplicate Prevention**: Smart merging avoids duplicate entries
- **Privacy First**: All data stays on your device

### User Experience
- **Dark Mode**: Automatic system theme detection with manual toggle
- **Responsive Design**: Works beautifully on desktop and mobile
- **Privacy-focused**: No data leaves your device
- **Fast Performance**: Optimized for smooth interactions

### 🌐 Cloud Sync Setup (Optional)

**Step 1: Create Supabase Account**
1. Go to [supabase.com](https://supabase.com) and sign up for free
2. Click "New Project" and create a new database
3. Wait for the project to be ready (2-3 minutes)

**Step 2: Set Up Database**
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the SQL from `database-setup.sql` in this project
3. Paste and run the SQL to create the journal_entries table
4. The table will automatically enable Row Level Security for privacy

**Step 3: Get API Credentials**
1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy the **Project URL** and **anon public** key
3. Create a `.env.local` file in the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

**Step 4: Restart Development Server**
```bash
npm run dev
```

**Free Tier Benefits:**
- ✅ 500MB storage (~50,000 journal entries)
- ✅ 50,000 monthly active users
- ✅ No credit card required
- ✅ Full privacy control
- ✅ Automatic backups

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
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### Writing Entries
1. Click the "New entry" button (pen icon)
2. Start writing in the clean editor
3. Select a mood to track your emotional state
4. Save with Ctrl/Cmd + Enter or the Save button

### Searching Entries
1. Go to the timeline view (book icon)
2. Click "Search entries..." or press the search button
3. Type keywords to search through content and moods
4. Click on results to view full entries

### Managing Data
1. Click the settings icon to access data management
2. **Export**: Download all entries as a JSON backup file
3. **Import**: Upload a backup file to restore entries
4. Entries are automatically merged without duplicates

### Dark Mode
- Click the moon/sun icon in the header
- Automatically follows system preference by default
- Manual override available anytime

## 🔧 Technical Details

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS with custom design system
- **Components**: Radix UI primitives
- **Icons**: Lucide React
- **Themes**: next-themes for dark mode
- **Storage**: Browser localStorage (client-side only)

### Project Structure
```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Main journal app page
│   └── globals.css        # Global styles
├── components/
│   ├── theme-provider.tsx # Dark mode context
│   ├── theme-toggle.tsx   # Theme switcher component
│   └── journal/           # Journal-specific components
│       ├── journal-app.tsx    # Main app container
│       ├── writing-editor.tsx # Entry editor
│       ├── timeline.tsx       # Timeline view
│       ├── entry-viewer.tsx   # Entry detail view
│       ├── search-bar.tsx     # Search functionality
│       └── data-manager.tsx   # Import/export
├── hooks/
│   └── use-journal.ts     # Journal state management
└── public/
    └── moods/            # Mood illustration images
```

### Data Storage
- All entries stored in browser localStorage
- JSON format for easy import/export
- No server-side storage or tracking
- Completely private and secure

## 🎨 Design Principles

- **Minimalism**: Clean, distraction-free interface
- **Accessibility**: Full keyboard navigation and screen reader support
- **Performance**: Optimized for fast interactions
- **Privacy**: No data collection or analytics (except optional Vercel Analytics)
- **Responsive**: Beautiful on all screen sizes

## 🤝 Contributing

This project was bootstrapped with [v0](https://v0.app). Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- [Continue working on v0 →](https://v0.app/chat/projects/prj_DmedvF8l4W8DPlha9Uk0VkhgpVaN)
- [Next.js Documentation](https://nextjs.org/docs)
- [v0 Documentation](https://v0.app/docs)
