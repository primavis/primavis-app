import { motion, AnimatePresence } from 'framer-motion';

interface DisplayProps {
  value: string;
}

export const Display = ({ value }: DisplayProps) => {
  return (
    <div className="flex items-center justify-center py-8 px-6 min-h-[100px]">
      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="number"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 tracking-wider"
          >
            {value}
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="text-4xl md:text-5xl font-light text-gray-300"
          >
            06...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
