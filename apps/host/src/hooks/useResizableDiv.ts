import { useState, useCallback, useEffect } from 'react';

interface UseResizableDivOptions {
  initialHeight?: number; 
  minHeight?: number; 
  maxHeightRatio?: number;
  el: HTMLDivElement | null;
}

const useResizableDiv = ({
  initialHeight = 200,
  minHeight = 150,
  maxHeightRatio = 0.75,
  el
}: UseResizableDivOptions) => {
  const [height, setHeight] = useState(initialHeight);

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {

    e.preventDefault();

    if (!el) return;

    const startY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
    const screenHeight = window.innerHeight;

    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      console.log('handleMouseMove', handleMouseMove)
      moveEvent.preventDefault();

      const currentY = 'clientY' in moveEvent 
        ? moveEvent.clientY 
        : (moveEvent as TouchEvent).touches[0].clientY;

      const newHeight = height + (currentY - startY);
      const maxHeight = screenHeight * maxHeightRatio;
      console.log('setHeight', Math.max(minHeight, Math.min(newHeight, maxHeight)))

      setHeight(Math.max(minHeight, Math.min(newHeight, maxHeight)));
    };

    const handleMouseUp = () => {
      if (el) {
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('mouseup', handleMouseUp);
        el.removeEventListener('touchmove', handleMouseMove);
        el.removeEventListener('touchend', handleMouseUp);
      }
    };

    if (el) {
      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('mouseup', handleMouseUp);
      el.addEventListener('touchmove', handleMouseMove, { passive: false });
      el.addEventListener('touchend', handleMouseUp);
    }
  }, [height, minHeight, maxHeightRatio, el]);

  useEffect(() => {
    if (el) {

      el.addEventListener('mousedown', handleMouseDown);
      el.addEventListener('touchstart', handleMouseDown, { passive: false });

      return () => {
        if (el) {
          el.removeEventListener('mousedown', handleMouseDown);
          el.removeEventListener('touchstart', handleMouseDown);
        }
      };
    }
  }, [handleMouseDown, el]);

  return { height, handleMouseDown };
};

export default useResizableDiv;
