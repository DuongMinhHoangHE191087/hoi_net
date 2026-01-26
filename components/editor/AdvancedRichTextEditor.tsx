'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import Youtube from '@tiptap/extension-youtube'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import CharacterCount from '@tiptap/extension-character-count'
import { createLowlight, common } from 'lowlight'
import { useCallback, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  List, ListOrdered, ListChecks, Quote, Undo, Redo,
  Link2, Image as ImageIcon, Video, Minus, Table as TableIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Subscript as SubIcon, Superscript as SupIcon,
  RemoveFormatting, FileCode,
  ChevronDown, Type, Trash2, Columns, Rows,
  ArrowUpFromLine, ArrowDownFromLine, ArrowLeftFromLine, ArrowRightFromLine
} from 'lucide-react'

import { VideoExtension } from './extensions/VideoExtension'
import { IframeExtension } from './extensions/IframeExtension'
import {
  ImageUploadModal,
  VideoEmbedModal,
  LinkModal,
  TableModal,
  CodeBlockModal,
  ColorPicker
} from './modals'

const lowlight = createLowlight(common)

interface AdvancedRichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  editable?: boolean
  maxLength?: number
  showWordCount?: boolean
}

export default function AdvancedRichTextEditor({
  content,
  onChange,
  placeholder = 'Bắt đầu viết bài của bạn...',
  className = '',
  editable = true,
  maxLength,
  showWordCount = true,
}: AdvancedRichTextEditorProps) {
  const [showImageModal, setShowImageModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showTableModal, setShowTableModal] = useState(false)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false)
  const [showMoreTools, setShowMoreTools] = useState(false)
  const [currentLinkUrl, setCurrentLinkUrl] = useState('')
  const [currentLinkText, setCurrentLinkText] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4 mx-auto block',
        },
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4',
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-3 py-2',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-3 py-2 bg-gray-100 font-semibold',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'rounded-lg my-4 mx-auto',
        },
      }),
      Subscript,
      Superscript,
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'code-block rounded-lg my-4 p-4 bg-gray-900 text-gray-100 overflow-x-auto',
        },
      }),
      VideoExtension,
      IframeExtension,
      CharacterCount.configure({
        limit: maxLength,
      }),
    ],
    content,
    editable,
    immediatelyRender: false, // Required for SSR/Next.js to avoid hydration mismatches
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Link handlers
  const openLinkModal = useCallback(() => {
    if (!editor) return
    const { href } = editor.getAttributes('link')
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ''
    )
    setCurrentLinkUrl(href || '')
    setCurrentLinkText(selectedText)
    setShowLinkModal(true)
  }, [editor])

  const handleInsertLink = useCallback((url: string, text?: string, openInNewTab?: boolean) => {
    if (!editor) return

    const attrs: { href: string; target?: string; rel?: string } = { href: url }
    if (openInNewTab) {
      attrs.target = '_blank'
      attrs.rel = 'noopener noreferrer'
    }

    if (text && editor.state.selection.empty) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}"${openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`)
        .run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink(attrs).run()
    }
  }, [editor])

  const handleRemoveLink = useCallback(() => {
    if (!editor) return
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
  }, [editor])

  // Image handler
  const handleInsertImage = useCallback((url: string, alt?: string) => {
    if (!editor) return
    editor.chain().focus().setImage({ src: url, alt: alt || '' }).run()
  }, [editor])

  // Video handlers
  const handleInsertYoutube = useCallback((url: string) => {
    if (!editor) return
    editor.chain().focus().setYoutubeVideo({ src: url }).run()
  }, [editor])

  const handleInsertVideo = useCallback((url: string) => {
    if (!editor) return
    editor.chain().focus().setVideo({ src: url }).run()
  }, [editor])

  const handleInsertIframe = useCallback((url: string) => {
    if (!editor) return
    editor.chain().focus().setIframe({ src: url }).run()
  }, [editor])

  // Table handler
  const handleInsertTable = useCallback((rows: number, cols: number, withHeader: boolean) => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: withHeader }).run()
  }, [editor])

  // Code block handler
  const handleInsertCodeBlock = useCallback((code: string, language: string) => {
    if (!editor) return
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'codeBlock',
        attrs: { language },
        content: [{ type: 'text', text: code }],
      })
      .run()
  }, [editor])

  if (!editor) {
    return (
      <div className={`border border-gray-200 rounded-xl overflow-hidden bg-white animate-pulse ${className}`}>
        <div className="h-12 bg-gray-100 border-b border-gray-200" />
        <div className="h-[300px] p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    )
  }

  const currentHeading = (() => {
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive('heading', { level: i })) return `H${i}`
    }
    return 'Văn bản'
  })()

  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm ${className}`}>
      {/* Main Toolbar */}
      {editable && (
        <div className="border-b border-gray-200 bg-gray-50">
          {/* Row 1: Text formatting */}
          <div className="p-2 flex flex-wrap gap-1 items-center border-b border-gray-100">
            {/* Heading Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 flex items-center gap-1 min-w-[100px]"
              >
                <Type className="w-4 h-4" />
                {currentHeading}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showHeadingDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[150px]">
                  <button
                    onClick={() => {
                      editor.chain().focus().setParagraph().run()
                      setShowHeadingDropdown(false)
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${
                      editor.isActive('paragraph') ? 'bg-primary/10 text-primary' : ''
                    }`}
                  >
                    Văn bản thường
                  </button>
                  {[1, 2, 3, 4, 5, 6].map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        editor.chain().focus().toggleHeading({ level: level as 1|2|3|4|5|6 }).run()
                        setShowHeadingDropdown(false)
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${
                        editor.isActive('heading', { level }) ? 'bg-primary/10 text-primary' : ''
                      }`}
                      style={{ fontSize: `${1.5 - level * 0.15}rem`, fontWeight: 600 }}
                    >
                      Heading {level}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Text Formatting */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Đậm (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Nghiêng (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Gạch chân (Ctrl+U)"
            >
              <UnderlineIcon className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Gạch ngang"
            >
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Code inline"
            >
              <Code className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Colors */}
            <ColorPicker
              type="text"
              currentColor={editor.getAttributes('textStyle').color}
              onSelect={(color) => editor.chain().focus().setColor(color).run()}
              onRemove={() => editor.chain().focus().unsetColor().run()}
            />

            <ColorPicker
              type="highlight"
              currentColor={editor.getAttributes('highlight').color}
              onSelect={(color) => editor.chain().focus().setHighlight({ color }).run()}
              onRemove={() => editor.chain().focus().unsetHighlight().run()}
            />

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Subscript/Superscript */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              isActive={editor.isActive('subscript')}
              title="Chỉ số dưới"
            >
              <SubIcon className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              isActive={editor.isActive('superscript')}
              title="Chỉ số trên"
            >
              <SupIcon className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Clear Formatting */}
            <ToolbarButton
              onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
              title="Xóa định dạng"
            >
              <RemoveFormatting className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Row 2: Structure and Insert */}
          <div className="p-2 flex flex-wrap gap-1 items-center">
            {/* Alignment */}
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="Căn trái"
            >
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              title="Căn giữa"
            >
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="Căn phải"
            >
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              isActive={editor.isActive({ textAlign: 'justify' })}
              title="Căn đều"
            >
              <AlignJustify className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Lists */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Danh sách"
            >
              <List className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Danh sách số"
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              isActive={editor.isActive('taskList')}
              title="Danh sách việc cần làm"
            >
              <ListChecks className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Trích dẫn"
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Insert */}
            <ToolbarButton onClick={openLinkModal} isActive={editor.isActive('link')} title="Chèn liên kết">
              <Link2 className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton onClick={() => setShowImageModal(true)} title="Chèn hình ảnh">
              <ImageIcon className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton onClick={() => setShowVideoModal(true)} title="Chèn video">
              <Video className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton onClick={() => setShowTableModal(true)} title="Chèn bảng">
              <TableIcon className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton onClick={() => setShowCodeModal(true)} title="Chèn code block">
              <FileCode className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Đường kẻ ngang"
            >
              <Minus className="w-4 h-4" />
            </ToolbarButton>

            <div className="flex-1" />

            {/* History */}
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Hoàn tác (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Làm lại (Ctrl+Shift+Z)"
            >
              <Redo className="w-4 h-4" />
            </ToolbarButton>
          </div>
        </div>
      )}

      {/* Table Controls - shown when table is active */}
      {editor && editor.isActive('table') && (
        <div className="bg-blue-50 border-b border-blue-200 p-2 flex gap-1 flex-wrap items-center">
          <span className="text-sm text-blue-700 font-medium mr-2">Bảng:</span>
          <ToolbarButton
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            title="Thêm cột trái"
          >
            <ArrowLeftFromLine className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            title="Thêm cột phải"
          >
            <ArrowRightFromLine className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().addRowBefore().run()}
            title="Thêm hàng trên"
          >
            <ArrowUpFromLine className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().addRowAfter().run()}
            title="Thêm hàng dưới"
          >
            <ArrowDownFromLine className="w-4 h-4" />
          </ToolbarButton>
          <div className="w-px h-6 bg-blue-300 mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().deleteColumn().run()}
            title="Xóa cột"
          >
            <Columns className="w-4 h-4 text-red-500" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().deleteRow().run()}
            title="Xóa hàng"
          >
            <Rows className="w-4 h-4 text-red-500" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().deleteTable().run()}
            title="Xóa bảng"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </ToolbarButton>
        </div>
      )}

      {/* Editor Content */}
      <div
        className={`prose prose-sm sm:prose lg:prose-lg max-w-none p-4 sm:p-6 min-h-[400px] focus:outline-none ${
          !editable ? 'bg-gray-50' : ''
        }`}
      >
        <EditorContent editor={editor} className="editor-content" />
      </div>

      {/* Footer with word count */}
      {showWordCount && (
        <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 flex justify-between text-sm text-gray-500">
          <span>
            {editor.storage.characterCount.words()} từ
          </span>
          <span>
            {editor.storage.characterCount.characters()}
            {maxLength && ` / ${maxLength}`} ký tự
          </span>
        </div>
      )}

      {/* Modals */}
      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onInsert={handleInsertImage}
      />

      <VideoEmbedModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        onInsertYoutube={handleInsertYoutube}
        onInsertVideo={handleInsertVideo}
        onInsertIframe={handleInsertIframe}
      />

      <LinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onInsert={handleInsertLink}
        onRemove={handleRemoveLink}
        initialUrl={currentLinkUrl}
        initialText={currentLinkText}
      />

      <TableModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onInsert={handleInsertTable}
      />

      <CodeBlockModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        onInsert={handleInsertCodeBlock}
      />
    </div>
  )
}

// Toolbar Button Component
interface ToolbarButtonProps {
  onClick?: () => void
  isActive?: boolean
  disabled?: boolean
  title?: string
  children: React.ReactNode
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary text-white shadow-sm'
          : disabled
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
      }`}
    >
      {children}
    </motion.button>
  )
}

