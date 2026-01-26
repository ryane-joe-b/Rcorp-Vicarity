import React from 'react';

/**
 * Primary CTA button - Healthcare touch-optimized with accessibility
 * Variants: sage (workers), terracotta (care homes), ocean (general)
 */
const PrimaryButton = ({
  children,
  variant = 'terracotta',
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
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-4 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transform hover:scale-105 active:scale-100
  `;

  const variantClasses = {
    terracotta: `
      bg-terracotta-400 hover:bg-terracotta-500 text-white
      focus:ring-terracotta-200
      shadow-lg hover:shadow-xl
    `,
    sage: `
      bg-sage-400 hover:bg-sage-500 text-white
      focus:ring-sage-200
      shadow-lg hover:shadow-xl
    `,
    ocean: `
      bg-ocean-500 hover:bg-ocean-600 text-white
      focus:ring-ocean-200
      shadow-lg hover:shadow-xl
    `,
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[38px]',
    md: 'px-6 py-3 text-base min-h-[44px]', // Touch-optimized minimum 44px
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

  // If href provided, render as link
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

  // Otherwise render as button
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

export default PrimaryButton;
