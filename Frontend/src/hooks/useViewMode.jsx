import { useState, useEffect } from 'react'

export const useViewMode = (initialMode = 'table') => {
  const [viewMode, setViewMode] = useState(() => {
    // Try to get saved preference from localStorage
    const savedMode = localStorage.getItem('viewMode')
    return savedMode || initialMode
  })
  
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      // Auto-switch to card view on mobile if not manually set
      if (mobile && !localStorage.getItem('viewMode')) {
        setViewMode('card')
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Save preference when viewMode changes
  useEffect(() => {
    localStorage.setItem('viewMode', viewMode)
  }, [viewMode])

  return {
    viewMode,
    setViewMode,
    isMobile
  }
}