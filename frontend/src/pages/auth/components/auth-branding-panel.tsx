import type { ReactNode } from 'react';

interface AuthBrandingPanelProps {
  patternId: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function AuthBrandingPanel({
  patternId,
  title,
  description,
  children,
}: AuthBrandingPanelProps) {
  return (
    <div className="hidden md:flex flex-col justify-between p-12 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id={patternId}
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-12">
          <picture>
            <img
              src="/images/utn-logo.png"
              alt="Logo de UTN FRLP"
              className="h-10 w-auto invert dark:invert-0"
            />
          </picture>
        </div>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight mb-6 font-display">
          {title}
        </h1>
        <p className="text-primary-foreground/70 text-md font-medium max-w-sm leading-relaxed">
          {description}
        </p>
      </div>

      <div className="relative z-10 flex flex-col gap-4">{children}</div>
    </div>
  );
}
