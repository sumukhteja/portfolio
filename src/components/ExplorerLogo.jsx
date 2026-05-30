export default function ExplorerLogo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="0.5" width="39" height="39" fill="none" stroke="currentColor" strokeWidth="1" />
      <text
        x="50%"
        y="54%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="'IM Fell English', serif"
        fontSize="24"
        fill="currentColor"
      >
        E
      </text>
    </svg>
  );
}
