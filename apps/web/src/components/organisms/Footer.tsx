import packageJson from '../../../package.json';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 z-50 px-4 py-2 pointer-events-none">
      <div className="flex items-center gap-3 text-[10px] text-white/25 font-mono">
        <span>v{packageJson.version}</span>
        <span className="opacity-40">|</span>
        <span className="max-w-[280px] truncate">{API_URL}</span>
      </div>
    </footer>
  );
}