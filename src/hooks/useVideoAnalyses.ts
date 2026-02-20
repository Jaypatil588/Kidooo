import { useState, useEffect, useCallback, useRef } from 'react'
import type { VideoAnalysis } from '../types'
import { fetchVideos, uploadVideo as uploadVideoApi, uploadReport as uploadReportApi } from '../api'

export type UploadStatus = 'idle' | 'uploading' | 'error'

export interface ActiveJob {
  videoId: number
  uploadPercent: number | null
  analysis: VideoAnalysis | null
}

export function useVideoAnalyses() {
  const [analyses, setAnalyses] = useState<VideoAnalysis[]>([])
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadPercent, setUploadPercent] = useState(0)
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = useCallback(async () => {
    try {
      const data = await fetchVideos()
      setAnalyses(data)
      return data
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const hasProcessing = analyses.some(
      (a) => a.status === 'compressing' || a.status === 'analyzing'
    )
    const shouldPoll = hasProcessing || activeJob !== null

    if (shouldPoll && !pollRef.current) {
      pollRef.current = setInterval(async () => {
        const data = await refresh()
        if (data && activeJob) {
          const current = data.find((a) => a.id === activeJob.videoId)
          if (current) {
            setActiveJob((prev) =>
              prev ? { ...prev, analysis: current, uploadPercent: null } : null
            )
            if (current.status === 'completed' || current.status === 'error') {
              setTimeout(() => setActiveJob(null), 4000)
            }
          }
        }
      }, 2000)
    }

    if (!shouldPoll && !activeJob && pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [analyses, activeJob, refresh])

  const uploadVideo = useCallback(
    async (file: File, scenarioId: string, childId: string, childName: string) => {
      setUploadStatus('uploading')
      setUploadError(null)
      setUploadPercent(0)
      try {
        const record = await uploadVideoApi(file, scenarioId, childId, childName, (progress) => {
          setUploadPercent(progress.percent)
        })
        setAnalyses((prev) => [...prev, record])
        setUploadStatus('idle')
        setUploadPercent(100)
        setActiveJob({
          videoId: record.id,
          uploadPercent: null,
          analysis: record,
        })
        return record
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setUploadError(message)
        setUploadStatus('error')
        setActiveJob(null)
        throw err
      }
    },
    []
  )

  const uploadReport = useCallback(
    async (file: File, childId: string, childName: string) => {
      setUploadStatus('uploading')
      setUploadError(null)
      setUploadPercent(0)
      try {
        const record = await uploadReportApi(file, childId, childName, (progress) => {
          setUploadPercent(progress.percent)
        })
        setAnalyses((prev) => [...prev, record])
        setUploadStatus('idle')
        setUploadPercent(100)
        setActiveJob({
          videoId: record.id,
          uploadPercent: null,
          analysis: record,
        })
        return record
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setUploadError(message)
        setUploadStatus('error')
        setActiveJob(null)
        throw err
      }
    },
    []
  )

  const dismissActiveJob = useCallback(() => {
    setActiveJob(null)
  }, [])

  const recentAnalyses = [...analyses].sort((a, b) => b.id - a.id).slice(0, 5)
  const allAnalysesByIdAsc = [...analyses].sort((a, b) => a.id - b.id)

  return {
    analyses,
    recentAnalyses,
    allAnalysesByIdAsc,
    uploadStatus,
    uploadError,
    uploadPercent,
    activeJob,
    uploadVideo,
    uploadReport,
    dismissActiveJob,
    refresh,
  }
}
