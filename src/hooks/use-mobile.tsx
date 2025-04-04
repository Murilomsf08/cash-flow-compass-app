
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Helper function to check if mobile
    const checkIfMobile = () => {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    
    // Immediately set initial state
    setIsMobile(checkIfMobile())
    
    // Setup listener for window resize
    const handleResize = () => {
      setIsMobile(checkIfMobile())
    }
    
    // Add event listener
    window.addEventListener("resize", handleResize)
    
    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return !!isMobile
}
