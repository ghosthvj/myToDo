interface Props {
  size?: number;
  className?: string;
}

export default function AppIcon({ size = 28, className = '' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#6366f1" />
      {/* Checked item */}
      <circle cx="10" cy="12" r="3.5" fill="none" stroke="white" strokeWidth="1.8" />
      <path
        d="M8.3 12l1.5 1.5 2.5-3"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <line x1="16.5" y1="12" x2="25" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* Pending item */}
      <circle cx="10" cy="21" r="3.5" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.8" />
      <line x1="16.5" y1="21" x2="25" y2="21" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
