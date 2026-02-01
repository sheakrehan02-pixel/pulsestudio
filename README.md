# Music Lab 🎵

Explore sound, experiment with music, learn through play. A premium interactive music app with labs for rhythm, pitch, harmony, and creativity.

> **"No lessons. No tests. Just music."**

## 🎯 Philosophy

This app combines:
- **Duolingo's engagement** - Gamified learning with streaks and XP
- **Apple Music's elegance** - Beautiful, minimal design
- **Rhythm game satisfaction** - Immediate feedback and rewards
- **Creative sandbox freedom** - Explore and experiment

## 🧠 Educational Architecture

The app is designed to support **five core domains** of musical understanding:

### 1️⃣ Rhythm & Timing
- Beat perception
- Tempo control
- Syncopation
- Time signatures
- Subdivision

### 2️⃣ Pitch & Ear Training
- Pitch matching
- Interval recognition
- Relative pitch exercises
- Melodic contour awareness

### 3️⃣ Notes & Theory (Intuitive)
- Note names
- Octaves
- Scales
- Chords
- Key centers

### 4️⃣ Instrument Interaction
- Piano keyboard
- Rhythm pads
- Virtual instruments
- Sound exploration

### 5️⃣ Creativity
- Free-play mode
- Pattern creation
- Simple composition
- Musical experimentation

## 🖥️ Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Web Audio API** - Real-time audio synthesis
- **PWA** - Installable app experience

## 📱 Features

### Learning Path Dashboard
- Skill-based navigation
- XP and leveling system
- Progress visualization
- Unlockable content

### Interactive Rhythm Lesson
- Multiple difficulty levels (Beginner, Intermediate, Advanced)
- Real-time accuracy detection
- Visual feedback (perfect/close/off)
- Metronome with adjustable BPM
- Score and streak tracking

### Piano Playground
- Interactive keyboard (one octave)
- "Find Middle C" challenge
- Keyboard support
- Visual note highlighting

### Creativity Mode
- Free musical exploration
- Two-octave piano
- Play history visualization
- No scoring or pressure

### Progress & Stats
- Skill breakdown by domain
- XP tracking
- Streak counter
- Visual progress charts
- Motivational feedback

## 🏗️ Project Structure

```
/app
  /dashboard      - Learning path with skill categories
  /lesson         - Rhythm tap interactive lesson
  /piano          - Piano playground
  /creativity      - Free-play sandbox mode
  /progress       - Stats and skill breakdown
  page.tsx        - Landing page

/components
  AppNavigation.tsx        - Bottom tab navigation
  FloatingNotes.tsx       - Animated background
  ServiceWorkerRegistration.tsx - PWA support

/lib
  types.ts        - TypeScript definitions
  data.ts         - Hardcoded lesson/skill data
  progress.ts     - XP and progress calculations
  audio.ts        - Web Audio API utilities
```

## 🎨 Design Principles

- **Dark mode default** - Easy on the eyes
- **Soft gradients** - Premium feel
- **Clean typography** - Minimal but expressive
- **Musical motion** - Animations feel rhythmic
- **Micro-interactions** - Every tap feels intentional
- **Zero clutter** - Learn by doing, not reading

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Install as PWA (iOS/Android):**
   - Mobile: "Add to Home Screen" in Safari/Chrome
   - Desktop: Click install icon in address bar

5. **Deploy to iOS:** See [DEPLOY_IOS.md](./DEPLOY_IOS.md) for PWA and native app options

## 🎓 Educational Depth

Even though this is a prototype, the architecture clearly shows how the app can grow:

- **Scalable skill system** - Easy to add new skills and lessons
- **Domain-based organization** - Clear separation of educational areas
- **Progress tracking** - Foundation for advanced analytics
- **Modular audio system** - Ready for MIDI input, samples, etc.
- **Type-safe architecture** - Easy to extend without breaking changes

## 🔮 Future Expansion

The codebase is structured to support:

- AI-powered feedback
- MIDI input/output
- Real instrument integration
- User profiles and cloud sync
- Community challenges
- Advanced ear training exercises
- Music theory lessons
- Rhythm pattern creation
- Composition tools

## 📦 Scope

- ✅ No backend required
- ✅ No authentication needed
- ✅ No database - all data hardcoded
- ✅ Focus on depth and polish
- ✅ Mobile-first design
- ✅ PWA-ready

## 🎯 Quality Standards

This app is built to:
- Impress engineers with clean architecture
- Delight designers with beautiful UI
- Engage users with fun interactions
- Demonstrate serious product vision

**This is not a demo. This is the foundation of a real product.**

## 📝 License

Built with ❤️ for music education.
