import { useEffect, useState } from 'react';

interface RobotFaceProps {
  isThinking?: boolean;
}

export const RobotFace = ({ isThinking = false }: RobotFaceProps) => {
  const [isBlinking, setIsBlinking] = useState(false);

  // Blinking animation - random blinks
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, Math.random() * 3000 + 2000); // Random interval between 2-5 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      {/* Face */}
      <div className="relative z-10 w-[72%] h-[58%] rounded-[0.9rem] bg-[linear-gradient(145deg,#3dd4b8,#20a89a)] shadow-[0_4px_8px_rgba(36,238,208,0.2)] flex items-center justify-center">
        <div className="absolute inset-[12%] rounded-[0.7rem] bg-[linear-gradient(160deg,rgba(255,255,255,0.25),rgba(24,138,153,0.1),rgba(0,66,84,0.3))]" />

        {/* Eyes only */}
        <div className="relative flex items-center gap-3">
          {[0, 1].map((eye) => (
            <div
              key={eye}
              className={`relative w-2.5 h-5 rounded-md bg-white/95 shadow-[0_0_8px_rgba(255,255,255,0.55)] transition-transform duration-150 ${
                isBlinking ? 'scale-y-[0.1]' : 'scale-y-100'
              }`}
            >
              {!isBlinking && (
                <div className="absolute inset-[18%] rounded-sm bg-gradient-to-b from-white via-[#c6fff4] to-[#5be9d0]" />
              )}
              {isThinking && !isBlinking && (
                <div className="absolute -inset-1 rounded-md bg-[radial-gradient(circle,rgba(120,255,230,0.45),transparent)] animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
