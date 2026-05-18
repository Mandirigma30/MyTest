/**
 * Input.jsx — RespondaCare Global Reusable Component
 * Design System: Dark-filled (#171717), blue glow on focus, 4px radius
 */

import React, { useState } from 'react';

export default function Input({
  id,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  disabled = false,
  readOnly = false,
  error = '',
  hint = '',
  leftIcon = null,
  rightIcon = null,
  onRightIconClick = null,
  className = '',
  inputClassName = '',
  required = false,
  autoComplete,
  ...props
}) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? 'border-[#93000a] focus-within:border-[#ffb4ab]'
    : focused
    ? 'border-[#1e3fae]'
    : 'border-[#444653] hover:border-[#8e909f]';

  const glowColor = error
    ? 'shadow-[0_0_0_2px_rgba(147,0,10,0.35)]'
    : focused
    ? 'shadow-[0_0_0_2px_rgba(30,63,174,0.35)]'
    : '';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-mono tracking-[0.05em] uppercase text-[#c5c5d5]"
        >
          {label}
          {required && <span className="text-[#ffb4ab] ml-0.5">*</span>}
        </label>
      )}

      <div
        className={`relative flex items-center rounded border bg-[#171717] transition-all duration-150 ${borderColor} ${glowColor}`}
      >
        {leftIcon && (
          <span className="pl-3 text-[#8e909f] flex-shrink-0">{leftIcon}</span>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={[
            'flex-1 bg-transparent px-3 py-2 text-sm text-[#e5e2e1] placeholder-[#444653] outline-none disabled:opacity-40 disabled:cursor-not-allowed font-["Hanken_Grotesk",sans-serif]',
            leftIcon ? 'pl-2' : '',
            rightIcon ? 'pr-2' : '',
            inputClassName,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />

        {rightIcon && (
          <span
            className={`pr-3 text-[#8e909f] flex-shrink-0 ${
              onRightIconClick
                ? 'cursor-pointer hover:text-[#b8c4ff] transition-colors'
                : ''
            }`}
            onClick={onRightIconClick}
          >
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs text-[#ffb4ab] font-mono">{error}</p>
      )}
      {!error && hint && (
        <p className="text-xs text-[#8e909f]">{hint}</p>
      )}
    </div>
  );
}
