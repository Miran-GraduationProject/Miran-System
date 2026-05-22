import { motion } from 'framer-motion';
import { Activity, Stethoscope } from 'lucide-react';
import logo from "../assets/logo3.png";

 function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 flex items-center justify-center overflow-hidden">
      {/* Animated medical circle */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="w-96 h-96 rounded-full border-4 border-white/30"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Floating medical icons */}
      <motion.div
        className="absolute top-1/4 right-1/4 text-white/20"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Activity size={40} />
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 left-1/4 text-white/20"
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Stethoscope size={40} />
      </motion.div>

      {/* Logo container */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
        }}
      >
        {/* Logo with pulse effect */}
        <motion.div
          className="mb-6"
          animate={{
            scale: [1.8, 1.6, 1.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <img 
            src={logo} 
            alt="صرا" 
            className="w-[300px] h-[300px] mx-auto object-contain drop-shadow-2xl" 
            style={{ imageRendering: 'crisp-edges' }}
          />
        </motion.div>

        {/* Platform name */}
        <motion.h1
          className="text-white text-3xl mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
         منصة التدريب 
        </motion.h1>

        {/* <motion.p
          className="text-white/90 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          جامعة أم القرى
        </motion.p> */}

        {/* Loading indicator */}
        <motion.div
          className="mt-[30px]! flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Fade out overlay */}
      <motion.div
        className="absolute inset-0 bg-emerald-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        exit={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.5 }}
      />
    </div>
  );
}

export default SplashScreen;