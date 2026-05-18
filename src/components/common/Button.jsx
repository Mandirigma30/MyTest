/**
 * Button.jsx — RespondaCare Global Reusable Component
 * Design System: Dark theme, #1e3fae primary, 4px radius
 * Variants: primary | secondary | danger | ghost
 * Sizes: sm | md | lg
 */

import React from 'react';

const variantClasses = {
  primary:
    'bg-[#1e3fae] text-white hover:bg-[#2a52d4] active:bg-[#172f8a] border border-[#1e3fae] hover:border-[#2a52d4] shadow-[0_0_12px_rgba(30,63,174,0.4)]',
  secondary:
    'bg-transparent text-[#b8c4ff] border border-[#444653] hover:border-[#b8c4ff] hover:bg-[#b8c4ff]/10 active:bg-[#b8c4ff]/20',
  danger:
    'bg-[#93000a] text-[#ffdad6] hover:bg-[#b00010] active:bg-[#7a0008] border border-[#93000a] shadow-[0_0_12px_rgba(147,0,10,0.35)]',
  ghost:
    'bg-transparent text-[#c5c5d5] border border-transparent hover:bg-white/5 active:bg-white/10',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs font-medium tracking-[0.05em] font-mono',
  md: 'px-4 py-2 text-sm font-medium',
  lg: 'px-6 py-2.5 text-base font-semibold',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  onClick,
  type = 'button',
  className = '',
  id,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded font-["Hanken_Grotesk",sans-serif] transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1e3fae]/60 focus:ring-offset-1 focus:ring-offset-[#131313] cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none';

  return (
    <button
      id={id}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={[
        base,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
