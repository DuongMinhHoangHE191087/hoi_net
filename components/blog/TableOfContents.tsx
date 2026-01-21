'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List, X } from 'lucide-react'

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Extract headings from HTML content
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content

    const headingElements = tempDiv.querySelectorAll('h1, h2, h3')
    const extractedHeadings: Heading[] = []

    headingElements.forEach((heading, index) => {
      const text = heading.textContent || ''
      const level = parseInt(heading.tagName.charAt(1))
      const id = `heading-${index}`

      // Add ID to heading if it doesn't have one
      heading.id = id

      extractedHeadings.push({ id, text, level })
    })

    setHeadings(extractedHeadings)

    // Update actual DOM headings with IDs
    setTimeout(() => {
      const actualHeadings = document.querySelectorAll('article h1, article h2, article h3')
      actualHeadings.forEach((heading, index) => {
        heading.id = `heading-${index}`
      })
    }, 100)
  }, [content])

  useEffect(() => {
    // Track scroll position and highlight active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-100px 0px -66%',
      }
    )

    const headingElements = document.querySelectorAll('[id^="heading-"]')
    headingElements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [headings])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  if (headings.length === 0) return null

  return (
    <>
      {/* Mobile Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-40 p-4 bg-gradient-primary text-white rounded-full shadow-glow-pink"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <List className="w-6 h-6" />}
      </motion.button>

      {/* Desktop Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="hidden lg:block fixed top-32 right-8 w-64 max-h-[calc(100vh-200px)] overflow-y-auto"
      >
        <div className="glassmorphism-strong p-6 rounded-2xl sticky top-32">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <List className="w-5 h-5 text-primary" />
            Mục Lục
          </h3>
          <nav>
            <ul className="space-y-2">
              {headings.map((heading) => (
                <motion.li
                  key={heading.id}
                  style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
                  whileHover={{ x: 4 }}
                >
                  <button
                    onClick={() => scrollToHeading(heading.id)}
                    className={`text-left w-full text-sm transition-colors ${
                      activeId === heading.id
                        ? 'text-primary font-semibold'
                        : 'text-gray-600 hover:text-primary'
                    }`}
                  >
                    {heading.text}
                  </button>
                </motion.li>
              ))}
            </ul>
          </nav>
        </div>
      </motion.div>

      {/* Mobile Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-end justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="glassmorphism-strong max-w-lg w-full max-h-[70vh] overflow-y-auto p-6 rounded-t-3xl"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <List className="w-5 h-5 text-primary" />
                Mục Lục
              </h3>
              <nav>
                <ul className="space-y-3">
                  {headings.map((heading) => (
                    <motion.li
                      key={heading.id}
                      style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={() => {
                          scrollToHeading(heading.id)
                          setIsOpen(false)
                        }}
                        className={`text-left w-full transition-colors ${
                          activeId === heading.id
                            ? 'text-primary font-semibold text-base'
                            : 'text-gray-600 text-sm'
                        }`}
                      >
                        {heading.text}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
