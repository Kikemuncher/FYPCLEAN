import { useEffect, useRef } from 'react';

export function VideoPlayer({ src, isActive }) {
  const videoRef = useRef(null);
  
  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Autoplay prevented:', err);
      });
    } else if (!isActive && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive]);
  
  return (
    <video
      ref={videoRef}
      src={src}
      className="absolute inset-0 w-full h-full object-contain"
      loop
      playsInline
      controls
      muted={!isActive}
    />
  );
}
