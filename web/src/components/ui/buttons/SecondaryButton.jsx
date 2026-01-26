import React from 'react';

/**
 * Secondary button - Outline style for less prominent actions
 */
const SecondaryButton = ({
  children,
  variant = 'sage',
  size = 'md',
  onClick,
  href,
  className = '',
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'right',
  type = 'button',
  ariaLabel,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-semibold rounded-lg
    border-2
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-4 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transform hover:scale-105 active:scale-100
  `;

  const variantClasses = {
    sage: `
      border-sage-400 text-sage-600 hover:bg-sage-50
      focus:ring-sage-200
    `,
    terracotta: `
      border-terracotta-400 text-terracotta-600 hover:bg-terracotta-50
      focus:ring-terracotta-200
    `,
    ocean: `
      border-ocean-500 text-ocean-600 hover:bg-ocean-50
      focus:ring-ocean-200
    `,
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[38px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]',
    xl: 'px-10 py-5 text-xl min-h-[56px]',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const iconElement = icon && (
    <span className={`flex-shrink-0 ${iconPosition === 'left' ? 'mr-2' : 'ml-2'}`}>
      {icon}
    </span>
  );

  const content = (
    <>
      {icon && iconPosition === 'left' && iconElement}
      <span>{children}</span>
      {icon && iconPosition === 'right' && iconElement}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={combinedClasses}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      {...props}
    >
      {content}
    </button>
  );
};

export default SecondaryButton;
