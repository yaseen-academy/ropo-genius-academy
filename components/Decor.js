// Decorative background: soft glows + floating hand-drawn robot icons.
// Purely visual, no interactivity — safe to render on every page.
function RobotIcon({ className }) {
  return (
    <svg
      className={className}
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* antenna */}
      <path d="M22 6v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="22" cy="5" r="2.2" fill="currentColor" />
      {/* rounded head */}
      <rect x="9" y="10" width="26" height="20" rx="9" stroke="currentColor" strokeWidth="2" />
      {/* friendly eyes */}
      <circle cx="17.5" cy="20" r="2.6" fill="currentColor" />
      <circle cx="26.5" cy="20" r="2.6" fill="currentColor" />
      {/* smile */}
      <path d="M17 25.5c1.6 1.6 8.4 1.6 10 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* side ears */}
      <path d="M9 18h-3M35 18h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* legs */}
      <path d="M16 30v4M28 30v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
