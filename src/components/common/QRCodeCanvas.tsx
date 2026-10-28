import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeCanvasProps {
  value: string;
  size?: number;
  className?: string;
  includeMargin?: boolean;
}

export const QRCodeCanvas: React.FC<QRCodeCanvasProps> = ({
  value,
  size = 200,
  className = '',
  includeMargin = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: includeMargin ? 2 : 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (error) => {
        if (error) {
          console.error('Error generating QR code:', error);
        }
      }
    );
  }, [value, size, includeMargin]);

  return (
    <div className={`inline-flex items-center justify-center bg-white p-2 border border-slate-200 rounded-xl shadow-xs ${className}`}>
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
    </div>
  );
};
