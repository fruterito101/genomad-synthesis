// src/components/onboarding/VideoTutorial.tsx
// Embedded video tutorial component

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, X, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button-shadcn";
import { cn } from "@/lib/utils";

interface VideoTutorialProps {
  videoId?: string; // YouTube video ID
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  className?: string;
}

// Placeholder tutorial videos (replace with real ones)
const TUTORIAL_VIDEOS = {
  intro: {
    id: "dQw4w9WgXcQ", // Placeholder
    title: "Introducción a Genomad",
    description: "Aprende los conceptos básicos en 2 minutos",
  },
  breeding: {
    id: "dQw4w9WgXcQ",
    title: "Cómo hacer Breeding",
    description: "Tutorial paso a paso de breeding",
  },
  activate: {
    id: "dQw4w9WgXcQ",
    title: "Activar tu Agente On-Chain",
    description: "Guía para activar en Base",
  },
};

export function VideoTutorial({
  videoId,
  title = "Tutorial",
  description,
  thumbnailUrl,
  className,
}: VideoTutorialProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleClose = () => {
    setIsPlaying(false);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Thumbnail / Preview */}
      {!isPlaying ? (
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative cursor-pointer rounded-xl overflow-hidden bg-card border"
          onClick={handlePlay}
        >
          {/* Thumbnail */}
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Play className="h-10 w-10 text-primary ml-1" />
                </div>
                <h4 className="font-medium">{title}</h4>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </div>
            )}
          </div>

          {/* Play overlay */}
          {thumbnailUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <Play className="h-8 w-8 text-primary-foreground ml-1" />
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        /* Video Player */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative rounded-xl overflow-hidden bg-black"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* YouTube embed */}
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          {/* Controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-medium">{title}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-white" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Tutorial Card Grid
 */
export function TutorialGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(TUTORIAL_VIDEOS).map(([key, video]) => (
        <VideoTutorial
          key={key}
          videoId={video.id}
          title={video.title}
          description={video.description}
        />
      ))}
    </div>
  );
}

/**
 * Inline Tutorial Hint
 */
export function TutorialHint({
  title,
  description,
  videoId,
  onDismiss,
}: {
  title: string;
  description: string;
  videoId?: string;
  onDismiss?: () => void;
}) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-blue-400 mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
          
          {videoId && !showVideo && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 gap-1 text-blue-400 hover:text-blue-300"
              onClick={() => setShowVideo(true)}
            >
              <Play className="h-3 w-3" />
              Ver tutorial
            </Button>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showVideo && videoId && (
        <div className="mt-4">
          <VideoTutorial videoId={videoId} title={title} />
        </div>
      )}
    </motion.div>
  );
}

export default VideoTutorial;
