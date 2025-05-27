import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const videos = [
  { src: "/videos/736d27dc0e1343a8a962ef71c706fb53.mov", title: "Video 1" },
  { src: "/videos/taoper.mov", title: "Video 2" },
  { src: "/videos/318de1ed9c4a4f5985771bd78c8b3690.mov", title: "Video 3" },
  { src: "/videos/0125.mov", title: "Video 4" },
  { src: "/videos/eric.mov", title: "Video 5" }
];

export function Hero({ title, subtitle, buttonText }: { title: string; subtitle: string; buttonText: string }) {
  const [current, setCurrent] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  // When the video ends, go to the next one (loop)
  const handleEnded = () => {
    setIsVideoLoading(true);
    setCurrent((prev) => (prev + 1) % videos.length);
  };

  // Play video when it becomes visible
  useEffect(() => {
    if (videoRef.current) {
      const playVideo = async () => {
        try {
          await videoRef.current?.play();
        } catch (error) {
          console.error("Video playback failed:", error);
        } finally {
          setIsVideoLoading(false);
        }
      };

      playVideo();
    }
  }, [current]);

  return (
    <section className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      {/* Video Loading Indicator */}
      {isVideoLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
          <div className="w-16 h-16 border-4 border-t-accent border-opacity-50 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Background Video */}
      <video
        ref={videoRef}
        key={videos[current].src}
        className="absolute top-0 left-0 w-screen h-screen object-cover z-0"
        loop={false}
        muted
        playsInline
        controls={false}
        preload="metadata"
        onEnded={handleEnded}
        onLoadedData={() => setIsVideoLoading(false)}
        autoPlay
      >
        <source src={videos[current].src} />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute top-0 left-0 w-screen h-screen bg-black/60 z-10" />

      {/* Centered Content */}
      <div className="relative z-20 h-full w-full flex flex-col items-center justify-center text-white text-center px-6">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-widest mb-6 drop-shadow-lg text-white">
          {title}
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl text-white/90">
          {subtitle}
        </p>
        <Button
          size="lg"
          className="bg-accent hover:bg-accent/90 text-primary border-2 border-accent hover:border-accent/90 font-bold py-3 px-10 rounded-full text-lg mb-8 shadow-xl transition"
        >
          {buttonText}
        </Button>
      </div>
    </section>
  );
}
