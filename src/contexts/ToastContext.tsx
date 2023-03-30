import { Toast } from '@hulkfinance/hulk-uikit'
import React, { createContext, useReducer } from 'react'

const initialState: Toast[] = []

export const toastReducer = (state: Toast[], action: any) => {
  switch (action.type) {
    case 'add':
      return [action.payload.toast, ...state]
    case 'remove':
      return state.filter((prevToast) => prevToast.id !== action.payload.id)
    default:
      return state
  }
}

export const ToastContext = createContext<{
  toasts: Toast[]
  addToast: (toast: Toast) => void
  removeToast: (id: string) => void
}>({
  toasts: [],
  addToast: (toast) => {
    // console.log(toast)
  },
  removeToast: (id) => {
    // console.log(id)
  },
})

export default function ToastProvider({ children }: any) {
  const [toasts, dispatch] = useReducer(toastReducer, initialState)
  const removeToast = (id: string) => {
    dispatch({ type: 'remove', payload: { id } })
  }
  const addToast = (toast: Toast) => {
    dispatch({ type: 'add', payload: { toast } })
  }

  return (
    <ToastContext.Provider
      value={{
        toasts,
        removeToast,
        addToast,
      }}
    >
      {children}
    </ToastContext.Provider>
  )
}
