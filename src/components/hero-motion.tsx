import { useEffect, useRef } from "react";

export function HeroMotion() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const ensurePlayback = () => {
      void video.play().catch(() => {
        // El atributo muted permite autoplay en los navegadores modernos.
      });
    };
    const resumeWhenVisible = () => {
      if (!document.hidden) ensurePlayback();
    };

    ensurePlayback();
    video.addEventListener("canplay", ensurePlayback);
    document.addEventListener("visibilitychange", resumeWhenVisible);
    return () => {
      video.removeEventListener("canplay", ensurePlayback);
      document.removeEventListener("visibilitychange", resumeWhenVisible);
    };
  }, []);

  return (
    <figure
      className="hero-video relative mx-auto aspect-square w-full max-w-[36rem] overflow-hidden rounded-[2rem]"
      aria-label="Demostración animada del flujo Certipy: find, request y auth"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/hero-motion.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
      >
        Tu navegador no soporta vídeo HTML5.
      </video>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" />
      <figcaption className="sr-only">
        Secuencia educativa de enumeración, solicitud de certificado y autenticación ADCS.
      </figcaption>
    </figure>
  );
}
