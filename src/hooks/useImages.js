import { useState, useEffect, useCallback } from 'react'
import { imageStore, compressImage } from '../utils/imageStore'

const MAX_IMAGES = 3

export function useImages(expenseId) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!expenseId) return
    setLoading(true)
    imageStore.getByExpenseId(expenseId)
      .then(setImages)
      .catch(() => setImages([]))
      .finally(() => setLoading(false))
  }, [expenseId])

  const addImage = useCallback(async (file) => {
    if (!expenseId) return
    if (images.length >= MAX_IMAGES) return
    const dataUrl = await compressImage(file)
    const record = await imageStore.add({ expenseId, dataUrl, filename: file.name })
    setImages(prev => [...prev, record])
  }, [expenseId, images.length])

  const deleteImage = useCallback(async (id) => {
    await imageStore.delete(id)
    setImages(prev => prev.filter(img => img.id !== id))
  }, [])

  return { images, addImage, deleteImage, loading }
}
