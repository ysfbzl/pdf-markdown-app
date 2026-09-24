import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [markdown, setMarkdown] = useState('')
  const [status, setStatus] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [selectedAccept, setSelectedAccept] = useState('*/*')

  const fileInputRef = useRef(null)
const [processingDots, setProcessingDots] = useState('')
useEffect(() => {
  if (status !== 'Converting...') {
    setProcessingDots('')
    return
  }

  const interval = setInterval(() => {
    setProcessingDots((dots) => {
      if (dots === '...') return ''
      return dots + '.'
    })
  }, 400)

  return () => clearInterval(interval)
}, [status])
  const formats = [
    { name: 'PDF', accept: '.pdf' },
    { name: 'DOCX', accept: '.docx' },
    { name: 'XLSX', accept: '.xlsx' },
    { name: 'CSV', accept: '.csv' },
    { name: 'HTML', accept: '.html,.htm' },
    { name: 'JSON', accept: '.json' },
    { name: 'XML', accept: '.xml' },
    { name: 'PPTX', accept: '.pptx' },
    { name: 'TXT', accept: '.txt' },
    { name: 'EPUB', accept: '.epub' },
    { name: 'ZIP', accept: '.zip' },
  ]

  const chooseFormat = (accept) => {
  setSelectedAccept(accept)

  if (fileInputRef.current) {
    fileInputRef.current.value = ''
    fileInputRef.current.accept = accept
    fileInputRef.current.click()
  }
}

  const selectFile = (selectedFile) => {
    if (!selectedFile) return

    setFile(selectedFile)
    setMarkdown('')
    setStatus('')
  }

  const handleFileChange = (event) => {
    selectFile(event.target.files[0])
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)

    const droppedFile = event.dataTransfer.files[0]
    selectFile(droppedFile)
  }

  const convertFile = async () => {
    if (!file) return

    setStatus('Converting...')
    setMarkdown('')

    const formData = new FormData()
    formData.append('file', file)

    try {
     const response = await fetch('https://pdf-markdown-app.onrender.com/convert', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Conversion failed')
      }

      const result = await response.text()

      setMarkdown(result)
      setStatus('Conversion complete')
    } catch (error) {
      console.error(error)
      setStatus('Something went wrong while converting the file.')
    }
  }

  const copyMarkdown = async () => {
    if (!markdown) return

    await navigator.clipboard.writeText(markdown)
    setStatus('Copied to clipboard')
  }

  const downloadMarkdown = () => {
    if (!markdown) return

    const blob = new Blob([markdown], {
      type: 'text/markdown',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'converted.md'
    link.click()

    URL.revokeObjectURL(url)
  }

  const clearWorkspace = () => {
    setFile(null)
    setMarkdown('')
    setStatus('')
    setIsDragging(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const goToConverter = () => {
    document.getElementById('converter')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const fileSize = file
    ? `${(file.size / 1024).toFixed(1)} KB`
    : ''

  return (
    <div className="app">

      {/* LEFT SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-mark">M</div>

          <div>
            <div className="brand-name">MarkFlow</div>
            <div className="brand-subtitle">
              document workspace
            </div>
          </div>
        </div>

        <div className="sidebar-section">

          <div className="sidebar-label">
            WORKSPACE
          </div>

          <button
            className="side-button active"
            onClick={clearWorkspace}
          >
            <span>＋</span>
            New conversion
          </button>

          <button
            className="side-button"
            onClick={goToConverter}
          >
            <span>⌁</span>
            Converter
          </button>

        </div>

        <div className="sidebar-section">

          <div className="sidebar-label">
            SUPPORTED
          </div>

          <div className="format-list">

            {formats.map((format) => (
              <button
                key={format.name}
                className="format-button"
                onClick={() => chooseFormat(format.accept)}
              >
                {format.name}
              </button>
            ))}

          </div>

        </div>

        <div className="sidebar-bottom">

          <div className="engine">

            <div className="status-dot"></div>

            <div>
              <strong>Engine online</strong>
              <small>Microsoft MarkItDown</small>
            </div>

          </div>

        </div>

      </aside>

      {/* MAIN AREA */}
      <main className="workspace">

        <header className="topbar">

          <div>
            <span className="breadcrumb">
              WORKSPACE
            </span>

            <h1>
              Document converter
            </h1>
          </div>

          {file && (
            <button
              className="clear-button"
              onClick={clearWorkspace}
            >
              Clear workspace
            </button>
          )}

        </header>

        <div className="content">

          {/* UPLOAD AREA */}
          <section
            id="converter"
            className="upload-section"
          >

            <div className="section-heading">

              <div>
                <span className="eyebrow">
                  INPUT
                </span>

                <h2>
                  Bring in a document
                </h2>

                <p>
                  Drop a file here and turn its contents into Markdown.
                </p>
              </div>

            </div>

            <div
              className={`drop-zone ${
                isDragging ? 'dragging' : ''
              }`}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                  fileInputRef.current.click()
                }
              }}
            >

              <input
                ref={fileInputRef}
                type="file"
                accept={selectedAccept}
                onChange={handleFileChange}
                hidden
              />

              <div className="drop-icon">
                ↓
              </div>

              <h3>
                {isDragging
                  ? 'Release to upload'
                  : 'Drop your document here'}
              </h3>

              <p>
                or{' '}
                <span>
                  browse from your computer
                </span>
              </p>

              <div className="file-note">
                PDF · DOCX · XLSX · CSV · HTML · JSON · XML · PPTX
              </div>

            </div>

            {/* SELECTED FILE */}
            {file && (
              <div className="file-card">

                <div className="file-icon">
                  {file.name
                    .split('.')
                    .pop()
                    .toUpperCase()}
                </div>

                <div className="file-details">
                  <strong>
                    {file.name}
                  </strong>

                  <span>
                    {fileSize}
                  </span>
                </div>

                <div className="file-ready">
                  <span></span>
                  Ready
                </div>

              </div>
            )}

            <button
              className="convert-button"
              disabled={
                !file ||
                status === 'Converting...'
              }
              onClick={convertFile}
            >
              {status === 'Converting...'
  ? `Converting${processingDots}`
  : 'Convert to Markdown →'}
            </button>

            {status &&
              status !== 'Converting...' && (
                <div className="status-message">
                  {status}
                </div>
              )}

          </section>

          {/* OUTPUT AREA */}
          <section className="output-section">

            <div className="output-header">

              <div>
                <span className="eyebrow">
                  OUTPUT
                </span>

                <h2>
                  Markdown document
                </h2>
              </div>

              <div className="output-actions">

                <button
                  onClick={copyMarkdown}
                  disabled={!markdown}
                >
                  Copy
                </button>

                <button
                  onClick={downloadMarkdown}
                  disabled={!markdown}
                >
                  Download
                </button>

              </div>

            </div>

            <div className="editor">

              <div className="editor-bar">

                <div className="window-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <span className="editor-title">
                  converted.md
                </span>

                {markdown && (
                  <span className="editor-status">
                    saved
                  </span>
                )}

              </div>

              <div className="editor-body">

  {status === 'Converting...' ? (
    <div className="conversion-progress">

      <div className="conversion-symbol">
        ↓
      </div>

      <strong className="conversion-title">
        CONVERTING{processingDots}
      </strong>

      <p className="conversion-file">
        Processing {file?.name}
      </p>

      <div className="conversion-line">
        <div className="conversion-line-fill"></div>
      </div>

      <small className="conversion-subtitle">
        Turning your document into Markdown
      </small>

    </div>

  ) : !markdown ? (

    <div className="empty-editor">

      <div className="empty-symbol">
        #
      </div>

      <p>
        Your converted Markdown will appear here.
      </p>

      <small>
        Upload a document to begin.
      </small>

    </div>

  ) : (

    <pre>{markdown}</pre>

  )}

</div>
              <div className="editor-footer">

                <span>
                  MARKDOWN
                </span>

                {markdown && (
                  <span>
                    {markdown.length.toLocaleString()} characters
                  </span>
                )}

              </div>

            </div>

          </section>

        </div>

        <footer>

          <span>
            MarkFlow
          </span>

          <span>
            Local processing workspace
          </span>

          <span>
            Powered by MarkItDown
          </span>

        </footer>

      </main>

    </div>
  )
}

export default App