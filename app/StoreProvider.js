'use client'
import { useEffect, useRef } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { makeStore } from '../lib/store'
import { setProduct } from '@/lib/features/product/productSlice'

function Bootstrapper() {
  const dispatch = useDispatch()

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed')
        const json = await res.json()
        if (!ignore && json?.ok && Array.isArray(json?.data) && json.data.length > 0) {
          dispatch(setProduct(json.data))
        }
      } catch (e) {
        // keep dummy data on failure
      }
    }
    load()
    return () => { ignore = true }
  }, [dispatch])

  return null
}

export default function StoreProvider({ children }) {
  const storeRef = useRef(undefined)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  return (
    <Provider store={storeRef.current}>
      <Bootstrapper />
      {children}
    </Provider>
  )
}
