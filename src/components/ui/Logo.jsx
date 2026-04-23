export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-glow-sm">
        <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 12L16 6L24 12V20L16 26L8 20V12Z" stroke="white" strokeWidth="2.5" fill="none"/>
          <circle cx="16" cy="16" r="3" fill="white"/>
        </svg>
      </div>
      <span className="font-display font-bold text-xl text-white">
        Swift<span className="text-primary-400">POS</span>
      </span>
    </div>
  );
}
