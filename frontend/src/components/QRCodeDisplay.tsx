'use client';

import React from 'react';
import QRCode from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface QRCodeDisplayProps {
  value: string;
  title?: string;
  size?: number;
  showDownload?: boolean;
  showCopy?: boolean;
  className?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  title = 'QR Code',
  size = 200,
  showDownload = true,
  showCopy = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleDownload = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qr-code-${Date.now()}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <Card className={`w-fit mx-auto ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
          <QRCode
            id="qr-code-canvas"
            value={value}
            size={size}
            level="M"
            includeMargin={true}
            renderAs="canvas"
          />
        </div>

        {(showDownload || showCopy) && (
          <div className="flex space-x-2">
            {showCopy && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center space-x-1"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            )}

            {showDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Button>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 text-center max-w-xs break-all">
          {value}
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;
