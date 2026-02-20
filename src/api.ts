import type { VideoAnalysis } from './types'

const API_BASE = '/api'

export async function fetchVideos(): Promise<VideoAnalysis[]> {
  const res = await fetch(`${API_BASE}/videos`)
  if (!res.ok) throw new Error('Failed to fetch videos')
  return res.json()
}

export async function fetchVideoById(id: number): Promise<VideoAnalysis> {
  const res = await fetch(`${API_BASE}/videos/${id}`)
  if (!res.ok) throw new Error('Failed to fetch video')
  return res.json()
}

export interface UploadProgress {
  percent: number
}

export function uploadVideo(
  file: File,
  scenarioId: string,
  childId: string,
  childName: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<VideoAnalysis> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({ percent: Math.round((e.loaded / e.total) * 100) })
      }
    })

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data)
        } else {
          reject(new Error(data.error || 'Upload failed'))
        }
      } catch {
        reject(new Error('Upload failed — invalid server response'))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))

    const formData = new FormData()
    formData.append('video', file)
    formData.append('scenarioId', scenarioId)
    formData.append('childId', childId)
    formData.append('childName', childName)

    xhr.open('POST', `${API_BASE}/videos/upload`)
    xhr.send(formData)
  })
}

export function uploadReport(
  file: File,
  childId: string,
  childName: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<VideoAnalysis> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({ percent: Math.round((e.loaded / e.total) * 100) })
      }
    })

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data)
        } else {
          reject(new Error(data.error || 'Upload failed'))
        }
      } catch {
        reject(new Error('Upload failed — invalid server response'))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))

    const formData = new FormData()
    formData.append('report', file)
    formData.append('childId', childId)
    formData.append('childName', childName)

    xhr.open('POST', `${API_BASE}/reports/upload`)
    xhr.send(formData)
  })
}
