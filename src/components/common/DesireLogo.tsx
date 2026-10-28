import React from 'react';

interface DesireLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  variant?: 'full' | 'icon-only' | 'horizontal';
}

export const DesireLogo: React.FC<DesireLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  variant = 'horizontal',
}) => {
  // Dimensions
  const iconSizes = {
    sm: 'h-8 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-13 w-auto',
    xl: 'h-18 w-auto',
  };

  const fullSizes = {
    sm: 'h-10 w-auto',
    md: 'h-14 w-auto',
    lg: 'h-20 w-auto',
    xl: 'h-24 w-auto',
  };

  const titleSizes = {
    sm: 'text-sm font-black',
    md: 'text-base font-black',
    lg: 'text-xl font-black',
    xl: 'text-2xl font-black',
  };

  const subtitleSizes = {
    sm: 'text-[8.5px] font-bold tracking-wider',
    md: 'text-[9.5px] font-bold tracking-wider',
    lg: 'text-xs font-bold tracking-wider',
    xl: 'text-sm font-bold tracking-wider',
  };

  // Full stacked logo variant (matches user's exact attached brand image directly)
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <img
          src="/assets/aistudio/WhatsApp_Image_2026-10-26_at_1.58.27_PM_31e14c11.jpeg"
          alt="Desire Connect - Integrated Water Management"
          className={`${fullSizes[size]} object-contain drop-shadow-2xs`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/desire_logo.png';
          }}
        />
      </div>
    );
  }

  // Emblem icon-only variant (the crisp hexagonal green ribbon emblem)
  if (variant === 'icon-only') {
    return (
      <div className={`flex items-center justify-center shrink-0 ${className}`}>
        <img
          src="/desire_emblem.png"
          alt="Desire Connect Emblem"
          className={`${iconSizes[size]} object-contain drop-shadow-2xs`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/aistudio/WhatsApp_Image_2026-10-26_at_1.58.27_PM_31e14c11.jpeg';
          }}
        />
      </div>
    );
  }

  // Horizontal presentation: exact emblem on left + authentic official brand typography on right
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/desire_emblem.png"
        alt="Desire Connect"
        className={`${iconSizes[size]} shrink-0 object-contain drop-shadow-2xs`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/assets/aistudio/WhatsApp_Image_2026-10-26_at_1.58.27_PM_31e14c11.jpeg';
        }}
      />

      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[#0A5C36] uppercase font-sans tracking-wide ${titleSizes[size]}`}
            style={{ letterSpacing: '0.06em' }}
          >
            DESIRE
          </span>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
            Connect
          </span>
        </div>

        {showSubtitle && (
          <span
            className={`text-[#0A5C36] font-serif uppercase tracking-wider font-semibold ${subtitleSizes[size]}`}
            style={{ letterSpacing: '0.04em' }}
          >
            Integrated Water Management
          </span>
        )}
      </div>
    </div>
  );
};

