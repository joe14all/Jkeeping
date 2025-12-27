import React, { useState, useEffect } from 'react'
import { practiceService } from '../../services/practiceService'
import styles from './PracticeSelector.module.css'

const PracticeSelector = ({ value, onChange }) => {
  const [practices, setPractices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPractices = async () => {
      try {
        const data = await practiceService.getActive()
        setPractices(data)
      } catch (error) {
        console.error('Failed to load practices:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPractices()
  }, [])

  if (loading) return <div className={styles.loading}>Loading practices...</div>

  return (
    <div className={styles.container}>
      <select
        className={styles.select}
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
      >
        <option value="">All Practices</option>
        {practices.map((practice) => (
          <option key={practice.id} value={practice.id}>
            {practice.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default PracticeSelector
