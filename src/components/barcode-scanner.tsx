'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, X, RotateCw } from 'lucide-react'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
  isOpen: boolean
}

export function BarcodeScanner({ onScan, onClose, isOpen }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    if (isOpen) {
      initializeScanner()
    } else {
      stopScanning()
    }

    return () => {
      stopScanning()
    }
  }, [isOpen])

  const initializeScanner = async () => {
    try {
      setError(null)
      
      // カメラデバイスを取得
      const videoDevices = await navigator.mediaDevices.enumerateDevices()
      const cameras = videoDevices.filter(device => device.kind === 'videoinput')
      setDevices(cameras)
      
      if (cameras.length === 0) {
        setError('カメラが見つかりませんでした')
        return
      }

      // バックカメラを優先的に選択
      const backCamera = cameras.find(camera => 
        camera.label.toLowerCase().includes('back') || 
        camera.label.toLowerCase().includes('rear')
      )
      const deviceId = backCamera?.deviceId || cameras[0].deviceId
      setSelectedDeviceId(deviceId)

      startScanning(deviceId)
    } catch (err) {
      console.error('Scanner initialization error:', err)
      setError('カメラの初期化に失敗しました')
    }
  }

  const startScanning = async (deviceId: string) => {
    try {
      setIsScanning(true)
      setError(null)

      if (!readerRef.current) {
        readerRef.current = new BrowserMultiFormatReader()
      }

      const reader = readerRef.current

      // カメラ映像を開始
      await reader.decodeFromVideoDevice(
        deviceId,
        videoRef.current!,
        (result, err) => {
          if (result) {
            // バーコードが読み取れた場合
            const barcodeValue = result.getText()
            console.log('Barcode scanned:', barcodeValue)
            onScan(barcodeValue)
            stopScanning()
          }
          
          if (err && !(err instanceof NotFoundException)) {
            console.error('Scanning error:', err)
          }
        }
      )
    } catch (err) {
      console.error('Start scanning error:', err)
      setError('スキャンの開始に失敗しました')
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset()
    }
    setIsScanning(false)
  }

  const switchCamera = () => {
    if (devices.length > 1) {
      const currentIndex = devices.findIndex(device => device.deviceId === selectedDeviceId)
      const nextIndex = (currentIndex + 1) % devices.length
      const nextDeviceId = devices[nextIndex].deviceId
      setSelectedDeviceId(nextDeviceId)
      
      stopScanning()
      setTimeout(() => startScanning(nextDeviceId), 100)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                バーコードスキャン
              </CardTitle>
              <CardDescription>
                バーコードをカメラで読み取ります
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">{error}</div>
              <Button onClick={initializeScanner} variant="outline">
                再試行
              </Button>
            </div>
          ) : (
            <>
              {/* カメラ映像 */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  playsInline
                  muted
                />
                
                {/* スキャンフレーム */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-32 border-2 border-white rounded-lg">
                    <div className="w-full h-full border-4 border-transparent bg-transparent">
                      {/* コーナーマーカー */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500"></div>
                    </div>
                  </div>
                </div>

                {/* 動作状況表示 */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  {isScanning ? 'スキャン中...' : '準備中...'}
                </div>
              </div>

              {/* 操作ボタン */}
              <div className="flex justify-center space-x-2">
                {devices.length > 1 && (
                  <Button variant="outline" onClick={switchCamera}>
                    <RotateCw className="h-4 w-4 mr-2" />
                    カメラ切替
                  </Button>
                )}
                <Button variant="outline" onClick={onClose}>
                  キャンセル
                </Button>
              </div>

              {/* 使用方法 */}
              <div className="text-center text-sm text-gray-600">
                <p>バーコードを赤い枠内に合わせてください</p>
                <p>自動的に読み取られます</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}