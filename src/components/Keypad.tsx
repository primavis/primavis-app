import { motion } from 'framer-motion';
import { Delete } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic';

interface KeypadProps {
  onNumberClick: (digit: string) => void;
  onDelete: () => void;
}

export const Keypad = ({ onNumberClick, onDelete }: KeypadProps) => {
  const { triggerLight } = useHaptic();

  const handleClick = (digit: string) => {
    triggerLight();
    onNumberClick(digit);
  };

  const handleDelete = () => {
    triggerLight();
    onDelete();
  };

  const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="grid grid-cols-3 gap-4 px-6 py-4 max-w-md mx-auto">
      {buttons.map((btn, index) => {
        if (btn === '') {
          return <div key={index} />;
        }

        if (btn === 'del') {
          return (
            <motion.button
              key={btn}
              onClick={handleDelete}
              whileTap={{ scale: 0.9 }}
              className="aspect-square rounded-2xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center text-gray-700 transition-colors"
            >
              <Delete size={28} strokeWidth={2} />
            </motion.button>
          );
        }

        return (
          <motion.button
            key={btn}
            onClick={() => handleClick(btn)}
            whileTap={{ scale: 0.9 }}
            className="aspect-square rounded-2xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center text-3xl font-semibold text-gray-900 transition-colors"
          >
            {btn}
          </motion.button>
        );
      })}
    </div>
  );
};
