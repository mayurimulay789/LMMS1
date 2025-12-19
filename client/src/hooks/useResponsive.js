import { useEffect, useState } from 'react'

/**
 * Custom hook to detect current screen size and provide responsive utilities
 * Mobile-first approach: returns the current breakpoint
 */
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Breakpoint detection based on Tailwind CSS breakpoints
  const breakpoints = {
    isMobile: screenSize.width < 640, // < sm
    isSmallTablet: screenSize.width >= 640 && screenSize.width < 768, // sm - md
    isTablet: screenSize.width >= 768 && screenSize.width < 1024, // md - lg
    isDesktop: screenSize.width >= 1024 && screenSize.width < 1280, // lg - xl
    isLargeDesktop: screenSize.width >= 1280, // xl+
    isSmallScreen: screenSize.width < 768, // mobile + small tablet
    isMediumScreen: screenSize.width >= 768 && screenSize.width < 1024,
    isLargeScreen: screenSize.width >= 1024,
  }

  // Current breakpoint
  let currentBreakpoint = 'mobile'
  if (breakpoints.isSmallTablet) currentBreakpoint = 'sm'
  else if (breakpoints.isTablet) currentBreakpoint = 'md'
  else if (breakpoints.isDesktop) currentBreakpoint = 'lg'
  else if (breakpoints.isLargeDesktop) currentBreakpoint = 'xl'

  return {
    ...screenSize,
    ...breakpoints,
    currentBreakpoint,
  }
}

/**
 * Hook to handle responsive grid columns
 */
export const useResponsiveGrid = () => {
  const { isMobile, isSmallTablet, isTablet, isDesktop, isLargeDesktop } = useResponsive()

  return {
    cols2: isMobile ? 1 : isSmallTablet ? 2 : 2,
    cols3: isMobile ? 1 : isSmallTablet ? 2 : isTablet ? 2 : 3,
    cols4: isMobile ? 1 : isSmallTablet ? 2 : isTablet ? 3 : isDesktop ? 3 : 4,
    cols5: isMobile ? 1 : isSmallTablet ? 2 : isTablet ? 3 : isDesktop ? 4 : 5,
  }
}

/**
 * Hook to handle responsive gap/spacing
 */
export const useResponsiveSpacing = () => {
  const { isMobile } = useResponsive()

  return {
    gap: isMobile ? 'gap-2' : 'gap-4',
    gapX: isMobile ? 'gap-x-2' : 'gap-x-4',
    gapY: isMobile ? 'gap-y-2' : 'gap-y-4',
    padding: isMobile ? 'p-2' : 'p-4',
    paddingX: isMobile ? 'px-2' : 'px-4',
    paddingY: isMobile ? 'py-2' : 'py-4',
  }
}

/**
 * Hook to handle responsive padding for containers
 */
export const useResponsiveContainerPadding = () => {
  const { isMobile, isSmallTablet } = useResponsive()

  return isMobile ? 'px-3' : isSmallTablet ? 'px-4' : 'px-6'
}

/**
 * Hook to handle responsive font sizes
 */
export const useResponsiveFontSize = () => {
  const { isMobile, isSmallTablet } = useResponsive()

  return {
    h1: isMobile ? 'text-2xl' : isSmallTablet ? 'text-3xl' : 'text-4xl',
    h2: isMobile ? 'text-xl' : isSmallTablet ? 'text-2xl' : 'text-3xl',
    h3: isMobile ? 'text-lg' : isSmallTablet ? 'text-xl' : 'text-2xl',
    h4: isMobile ? 'text-base' : isSmallTablet ? 'text-lg' : 'text-xl',
    h5: isMobile ? 'text-sm' : isSmallTablet ? 'text-base' : 'text-lg',
    body: isMobile ? 'text-xs' : 'text-sm',
  }
}

/**
 * Hook to handle when content should be shown/hidden based on screen size
 */
export const useShowOnScreenSize = (showOn = 'all') => {
  const responsive = useResponsive()

  const showMap = {
    mobile: responsive.isMobile,
    tablet: responsive.isTablet,
    desktop: responsive.isDesktop,
    smallScreen: responsive.isSmallScreen,
    largeScreen: responsive.isLargeScreen,
    all: true,
  }

  return showMap[showOn] || false
}

export default useResponsive
