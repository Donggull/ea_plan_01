'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MicrophoneIcon,
  StopIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  onCancel: () => void
  isOpen: boolean
}

export default function VoiceRecorder({
  onRecordingComplete,
  onCancel,
  isOpen,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioURL, setAudioURL] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        setRecordedAudio(audioBlob)
        setAudioURL(URL.createObjectURL(audioBlob))
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('마이크 접근 권한이 필요합니다.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playRecording = () => {
    if (audioURL && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const deleteRecording = () => {
    setRecordedAudio(null)
    setAudioURL(null)
    setRecordingTime(0)
    setIsPlaying(false)
  }

  const confirmRecording = () => {
    if (recordedAudio) {
      onRecordingComplete(recordedAudio)
    }
    onCancel() // Close the recorder
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              음성 녹음
            </h3>

            {/* Recording Status */}
            <div className="mb-6">
              {isRecording ? (
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-4"
                  >
                    <MicrophoneIcon className="w-8 h-8 text-white" />
                  </motion.div>
                  <div className="text-2xl font-mono text-gray-900 dark:text-white">
                    {formatTime(recordingTime)}
                  </div>
                  <div className="text-sm text-red-500 mt-1">녹음 중...</div>
                </div>
              ) : recordedAudio ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4">
                    <CheckIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-lg text-gray-900 dark:text-white">
                    녹음 완료 ({formatTime(recordingTime)})
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    재생하거나 다시 녹음할 수 있습니다
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                    <MicrophoneIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-lg text-gray-900 dark:text-white">
                    녹음 준비
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    아래 버튼을 눌러 녹음을 시작하세요
                  </div>
                </div>
              )}
            </div>

            {/* Audio Player (Hidden) */}
            {audioURL && (
              <audio
                ref={audioRef}
                src={audioURL}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            )}

            {/* Controls */}
            <div className="flex justify-center space-x-3 mb-6">
              {!recordedAudio ? (
                <>
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                      title="녹음 시작"
                    >
                      <MicrophoneIcon className="w-6 h-6" />
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex items-center justify-center w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                      title="녹음 중지"
                    >
                      <StopIcon className="w-6 h-6" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={playRecording}
                    className="flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
                    title={isPlaying ? '재생 중지' : '재생'}
                  >
                    {isPlaying ? (
                      <PauseIcon className="w-6 h-6" />
                    ) : (
                      <PlayIcon className="w-6 h-6" />
                    )}
                  </button>

                  <button
                    onClick={deleteRecording}
                    className="flex items-center justify-center w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors"
                    title="다시 녹음"
                  >
                    <TrashIcon className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                취소
              </button>

              {recordedAudio && (
                <button
                  onClick={confirmRecording}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  사용하기
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
