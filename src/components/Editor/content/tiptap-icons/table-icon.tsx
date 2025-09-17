import * as React from "react";

export const TableIcon = React.memo((props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M3 9h18M3 15h18M9 5v14M15 5v14"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
));
