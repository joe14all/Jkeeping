import React, { useState } from 'react'
import { csvService } from '../../services/csvService'
import Button from '../ui/Button'
import styles from './CSVImport.module.css'

const CSVImport = ({ practiceId, onImportComplete }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    setFile(selectedFile)

    // Read and preview file
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target.result
      const transactions = csvService.parseCSV(text)
      setPreview(transactions.slice(0, 5)) // Preview first 5
    }
    reader.readAsText(selectedFile)
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const text = event.target.result
        const result = await csvService.importCSV(text, practiceId || 1)
        setResult(result)
        setImporting(false)

        // Wait 2 seconds then close and refresh
        setTimeout(() => {
          setIsOpen(false)
          onImportComplete && onImportComplete()
        }, 2000)
      }
      reader.readAsText(file)
    } catch (error) {
      console.error('Import failed:', error)
      setImporting(false)
    }
  }

  const handleExport = async () => {
    try {
      const csv = await csvService.exportCSV(practiceId)
      csvService.downloadCSV(csv, `transactions-${new Date().toISOString().split('T')[0]}.csv`)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (!isOpen) {
    return (
      <div className={styles.buttons}>
        <Button variant="outline" size="sm" icon="📂" onClick={() => setIsOpen(true)}>
          Import CSV
        </Button>
        <Button variant="outline" size="sm" icon="⤓" onClick={handleExport}>
          Export CSV
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.modal}>
      <div className={styles.overlay} onClick={() => setIsOpen(false)} />
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>Import Transactions from CSV</h2>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
            ✕
          </button>
        </div>

        {!result ? (
          <>
            <div className={styles.body}>
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className={styles.fileInput}
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className={styles.uploadLabel}>
                  <div className={styles.uploadIcon}>📄</div>
                  <div className={styles.uploadText}>
                    {file ? file.name : 'Click to select CSV file'}
                  </div>
                  <div className={styles.uploadHint}>
                    Supports bank statements from Chase, Bank of America, Wells Fargo, etc.
                  </div>
                </label>
              </div>

              {preview.length > 0 && (
                <div className={styles.preview}>
                  <h3 className={styles.previewTitle}>Preview (First 5 rows)</h3>
                  <table className={styles.previewTable}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((t, i) => (
                        <tr key={i}>
                          <td>{t.date}</td>
                          <td>{t.description}</td>
                          <td>${t.amount.toFixed(2)}</td>
                          <td>
                            <span className={`${styles.badge} ${styles[t.type]}`}>{t.type}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className={styles.footer}>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={!file || importing}
              >
                {importing ? 'Importing...' : 'Import Transactions'}
              </Button>
            </div>
          </>
        ) : (
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <div className={styles.successText}>
              Successfully imported {result.imported} transactions!
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CSVImport
