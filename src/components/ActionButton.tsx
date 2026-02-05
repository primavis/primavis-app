import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';

interface ActionButtonProps {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}

export const ActionButton = ({ disabled, loading, onClick }: ActionButtonProps) => {
  return (
    <div className="px-6 pb-8 pt-4">
      <motion.button
        onClick={onClick}
        disabled={disabled || loading}
        whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
        className={`w-full max-w-md mx-auto block py-4 rounded-2xl font-bold text-lg text-white transition-all shadow-lg ${
          disabled || loading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              <span>ENVOI EN COURS...</span>
            </>
          ) : (
            <>
              <Send size={24} />
              <span>ENVOYER LA DEMANDE</span>
            </>
          )}
        </div>
      </motion.button>
    </div>
  );
};
