// Decorative background: soft glows + floating hand-drawn robot icons.
// Purely visual, no interactivity — safe to render on every page.
function RobotIcon({ className }) {
  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="10" y="14" width="20" height="16" rx="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="22" r="2" fill="currentColor" />
      <circle cx="24" cy="22" r="2" fill="currentColor" />
      <path d="M20 14V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="6" r="2" fill="currentColor" />
      <path d="M6 20h4M30 20h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 30v3M25 30v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Decor() {
  return (
    <div className="decor" aria-hidden="true">
      <div className="glow glow-1" />
      <div className="glow glow-2" />
      <RobotIcon className="robot" />
      <RobotIcon className="robot teal" />
      <RobotIcon className="robot" />
      <RobotIcon className="robot teal" />
      <RobotIcon className="robot" />
    </div>
  );
}
