import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Header = () => {
  return (
    <motion.header
      className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-center gap-2">
        <Sparkles className="text-blue-600" size={28} strokeWidth={2.5} />
        <h1 className="text-2xl font-bold text-gray-900">
          Primavis
        </h1>
      </div>
    </motion.header>
  );
};
