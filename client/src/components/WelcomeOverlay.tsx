import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export function WelcomeOverlay() {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide after 5 seconds if not interacted with? 
  // Requirement says "Click to close", so we'll stick to that.

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/90 via-secondary/90 to-accent/90 backdrop-blur-3xl"
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
          className="text-center p-8 max-w-2xl"
        >
          <motion.div
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="mb-6 inline-flex p-4 bg-white rounded-full shadow-2xl text-primary"
          >
            <Sparkles size={48} />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-display leading-tight drop-shadow-md">
            Chào mừng <br/>
            <span className="text-yellow-300">Việt Hoàng</span> <br/>
            đã trở lại!
          </h1>
          
          <p className="text-white/80 text-xl md:text-2xl mb-12 font-medium">
            Mọi thứ đã sẵn sàng cho ngày làm việc hiệu quả của bạn.
          </p>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,255,255,0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsVisible(false)}
            className="bg-white text-primary px-10 py-4 rounded-2xl text-xl font-bold shadow-xl hover:bg-gray-50 transition-colors"
          >
            Bắt đầu ngay
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
