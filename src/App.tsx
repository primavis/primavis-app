import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { Display } from './components/Display';
import { Keypad } from './components/Keypad';
import { ActionButton } from './components/ActionButton';
import { SuccessAnimation } from './components/SuccessAnimation';
import { formatPhoneNumber, cleanPhoneNumber, isValidPhoneNumber } from './utils/phoneFormatter';
import { useHaptic } from './hooks/useHaptic';

function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { triggerSuccess } = useHaptic();

  const handleNumberClick = (digit: string) => {
    const cleaned = cleanPhoneNumber(phoneNumber);
    if (cleaned.length < 10) {
      setPhoneNumber(formatPhoneNumber(cleaned + digit));
    }
  };

  const handleDelete = () => {
    const cleaned = cleanPhoneNumber(phoneNumber);
    if (cleaned.length > 0) {
      setPhoneNumber(formatPhoneNumber(cleaned.slice(0, -1)));
    }
  };

  const handleSubmit = async () => {
    if (!isValidPhoneNumber(phoneNumber)) return;

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      triggerSuccess();
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setPhoneNumber('');
        setLoading(false);
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col justify-between py-4">
        <Display value={phoneNumber} />

        <div>
          <Keypad
            onNumberClick={handleNumberClick}
            onDelete={handleDelete}
          />
        </div>

        <ActionButton
          disabled={!isValidPhoneNumber(phoneNumber)}
          loading={loading}
          onClick={handleSubmit}
        />
      </main>

      <AnimatePresence>
        {showSuccess && <SuccessAnimation />}
      </AnimatePresence>
    </div>
  );
}

export default App;
