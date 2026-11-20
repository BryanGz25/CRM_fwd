import { createContext, useContext } from 'react'

export const CRMContext = createContext(null)

export function useCRM() {
  const contexto = useContext(CRMContext)
  if (!contexto) throw new Error('useCRM debe usarse dentro de <CRMProvider>')
  return contexto
}
