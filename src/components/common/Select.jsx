/**
 * Select.jsx — RespondaCare Global Reusable Component
 * Design System: Dark-filled, blue glow on focus, custom chevron
 * Props: options = [{ value, label }]
 */

import React, { useState } from 'react';

export default function Select({
  id,
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  error = '',
  hint = '',
  required = false,
  className = '',
  selectClassName = '',
  ...props
}) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? 'border-[#93000a]'
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
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={[
            'w-full appearance-none bg-transparent px-3 py-2 pr-8 text-sm outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-["Hanken_Grotesk",sans-serif]',
            value ? 'text-[#e5e2e1]' : 'text-[#444653]',
            selectClassName,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-[#1c1b1b] text-[#e5e2e1]"
            >
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom chevron icon */}
        <span className="pointer-events-none absolute right-3 text-[#8e909f]">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 4L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
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
