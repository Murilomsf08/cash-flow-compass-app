
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  )

  React.useEffect(() => {
    // Helper function to check if mobile
    const checkIfMobile = () => {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    
    // Setup listener for window resize
    const handleResize = () => {
      setIsMobile(checkIfMobile())
    }
    
    // Add event listener
    window.addEventListener("resize", handleResize)
    
    // Check immediately on mount
    handleResize()
    
    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return isMobile
}

// Hook to get viewport dimensions
export function useViewportSize() {
  const [size, setSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  React.useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    
    window.addEventListener('resize', updateSize)
    updateSize() // Initial size
    
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return size
}
