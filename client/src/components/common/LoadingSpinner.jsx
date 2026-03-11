export default function LoadingSpinner({ message = 'Loading water quality data...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <div className="absolute w-full h-full border-[3px] border-[rgba(0,188,212,0.1)] border-t-[var(--color-accent-cyan)] rounded-full" style={{ animation: 'rotate 1.2s linear infinite' }}></div>
        <div className="absolute w-[60%] h-[60%] border-[3px] border-[rgba(0,188,212,0.1)] border-t-[var(--color-accent-purple)] rounded-full" style={{ animation: 'rotate 0.8s linear infinite reverse' }}></div>
        <span className="text-[1.6rem] z-[1]" style={{ animation: 'pulse-glow 1.5s ease-in-out infinite' }}>💧</span>
      </div>
      <p className="text-[0.9rem] text-[var(--color-text-muted)] font-medium tracking-wide">{message}</p>
    </div>
  );
}
