// Simple SVG marker component to replace the missing PNG marker
export default function CaveNumberMarker({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute"
    >
      {/* Outer glow */}
      <circle cx="10" cy="10" r="9" fill="#ef4444" opacity="0.3" />
      {/* Main circle */}
      <circle cx="10" cy="10" r="7" fill="#dc2626" />
      {/* Inner highlight */}
      <circle cx="10" cy="10" r="5" fill="#ef4444" opacity="0.5" />
      {/* Center dot */}
      <circle cx="10" cy="10" r="3" fill="#fff" opacity="0.8" />
    </svg>
  );
}

