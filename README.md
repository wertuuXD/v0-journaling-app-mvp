# Unwind — No-Pressure Journaling

A beautiful, minimalist, and privacy-focused journaling application designed to help you clear your mind without the clutter. Built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), and [Framer Motion](https://www.framer.com/motion/).

## 🌸 **Live App**
**Start journaling now:** [https://v0-journaling-app-mvp.vercel.app](https://v0-journaling-app-mvp.vercel.app)

*Perfect for mobile and desktop — no signup required, your thoughts stay yours.*

## ✨ Features

### Core Journaling
- **Distraction-Free Editor**: A clean, expansive writing space with relaxed line spacing and autofocus, designed for flow.
- **Inspiring Prompts**: Not sure where to start? Use quick prompts like *"What happened today?"* or *"How do you feel?"* to break the ice.
- **7 Expressive Moods**: Track your emotional landscape with a range of moods from *Calm* and *Reflective* to *Frustrated* and *Anxious*.
- **Timeline Archive**: Your entries are automatically organized into a beautiful chronological timeline with smart date grouping (Today, Yesterday, etc.).
- **Search & Discovery**: Instantly find past thoughts using full-text search or filter by specific mood emojis.

### Export & Sharing
- **Custom-Styled PDFs**: Export your journal entries into beautiful, readable PDF documents—perfect for printing or long-term storage.
- **Plain Text Exports**: Generate lightweight `.txt` files for easy sharing or integration with other writing tools.
- **Smart Date Filtering**: Use the integrated calendar range picker to export specific timeframes—a weekend, a month, or your entire history.
- **JSON Data Portability**: Download your entire database as a JSON backup at any time.

### Privacy & Experience
- **Local-First Privacy**: Your data never leaves your device by default. All entries are stored securely in your browser's local storage.
- **Seamless Dark Mode**: Automatic system theme detection with a manual toggle for late-night reflection.
- **Premium Animations**: Powered by Framer Motion for a fluid, tactile feel that makes journaling a joy.
- **Responsive by Design**: A mobile-first vertical layout that looks stunning on every screen size.

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

## 🌐 Cloud Sync (Coming Soon / Experimental)

We are currently working on an optional Cloud Sync feature using **Supabase**. While the UI and logic are present, it requires manual configuration for self-hosting:

1. Create a project at [supabase.com](https://supabase.com).
2. Run the `database-setup.sql` in your Supabase SQL Editor.
3. Add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to a `.env.local` file.
4. Enable "Cloud Sync" in the app settings.

## 🎨 Design Principles

- **Minimalism**: Removing "feature bloat" to prioritize the writing experience.
- **No-Pressure**: No word counts, no streaks, no judgment. Just a space to be.
- **Privacy**: Your journal is for your eyes only. No tracking, no analytics on your content.
- **Accessibility**: High contrast, keyboard-friendly navigation, and reduced motion support.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
