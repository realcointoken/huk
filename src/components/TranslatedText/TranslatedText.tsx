import React from 'react'
import useI18n from '../../hooks/useI18n'

export interface TranslatedTextProps {
  text: string
  children: string
}

const TranslatedText = ({ text, children }: TranslatedTextProps) => {
  const TranslateString = useI18n()
  return <>{TranslateString(text, children)}</>
}

export default TranslatedText
