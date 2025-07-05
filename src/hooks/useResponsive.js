import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    // Khởi tạo giá trị ban đầu
    handleResize();

    // Lắng nghe sự kiện resize
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenSize,
    // Breakpoints
    breakpoints: {
      xs: screenSize.width < 600,
      sm: screenSize.width >= 600 && screenSize.width < 960,
      md: screenSize.width >= 960 && screenSize.width < 1280,
      lg: screenSize.width >= 1280 && screenSize.width < 1920,
      xl: screenSize.width >= 1920
    }
  };
}; 