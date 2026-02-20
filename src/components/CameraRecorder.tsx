import { useState, useRef, useCallback, useEffect } from 'react'

interface CameraRecorderProps {
  onRecordingComplete: (file: File) => void
  onClose: () => void
}

type RecorderState = 'idle' | 'previewing' | 'recording' | 'review'

export default function CameraRecorder({ onRecordingComplete, onClose }: CameraRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const reviewRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const startPreview = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setState('previewing')
    } catch {
      setError('Could not access camera. Please allow camera permissions and try again.')
      setState('idle')
    }
  }, [])

  useEffect(() => {
    startPreview()
    return () => {
      stopStream()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [startPreview, stopStream])

  const startRecording = () => {
    if (!streamRef.current) return

    chunksRef.current = []
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4'

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType,
      videoBitsPerSecond: 2_000_000,
    })

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType })
      setRecordedBlob(blob)
      stopStream()
      setState('review')
    }

    mediaRecorderRef.current = recorder
    recorder.start(1000)
    setState('recording')
    setElapsed(0)
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
  }

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    mediaRecorderRef.current?.stop()
  }

  const handleConfirm = () => {
    if (!recordedBlob) return
    const isWebm = recordedBlob.type.includes('webm')
    const ext = isWebm ? 'webm' : 'mp4'
    const mimeType = isWebm ? 'video/webm' : 'video/mp4'
    const file = new File([recordedBlob], `recording-${Date.now()}.${ext}`, { type: mimeType })
    onRecordingComplete(file)
  }

  const handleReRecord = async () => {
    setRecordedBlob(null)
    setElapsed(0)
    setState('idle')
    await startPreview()
  }

  const handleClose = () => {
    stopStream()
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRecorderRef.current?.stop()
    onClose()
  }

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (state === 'review' && reviewRef.current && recordedBlob) {
      reviewRef.current.src = URL.createObjectURL(recordedBlob)
    }
  }, [state, recordedBlob])

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 bg-black/60 z-10">
        <button onClick={handleClose} className="text-white/80 hover:text-white p-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {state === 'recording' && (
          <div className="flex items-center gap-2 bg-red-600/90 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-white text-sm font-bold tabular-nums">{fmt(elapsed)}</span>
          </div>
        )}
        <div className="w-10" />
      </div>

      {/* Camera / Review view */}
      <div className="flex-1 relative overflow-hidden">
        {state !== 'review' && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {state === 'review' && (
          <video
            ref={reviewRef}
            controls
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-contain bg-black"
          />
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl p-6 text-center max-w-xs">
              <p className="text-sm text-red-600 font-medium mb-3">{error}</p>
              <button onClick={startPreview} className="text-sm text-primary-600 font-bold">
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="bg-black/60 px-4 py-6 flex items-center justify-center gap-6">
        {state === 'previewing' && (
          <button
            onClick={startRecording}
            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-red-500" />
          </button>
        )}
        {state === 'recording' && (
          <button
            onClick={stopRecording}
            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center"
          >
            <div className="w-8 h-8 rounded-sm bg-red-500" />
          </button>
        )}
        {state === 'review' && (
          <div className="flex items-center gap-4 w-full max-w-xs">
            <button
              onClick={handleReRecord}
              className="flex-1 py-3 rounded-xl border-2 border-white/50 text-white text-sm font-bold"
            >
              Re-record
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 rounded-xl bg-primary-500 border-2 border-primary-600 text-white text-sm font-bold"
            >
              Use Video
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
