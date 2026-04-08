import { renderHook, act } from '@testing-library/react'
import { useJournal } from './use-journal'
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('useJournal', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('should initialize with an empty array of entries', () => {
    const { result } = renderHook(() => useJournal())
    expect(result.current.entries).toEqual([])
  })

  it('should create a new entry', () => {
    const { result } = renderHook(() => useJournal())

    let entry
    act(() => {
      entry = result.current.createEntry('Test content', '😊')
    })

    expect(entry).toBeDefined()
    expect(entry?.content).toBe('Test content')
    expect(entry?.mood).toBe('😊')
    expect(result.current.entries.length).toBe(1)
    expect(result.current.entries[0]).toEqual(entry)
  })

  it('should update an existing entry', () => {
    const { result } = renderHook(() => useJournal())

    let entry: any
    act(() => {
      entry = result.current.createEntry('Original content', '😊')
    })

    act(() => {
      result.current.updateEntry(entry.id, 'Updated content', '😢')
    })

    const updatedEntry = result.current.getEntry(entry.id)
    expect(updatedEntry?.content).toBe('Updated content')
    expect(updatedEntry?.mood).toBe('😢')
  })

  it('should delete an entry', () => {
    const { result } = renderHook(() => useJournal())

    let entry: any
    act(() => {
      entry = result.current.createEntry('To be deleted', '😊')
    })

    expect(result.current.entries.length).toBe(1)

    act(() => {
      result.current.deleteEntry(entry.id)
    })

    expect(result.current.entries.length).toBe(0)
  })

  it('should load entries from localStorage', () => {
    const mockEntries = [
      {
        id: '1',
        content: 'Stored entry',
        mood: '😊',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    window.localStorage.setItem('unwind-journal-entries', JSON.stringify(mockEntries))

    const { result } = renderHook(() => useJournal())

    // We need to wait for the useEffect to run
    expect(result.current.entries).toEqual(mockEntries)
  })
})
