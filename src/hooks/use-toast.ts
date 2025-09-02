import * as React from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

type ToastContextType = {
  toast: (props: ToastProps) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToastContext)
  
  // 一時的な実装（後で本格的なトースト実装に置き換え）
  return {
    toast: (props: ToastProps) => {
      if (props.variant === "destructive") {
        console.error(`Error: ${props.title} - ${props.description}`)
        alert(`エラー: ${props.description}`)
      } else {
        console.log(`${props.title}: ${props.description}`)
        alert(`${props.title}: ${props.description}`)
      }
    }
  }
}