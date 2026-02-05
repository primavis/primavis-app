import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export const SuccessAnimation = () => {
  const confettiColors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm mx-4"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.2, type: 'spring', duration: 0.6 }}
            className="inline-block"
          >
            <CheckCircle2 size={80} className="text-green-500" strokeWidth={2.5} />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold text-gray-900 mt-4"
          >
            Demande envoyée !
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 mt-2"
          >
            Votre demande d'avis a été envoyée avec succès
          </motion.p>
        </div>

        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: Math.random() * 400 - 200,
              y: Math.random() * 400 - 200,
              scale: Math.random() * 1.5,
              opacity: 0,
            }}
            transition={{
              duration: 1.5,
              ease: 'easeOut',
            }}
            className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
            style={{
              backgroundColor: confettiColors[i % confettiColors.length],
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};
