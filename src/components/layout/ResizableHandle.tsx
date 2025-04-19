import React, { useState, useRef, useEffect } from 'react';

interface ResizableHandleProps {
  onResize: (width: number) => void;
  minWidth: number;
  maxWidth: number;
  currentWidth: number;
}

const ResizableHandle: React.FC<ResizableHandleProps> = ({ 
  onResize, 
  minWidth, 
  maxWidth,
  currentWidth 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Calculate new width based on mouse position
      const newWidth = e.clientX;
      
      // Apply constraints
      const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      
      // Call the onResize callback with the new width
      onResize(constrainedWidth);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onResize, minWidth, maxWidth]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  return (
    <div
      ref={handleRef}
      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize group hover:bg-blue-500 hover:opacity-100 z-10"
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={currentWidth}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
    >
      <div className="absolute right-0 w-4 h-full opacity-0 group-hover:opacity-100" />
      <div 
        className={`absolute right-0 w-1 h-full bg-gray-600 opacity-0 ${
          isDragging ? 'opacity-100' : 'group-hover:opacity-100'
        }`} 
      />
    </div>
  );
};

export default ResizableHandle;