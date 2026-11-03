type BrandMarkProps = { size?: number; className?: string };

export function BrandMark({ size = 40, className = "" }: BrandMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`brand-mark inline-flex shrink-0 items-center justify-center rounded-[13px] bg-[#D8FF70] text-[#10231A] ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 40 40" width={size * 0.68} height={size * 0.68} fill="none">
        <path d="M10 7.5V32.5M10 8H21.5C26.1 8 29 10.5 29 14.3C29 18.2 26.1 20 21.5 20H10M10 20H23C28.2 20 31 22.5 31 26.2C31 30 28.2 32 23 32H10" stroke="currentColor" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 13.5L30.5 6M25 6H30.5V11.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
}
