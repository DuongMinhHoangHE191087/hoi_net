import { useEffect, useState, useRef } from 'react'

/**
 * Debounce hook - delays execution until user stops typing
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set timeout to update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup timeout if value changes before delay
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Throttle hook - limits execution frequency
 * @param callback - Function to throttle
 * @param delay - Minimum time between executions (default: 300ms)
 * @returns Throttled function
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const lastRan = useRef<number>(Date.now())

  return ((...args) => {
    const now = Date.now()

    if (now - lastRan.current >= delay) {
      callback(...args)
      lastRan.current = now
    }
  }) as T
}
