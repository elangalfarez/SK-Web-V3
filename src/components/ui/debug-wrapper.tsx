// src/components/ui/debug-wrapper.tsx
import React from 'react';

interface DebugWrapperProps {
  children: React.ReactNode;
  data?: any;
  label?: string;
}

export const DebugWrapper: React.FC<DebugWrapperProps> = ({ 
  children, 
  data, 
  label = 'Component Data' 
}) => {
  // Only show debug info in development
  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>;
  }

  // Check for problematic data that might cause React errors
  const checkData = (obj: any, path = ''): string[] => {
    const issues: string[] = [];
    
    if (obj === null || obj === undefined) return issues;
    
    if (typeof obj === 'object' && !Array.isArray(obj)) {
      // Check if this object is being rendered directly
      if (React.isValidElement(obj)) {
        issues.push(`${path}: React element found`);
      } else {
        // Check nested properties
        Object.keys(obj).forEach(key => {
          const newPath = path ? `${path}.${key}` : key;
          issues.push(...checkData(obj[key], newPath));
        });
      }
    }
    
    return issues;
  };

  const dataIssues = data ? checkData(data) : [];

  return (
    <div>
      {dataIssues.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-2">
            ⚠️ {label} - Potential Issues:
          </h4>
          <ul className="text-xs text-red-700 space-y-1">
            {dataIssues.map((issue, index) => (
              <li key={index}>• {issue}</li>
            ))}
          </ul>
        </div>
      )}
      
      {data && (
        <details className="mb-4 text-xs">
          <summary className="cursor-pointer text-blue-600 font-medium">
            🐛 Debug: {label}
          </summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      )}
      
      {children}
    </div>
  );
};

// Higher-order component version
export function withDebug<P extends object>(
  Component: React.ComponentType<P>,
  label?: string
) {
  const DebuggedComponent = (props: P) => (
    <DebugWrapper data={props} label={label || Component.displayName || Component.name}>
      <Component {...props} />
    </DebugWrapper>
  );

  DebuggedComponent.displayName = `withDebug(${Component.displayName || Component.name})`;
  
  return DebuggedComponent;
}