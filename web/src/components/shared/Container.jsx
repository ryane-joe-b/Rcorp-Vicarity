import React from 'react';

/**
 * Responsive container component with consistent padding
 */
const Container = ({ children, className = '', size = 'default', as = 'div' }) => {
  const Component = as;
  
  const sizeClasses = {
    sm: 'max-w-4xl',
    default: 'max-w-7xl',
    lg: 'max-w-[1400px]',
    full: 'max-w-full',
  };

  return (
    <Component className={`mx-auto px-4 sm:px-6 lg:px-8 ${sizeClasses[size]} ${className}`}>
      {children}
    </Component>
  );
};

export default Container;
