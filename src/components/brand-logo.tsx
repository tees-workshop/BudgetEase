type BrandLogoProps = { size?: "sm" | "md"; theme?: "dark" | "light"; className?: string };

export function BrandLogo({ size = "md", theme = "dark", className = "" }: BrandLogoProps) {
  const dimensions = size === "sm" ? { width: 30, height: 34 } : { width: 38, height: 42 };
  return (
    <span
      role="img"
      aria-label="BudgetEase"
      className={`brand-lockup inline-flex shrink-0 items-center ${theme === "dark" ? "text-white" : "text-[#15221A"} ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 42 44"
        width={dimensions.width}
        height={dimensions.height}
        fill="none"
        className="brand-letter"
      >
        <path d="M8 5.5V38.5M8.5 6H22.2C29.1 6 33 9.2 33 14.5C33 19.6 29.1 22 22.2 22H8.5M8.5 22H23.4C31 22 35 25.1 35 30.1C35 35.2 31 38 23.4 38H8.5" stroke="#D8FF70" strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m25 12.5 10-10m-7 0h7v7" stroke="#D8FF70" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="brand-wordmark -ml-[3px] text-[1.48rem] font-black leading-none tracking-[-.085em] sm:text-[1.58rem]">udgetease<span className="brand-period">.</span></span>
    </span>
  );
}
