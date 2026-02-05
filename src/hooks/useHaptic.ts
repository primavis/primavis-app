export const useHaptic = () => {
  const triggerLight = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const triggerSuccess = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  return { triggerLight, triggerSuccess };
};
