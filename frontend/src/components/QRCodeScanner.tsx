'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Camera, CameraOff, RotateCcw } from 'lucide-react';

interface QRCodeScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  title?: string;
  className?: string;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onScan,
  onError,
  title = 'QR Code Scanner',
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const [codeReader, setCodeReader] = useState<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    setCodeReader(reader);

    return () => {
      reader.reset();
    };
  }, []);

  const startScanning = async () => {
    if (!codeReader || !videoRef.current) return;

    try {
      setError('');
      setIsScanning(true);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera if available
      });
      
      setHasPermission(true);
      videoRef.current.srcObject = stream;

      // Start decoding
      codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
        if (result) {
          onScan(result.getText());
          stopScanning();
        }
        if (error && error.name !== 'NotFoundException') {
          console.error('QR Code scanning error:', error);
        }
      });

    } catch (err: any) {
      console.error('Failed to start camera:', err);
      setHasPermission(false);
      setError(err.message || 'Failed to access camera');
      setIsScanning(false);
      
      if (onError) {
        onError(err.message || 'Failed to access camera');
      }
    }
  };

  const stopScanning = () => {
    if (codeReader) {
      codeReader.reset();
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
  };

  const resetScanner = () => {
    stopScanning();
    setError('');
    setHasPermission(null);
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-lg flex items-center justify-center space-x-2">
          <Camera className="w-5 h-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-64 bg-gray-100 rounded-lg object-cover"
            autoPlay
            playsInline
            muted
          />
          
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Camera preview will appear here</p>
              </div>
            </div>
          )}

          {isScanning && (
            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-32 h-32 border-2 border-blue-500 rounded-lg animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex space-x-2">
          {!isScanning ? (
            <Button
              onClick={startScanning}
              className="flex-1 flex items-center justify-center space-x-2"
              disabled={hasPermission === false}
            >
              <Camera className="w-4 h-4" />
              <span>Start Scanning</span>
            </Button>
          ) : (
            <Button
              onClick={stopScanning}
              variant="destructive"
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <CameraOff className="w-4 h-4" />
              <span>Stop Scanning</span>
            </Button>
          )}

          <Button
            onClick={resetScanner}
            variant="outline"
            className="flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {hasPermission === false && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              Camera permission is required to scan QR codes. Please allow camera access and try again.
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          Position the QR code within the camera view to scan
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;
