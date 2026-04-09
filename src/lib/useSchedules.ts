'use client'

import { useState, useEffect } from 'react'

export interface ScheduleItem {
  id: string
  title: string
  date: string
  spotIds: string[]
}

const STORAGE_KEY = 'tabispo_schedules'

export function useSchedules() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setSchedules(JSON.parse(saved))
      } catch (e) {
        // ignore JSON parse error
      }
    }
  }, [])

  const saveToLocal = (data: ScheduleItem[]) => {
    setSchedules(data)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  const addSchedule = (title: string, date: string) => {
    const newSchedule: ScheduleItem = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      date,
      spotIds: []
    }
    saveToLocal([...schedules, newSchedule])
  }

  const deleteSchedule = (id: string) => {
    saveToLocal(schedules.filter(s => s.id !== id))
  }

  const addSpot = (scheduleId: string, spotId: string) => {
    saveToLocal(schedules.map(s => {
      if (s.id === scheduleId) {
        if (!s.spotIds.includes(spotId)) {
          return { ...s, spotIds: [...s.spotIds, spotId] }
        }
      }
      return s
    }))
  }

  const removeSpot = (scheduleId: string, spotId: string) => {
    saveToLocal(schedules.map(s => {
      if (s.id === scheduleId) {
        return { ...s, spotIds: s.spotIds.filter(id => id !== spotId) }
      }
      return s
    }))
  }

  return { schedules, addSchedule, deleteSchedule, addSpot, removeSpot }
}
