"use client"

import React, { useEffect, useState, useRef } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import dynamic from "next/dynamic"
import { useEdgeStore } from "@/lib/edgestore"
import { Button } from "@/components/ui/button"
import { Camera, Upload } from "lucide-react"

// Add TypeScript interfaces for MediaRecorder events
interface MediaRecorderDataAvailableEvent extends Event {
  data: Blob;
}

const MediaRecorder = dynamic(
  () => import("react-media-recorder").then((mod) => mod.ReactMediaRecorder),
  { ssr: false }
)

interface VideoRecorderComponentProps {
  profileId: Id<"profiles">
  videoUrl?: string
  onVideoUpload?: () => void
}

export default function VideoRecorder({ profileId, videoUrl, onVideoUpload }: VideoRecorderComponentProps) {
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | undefined>(videoUrl)
  const [isClient, setIsClient] = useState(false)
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null)
  const [shouldStartRecording, setShouldStartRecording] = useState<boolean>(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const startRecordingRef = useRef<(() => void) | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateProfileVideoUrl = useMutation(api.profiles.updateVideoUrl)
  const { edgestore } = useEdgeStore()

  // Function to convert video to MP4 format
  const convertToMP4 = async (blob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        // Create video element to check format
        const video = document.createElement('video')
        video.preload = 'metadata'
        
        video.onloadedmetadata = () => {
          // If video is already MP4, return as is
          if (blob.type === 'video/mp4') {
            resolve(blob)
            return
          }

          // Create canvas and MediaRecorder for conversion
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }

          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

          const stream = canvas.captureStream()
          
          // Use the Web MediaRecorder API directly with proper type
          const recorder = new window.MediaRecorder(stream, {
            mimeType: 'video/mp4; codecs="avc1.42E01E,mp4a.40.2"'
          })

          const chunks: Blob[] = []
          recorder.ondataavailable = (e: MediaRecorderDataAvailableEvent) => chunks.push(e.data)
          recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/mp4' }))

          video.onplay = () => {
            const draw = () => {
              if (video.paused || video.ended) return
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
              requestAnimationFrame(draw)
            }
            draw()
            recorder.start()
          }

          video.onended = () => recorder.stop()
          video.play()
        }

        video.src = URL.createObjectURL(blob)
      } catch (error) {
        console.error('Error converting video:', error)
        // If conversion fails, return original blob
        resolve(blob)
      }
    })
  }

  const handleUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      // Convert video to MP4 if needed
      const videoBlob = await convertToMP4(file);
      
      // Create new File with MP4 extension
      const processedFile = new File([videoBlob], 'video.mp4', {
        type: 'video/mp4'
      });
  
      // Upload with EdgeStore's supported options
      const response = await edgestore.publicFiles.upload({
        file: processedFile,
        options: {
          temporary: false
        }
      });
  
      return response.url;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!currentVideoUrl) return

    try {
      await edgestore.publicFiles.delete({ url: currentVideoUrl })
      await updateProfileVideoUrl({ id: profileId, videoUrl: undefined })
      setCurrentVideoUrl(undefined)
    } catch (error) {
      console.error("Error deleting video:", error)
      alert("There was an error deleting your video. Please try again.")
    }
  }

  const handleStartPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true,
      })
      setPreviewStream(stream)
    } catch (error) {
      console.error("Error accessing media devices.", error)
      alert("Could not access your camera and microphone. Please check your permissions.")
    }
  }

  const handleStopPreview = () => {
    if (previewStream) {
      previewStream.getTracks().forEach((track) => track.stop())
      setPreviewStream(null)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        const newVideoUrl = await handleUpload(file)
        await updateProfileVideoUrl({
          id: profileId,
          videoUrl: newVideoUrl,
        })
        setCurrentVideoUrl(newVideoUrl)
        onVideoUpload?.()
      } catch (error) {
        console.error("Error uploading video:", error)
        alert("There was an error uploading your video. Please try again.")
      }
    }
  }

  useEffect(() => {
    setIsClient(true)
    return () => {
      handleStopPreview()
    }
  }, [])

  useEffect(() => {
    if (shouldStartRecording && startRecordingRef.current) {
      startRecordingRef.current()
      setShouldStartRecording(false)
    }
  }, [shouldStartRecording])

  const handleRecordAgain = async () => {
    if (currentVideoUrl) {
      await handleDeleteVideo()
    }
    await handleStartPreview()
    setShouldStartRecording(true)
  }

  const isVideoSaved = !!currentVideoUrl

  return (
    <div className="w-full">
      {isProcessing && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white p-4 rounded-lg flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span>Processing video...</span>
          </div>
        </div>
      )}
      
      {currentVideoUrl ? (
        <div className="relative">
          <video
            className="w-full h-[512px] rounded-lg object-cover"
            controls
            playsInline
            preload="auto"
            src={currentVideoUrl}
          />
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button onClick={handleRecordAgain} variant="secondary">
              Record Again
            </Button>
            <Button onClick={handleDeleteVideo} variant="destructive">
              Delete Video
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-[512px] bg-gray-200 rounded-lg flex items-center justify-center">
          {isClient && (
            <>
              {!previewStream ? (
                <div className="flex space-x-2">
                  <Button onClick={handleStartPreview} variant="secondary">
                    <Camera className="mr-2 h-4 w-4" />
                    Activate Camera
                  </Button>
                  <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Video
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="video/mp4,video/quicktime,video/webm"
                    className="hidden"
                  />
                </div>
              ) : (
                <MediaRecorder
                  video={{
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                  }}
                  audio
                  customMediaStream={previewStream}
                  render={({
                    status,
                    startRecording,
                    stopRecording,
                    mediaBlobUrl,
                    error,
                  }) => {
                    startRecordingRef.current = startRecording

                    return (
                      <div className="w-full h-full relative">
                        {error && <p className="text-red-500 absolute top-2 left-2">{error}</p>}

                        {(status === "idle" || status === "recording") && (
                          <video
                            className="w-full h-full rounded-lg object-cover"
                            autoPlay
                            playsInline
                            muted
                            ref={(videoElement) => {
                              if (videoElement) {
                                videoElement.srcObject = previewStream
                              }
                            }}
                          />
                        )}

                        <div className="absolute top-4 right-4 flex space-x-2">
                          {status === "idle" && !shouldStartRecording && (
                            <>
                              <Button onClick={startRecording} variant="secondary">
                                Start Recording
                              </Button>
                              <Button onClick={handleStopPreview} variant="outline">
                                Stop Preview
                              </Button>
                            </>
                          )}

                          {status === "recording" && (
                            <Button
                              onClick={stopRecording}
                              variant="destructive"
                              className="stop-button"
                            >
                              Stop Recording
                            </Button>
                          )}
                        </div>

                        {status === "stopped" && mediaBlobUrl && !isVideoSaved && (
                          <>
                            <video
                              className="w-full h-full rounded-lg object-cover"
                              controls
                              playsInline
                              preload="auto"
                              src={mediaBlobUrl}
                            />
                            <div className="absolute top-4 right-4">
                              <Button
                                onClick={async () => {
                                  try {
                                    const blob = await fetch(mediaBlobUrl).then((res) =>
                                      res.blob()
                                    )
                                    const file = new File([blob], "recorded-video.mp4", {
                                      type: 'video/mp4'
                                    })
                                    const newVideoUrl = await handleUpload(file)
                                    await updateProfileVideoUrl({
                                      id: profileId,
                                      videoUrl: newVideoUrl,
                                    })
                                    setCurrentVideoUrl(newVideoUrl)
                                    handleStopPreview()
                                    onVideoUpload?.()
                                  } catch (error) {
                                    console.error("Error saving video:", error)
                                    alert("There was an error saving your video. Please try again.")
                                  }
                                }}
                                variant="secondary"
                              >
                                Save Video
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  }}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}