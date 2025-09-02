'use client'

import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 初期値を取得するヘルパー関数
  const getStoredValue = (): T => {
    try {
      if (typeof window === 'undefined') {
        return initialValue
      }
      
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }

  // 状態の初期化
  const [storedValue, setStoredValue] = useState<T>(getStoredValue)

  // ローカルストレージから値を読み込む（クライアントサイドでのみ実行）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStoredValue(getStoredValue())
    }
  }, [])

  // 値を設定し、ローカルストレージに保存する関数
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 関数の場合は現在の値を引数として渡す
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}