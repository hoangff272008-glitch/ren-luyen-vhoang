import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Music2, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Royalty-free Lofi track
  const STREAM_URL = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112778.mp3";

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVol = value[0];
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <div className="glass-panel p-3 rounded-2xl flex items-center gap-3 pr-5">
        <audio ref={audioRef} src={STREAM_URL} loop />
        
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
          <motion.div
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Music2 size={20} />
          </motion.div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <button 
              onClick={togglePlay}
              className="p-1.5 hover:bg-black/5 rounded-lg transition-colors text-foreground"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>
            
            <button 
              onClick={toggleMute}
              className="p-1.5 hover:bg-black/5 rounded-lg transition-colors text-muted-foreground"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
          
          <div className="w-24 px-1">
            <Slider 
              value={[volume]} 
              max={1} 
              step={0.01} 
              onValueChange={handleVolumeChange} 
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
