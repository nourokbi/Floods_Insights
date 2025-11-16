export default function StatsIllustration() {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="stats-svg"
    >
      {/* Background Circle */}
      <circle cx="200" cy="200" r="150" fill="rgba(255,255,255,0.1)" />
      <circle cx="200" cy="200" r="120" fill="rgba(255,255,255,0.05)" />

      {/* Chart Bars */}
      <rect
        x="80"
        y="180"
        width="40"
        height="140"
        rx="8"
        fill="rgba(255,255,255,0.9)"
      >
        <animate
          attributeName="height"
          from="0"
          to="140"
          dur="1.5s"
          fill="freeze"
        />
        <animate
          attributeName="y"
          from="320"
          to="180"
          dur="1.5s"
          fill="freeze"
        />
      </rect>
      <rect
        x="140"
        y="120"
        width="40"
        height="200"
        rx="8"
        fill="rgba(255,255,255,0.8)"
      >
        <animate
          attributeName="height"
          from="0"
          to="200"
          dur="1.5s"
          fill="freeze"
        />
        <animate
          attributeName="y"
          from="320"
          to="120"
          dur="1.5s"
          fill="freeze"
        />
      </rect>
      <rect
        x="200"
        y="100"
        width="40"
        height="220"
        rx="8"
        fill="rgba(255,255,255,0.9)"
      >
        <animate
          attributeName="height"
          from="0"
          to="220"
          dur="1.5s"
          fill="freeze"
        />
        <animate
          attributeName="y"
          from="320"
          to="100"
          dur="1.5s"
          fill="freeze"
        />
      </rect>
      <rect
        x="260"
        y="140"
        width="40"
        height="180"
        rx="8"
        fill="rgba(255,255,255,0.8)"
      >
        <animate
          attributeName="height"
          from="0"
          to="180"
          dur="1.5s"
          fill="freeze"
        />
        <animate
          attributeName="y"
          from="320"
          to="140"
          dur="1.5s"
          fill="freeze"
        />
      </rect>

      {/* Trend Line */}
      <path
        d="M 100 200 Q 160 140 220 110 T 280 160"
        stroke="rgba(96, 165, 250, 0.8)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Data Points */}
      <circle cx="100" cy="200" r="6" fill="#60A5FA" />
      <circle cx="160" cy="140" r="6" fill="#60A5FA" />
      <circle cx="220" cy="110" r="6" fill="#60A5FA" />
      <circle cx="280" cy="160" r="6" fill="#60A5FA" />

      {/* Floating Icons */}
      <g opacity="0.7">
        <circle cx="320" cy="100" r="20" fill="rgba(255,255,255,0.2)">
          <animate
            attributeName="cy"
            values="100;90;100"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
        <text x="320" y="108" fontSize="20" textAnchor="middle" fill="white">
          📊
        </text>
      </g>

      <g opacity="0.7">
        <circle cx="80" cy="80" r="18" fill="rgba(255,255,255,0.2)">
          <animate
            attributeName="cy"
            values="80;70;80"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
        <text x="80" y="88" fontSize="18" textAnchor="middle" fill="white">
          🎯
        </text>
      </g>
    </svg>
  );
}
