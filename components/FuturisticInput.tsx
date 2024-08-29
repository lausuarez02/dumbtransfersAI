import React from 'react';

const FuturisticInput = React.forwardRef(({ className, ...props }:any, ref) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent ${className}`}
      ref={ref}
      {...props}
    />
  );
});

FuturisticInput.displayName = 'FuturisticInput';
export default FuturisticInput;