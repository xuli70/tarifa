import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // iOS Safari: use both deprecated and modern API for maximum compatibility
    // Older Safari versions only support addListener (deprecated)
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange)
    } else if (mql.addListener) {
      // Deprecated but needed for Safari < 14
      mql.addListener(onChange)
    }

    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", onChange)
      } else if (mql.removeListener) {
        // Deprecated but needed for Safari < 14
        mql.removeListener(onChange)
      }
    }
  }, [])

  return !!isMobile
}
