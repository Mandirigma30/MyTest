/**
 * Card.jsx — RespondaCare Global Reusable Component
 * Design System: Tonal elevation layers — Level 1 (#171717), Level 2 (#262626)
 * Supports left-border severity accent coloring
 * Variants: default | elevated | flat
 * Severity: null | 1 | 2 | 3 | 4 | 5
 */

import React from 'react';

const severityBorderMap = {
  5: 'border-l-[#e53935]', // Critical — Red
  4: 'border-l-[#fb8c00]', // High — Orange
  3: 'border-l-[#fdd835]', // Moderate — Yellow
  2: 'border-l-[#1e3fae]', // Low — Blue
  1: 'border-l-[#43a047]', // Minimal — Green
};

const variantMap = {
  default: 'bg-[#201f1f] border border-white/10',
  elevated: 'bg-[#2a2a2a] border border-white/[0.12]',
  flat: 'bg-[#171717] border border-white/[0.07]',
};

export default function Card({
  children,
  variant = 'default',
  severity = null,
  className = '',
  onClick,
  hoverable = false,
  padding = true,
  id,
}) {
  const hasSeverityBorder = severity !== null && severityBorderMap[severity];

  return (
    <div
      id={id}
      onClick={onClick}
      className={[
        'rounded font-["Hanken_Grotesk",sans-serif] transition-all duration-150',
        variantMap[variant],
        hasSeverityBorder ? `border-l-4 ${severityBorderMap[severity]}` : '',
        hoverable || onClick
          ? 'cursor-pointer hover:bg-[#262626] hover:border-white/20 hover:shadow-lg hover:shadow-black/30'
          : '',
        padding ? 'p-4' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

/**
 * Card.Header — optional sub-component for consistent card headers
 */
Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-3 flex items-start justify-between gap-2 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card.Body — optional sub-component for card body content
 */
Card.Body = function CardBody({ children, className = '' }) {
  return <div className={`text-sm text-[#c5c5d5] ${className}`}>{children}</div>;
};

/**
 * Card.Footer — optional sub-component for card action area
 */
Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div
      className={`mt-4 flex items-center gap-2 border-t border-white/[0.07] pt-3 ${className}`}
    >
      {children}
    </div>
  );
};
