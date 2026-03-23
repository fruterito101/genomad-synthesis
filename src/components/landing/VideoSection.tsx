// src/components/landing/VideoSection.tsx
"use client";

import { Play } from "lucide-react";
import { useState, useRef } from "react";

export function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <section className="py-24 px-6 border-t border-border">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See it in action
          </h2>
          <p className="text-muted-foreground text-lg">
            Watch how Genomad brings AI agents to life on-chain
          </p>
        </div>

        {/* Video Container */}
        <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-card">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster="/video-poster.jpg"
            controls={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source 
              src="https://res.cloudinary.com/ddejtxqjq/video/upload/v1771212418/GMD_zqv1gd.mp4" 
              type="video/mp4" 
            />
            Your browser does not support the video tag.
          </video>

          {/* Play button overlay */}
          {!isPlaying && (
            <button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
            >
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </div>
            </button>
          )}

          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-xl pointer-events-none border border-gradient opacity-50" />
        </div>
      </div>
    </section>
  );
}

export default VideoSection;
