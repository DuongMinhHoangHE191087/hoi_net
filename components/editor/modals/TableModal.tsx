'use client'

import { useState } from 'react'
import { X, Grid3X3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TableModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (rows: number, cols: number, withHeader: boolean) => void
}

export default function TableModal({ isOpen, onClose, onInsert }: TableModalProps) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [withHeader, setWithHeader] = useState(true)
  const [hoverCell, setHoverCell] = useState({ row: 0, col: 0 })

  const maxPreviewRows = 6
  const maxPreviewCols = 8

  const handleInsert = () => {
    if (rows > 0 && cols > 0) {
      onInsert(rows, cols, withHeader)
      handleClose()
    }
  }

  const handleClose = () => {
    setRows(3)
    setCols(3)
    setWithHeader(true)
    setHoverCell({ row: 0, col: 0 })
    onClose()
  }

  const handleCellHover = (row: number, col: number) => {
    setHoverCell({ row, col })
    setRows(row + 1)
    setCols(col + 1)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Grid3X3 className="w-5 h-5" />
              Chèn bảng
            </h3>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Grid Selector */}
            <div className="flex justify-center">
              <div className="inline-block">
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${maxPreviewCols}, 1fr)` }}>
                  {Array.from({ length: maxPreviewRows }).map((_, rowIndex) =>
                    Array.from({ length: maxPreviewCols }).map((_, colIndex) => (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                        onClick={handleInsert}
                        className={`w-6 h-6 border rounded transition-colors ${
                          rowIndex <= hoverCell.row && colIndex <= hoverCell.col
                            ? 'bg-primary/20 border-primary'
                            : 'bg-gray-100 border-gray-300 hover:border-gray-400'
                        }`}
                      />
                    ))
                  )}
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  {rows} x {cols}
                </p>
              </div>
            </div>

            {/* Manual Input */}
            <div className="flex gap-4 items-center justify-center">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Hàng:</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={rows}
                  onChange={(e) => setRows(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                />
              </div>
              <span className="text-gray-400">x</span>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Cột:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={cols}
                  onChange={(e) => setCols(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-center gap-3">
              <input
                type="checkbox"
                id="withHeader"
                checked={withHeader}
                onChange={(e) => setWithHeader(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="withHeader" className="text-sm text-gray-700">
                Hàng tiêu đề (header)
              </label>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  {withHeader && (
                    <tr>
                      {Array.from({ length: Math.min(cols, 5) }).map((_, i) => (
                        <th key={i} className="border border-gray-300 px-2 py-1 bg-gray-200 font-medium">
                          Tiêu đề {i + 1}
                        </th>
                      ))}
                      {cols > 5 && <th className="border border-gray-300 px-2 py-1 bg-gray-200">...</th>}
                    </tr>
                  )}
                </thead>
                <tbody>
                  {Array.from({ length: Math.min(withHeader ? rows - 1 : rows, 3) }).map((_, rowIdx) => (
                    <tr key={rowIdx}>
                      {Array.from({ length: Math.min(cols, 5) }).map((_, colIdx) => (
                        <td key={colIdx} className="border border-gray-300 px-2 py-1">
                          Ô {rowIdx + 1}-{colIdx + 1}
                        </td>
                      ))}
                      {cols > 5 && <td className="border border-gray-300 px-2 py-1">...</td>}
                    </tr>
                  ))}
                  {(withHeader ? rows - 1 : rows) > 3 && (
                    <tr>
                      <td colSpan={Math.min(cols, 6)} className="text-center text-gray-400 py-1">
                        ...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleInsert}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Chèn bảng
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
