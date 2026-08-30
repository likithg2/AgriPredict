import { useState, useEffect } from 'react';

export const useResendTimer = (initialSeconds = 120) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const startTimer = () => {
    setTimeLeft(initialSeconds);
  };

  const formattedTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return {
    timeLeft,
    isTimerActive: timeLeft > 0,
    startTimer,
    formattedTime
  };
};
