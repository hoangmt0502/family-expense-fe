'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Check, RefreshCw, RotateCcw, X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onCapture: (file: File) => void;
  /** Gọi khi không mở được camera trong trình duyệt (vd: http qua IP LAN) → dùng app máy ảnh của thiết bị */
  onFallback?: () => void;
}

export default function CameraCaptureModal({ onClose, onCapture, onFallback }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [shot, setShot] = useState<{ blob: Blob; url: string } | null>(null);
  const reviewing = !!shot;

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Mở camera (tắt khi đang xem lại ảnh để đèn camera không sáng)
  useEffect(() => {
    if (reviewing) return;
    let cancelled = false;

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Trình duyệt không hỗ trợ camera (cần mở bằng HTTPS hoặc localhost).');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          await v.play().catch(() => {});
        }
        setReady(true);
      } catch (e) {
        const name = (e as DOMException).name;
        setError(
          name === 'NotAllowedError'
            ? 'Bạn đã chặn quyền camera. Hãy cho phép camera ở thanh địa chỉ rồi thử lại.'
            : name === 'NotFoundError'
              ? 'Không tìm thấy camera trên thiết bị này.'
              : 'Không mở được camera.',
        );
      }
    })();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [facing, reviewing, stopStream]);

  // Giải phóng URL ảnh tạm
  useEffect(() => () => { if (shot) URL.revokeObjectURL(shot.url); }, [shot]);

  const takePhoto = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext('2d')?.drawImage(v, 0, 0);
    canvas.toBlob(
      (blob) => blob && setShot({ blob, url: URL.createObjectURL(blob) }),
      'image/jpeg',
      0.9,
    );
  };

  const confirmPhoto = () => {
    if (!shot) return;
    onCapture(new File([shot.blob], `chung-tu-${Date.now()}.jpg`, { type: 'image/jpeg' }));
    onClose();
  };

  const retake = () => {
    setReady(false);
    setShot(null);
  };

  const flip = () => {
    setReady(false);
    setFacing((f) => (f === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="fixed inset-0 z-[130] flex flex-col bg-black text-white">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-bold">Chụp ảnh chứng từ</span>
        <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-full bg-white/10 p-2 hover:bg-white/20">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {error ? (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div className="max-w-xs space-y-4">
              <Camera className="mx-auto h-10 w-10 text-white/60" />
              <p className="text-sm text-white/80">{error}</p>
              <div className="flex justify-center gap-2">
                <button type="button" onClick={onClose} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20">
                  Đóng
                </button>
                {onFallback && (
                  <button
                    type="button"
                    onClick={() => { onClose(); onFallback(); }}
                    className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold hover:bg-purple-700"
                  >
                    Dùng camera thiết bị
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : shot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shot.url} alt="Ảnh vừa chụp" className="h-full w-full object-contain" />
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`h-full w-full object-contain ${facing === 'user' ? '-scale-x-100' : ''}`}
            />
            {!ready && (
              <div className="absolute inset-0 grid place-items-center text-sm text-white/70">Đang mở camera...</div>
            )}
          </>
        )}
      </div>

      {!error && (
        <div className="flex items-center justify-center gap-8 px-6 py-6">
          {shot ? (
            <>
              <button type="button" onClick={retake} className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold hover:bg-white/20">
                <RotateCcw className="h-4 w-4" /> Chụp lại
              </button>
              <button type="button" onClick={confirmPhoto} className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-6 py-3 text-sm font-bold hover:bg-purple-700">
                <Check className="h-4 w-4" /> Dùng ảnh này
              </button>
            </>
          ) : (
            <>
              <span className="w-12" />
              <button
                type="button"
                onClick={takePhoto}
                disabled={!ready}
                aria-label="Chụp"
                className="grid h-18 w-18 place-items-center rounded-full border-4 border-white p-1 transition-transform active:scale-90 disabled:opacity-40"
                style={{ height: 72, width: 72 }}
              >
                <span className="block h-full w-full rounded-full bg-white" />
              </button>
              <button type="button" onClick={flip} aria-label="Đổi camera" className="grid h-12 w-12 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                <RefreshCw className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
