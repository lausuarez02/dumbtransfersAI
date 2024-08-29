import React from 'react';

const FuturisticButton = React.forwardRef(({ className, children, ...props }:any, ref) => {
    return (
      <button
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4 ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  });
  
  FuturisticButton.displayName = 'FuturisticButton';

  export default FuturisticButton;