import { BookOpen } from 'lucide-react'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="flex items-center gap-3 bg-slate-800 px-6 py-4 rounded-2xl shadow-xl border border-slate-700">
        <BookOpen className="h-8 w-8 text-indigo-400 animate-pulse" />
        <h1 className="text-2xl font-bold tracking-wide">Personal Vocab Tracker</h1>
      </div>
      <p className="mt-4 text-slate-400 text-sm">
        Setup pnpm + Tailwind v4 + TypeScript Sukses!
      </p>
    </div>
  )
}