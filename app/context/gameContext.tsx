// context/GameContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface Match {
  id: string;
  name: string;
  age: number;
  image: string;
  matchPercentage: number;
  lastActive: string;
  status: "online" | "offline";
}

interface GameResults {
  answers: string[];
  shared: number;
}

interface GameContextType {
  selectedMatch: Match | null;
  setSelectedMatch: (match: Match | null) => void;
  gameStarted: boolean;
  setGameStarted: (started: boolean) => void;
  gameSessionId: string | null;
  setGameSessionId: (id: string | null) => void;
  gameResults: GameResults | null;
  setGameResults: (results: GameResults | null) => void;
  resetGame: (socket?: any, userId?: string, gameSessionId?: string) => void;
  gameLevel: number;
  setGameLevel: (level: number) => void;
  nextGameLevel: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameSessionId, setGameSessionId] = useState<string | null>(null);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);
  const [gameLevel, setGameLevel] = useState<number>(1);

  const MAX_GAME_LEVEL = 3;

  const resetGame = (socket?: any, userId?: string, sessionId?: string) => {
    const currentSessionId = sessionId || gameSessionId;

    if (socket && userId && currentSessionId) {
      if (gameLevel === MAX_GAME_LEVEL) {
        // ✅ Final level — only leave
        socket.emit("leaveGameSession", {
          userId,
          gameSessionId: currentSessionId,
        });
      } else {
        // 🔁 Mid-level — manual + leave
        socket.emit("manualGameEnd", {
          userId,
          gameSessionId: currentSessionId,
        });

        socket.emit("leaveGameSession", {
          userId,
          gameSessionId: currentSessionId,
        });
      }
    }

    setSelectedMatch(null);
    setGameStarted(false);
    setGameResults(null);
    setGameSessionId(null);
    setGameLevel(1);
  };

  const nextGameLevel = () => {
    setGameLevel((prev) => {
      if (prev < MAX_GAME_LEVEL) {
        return prev + 1;
      } else {
        return prev;
      }
    });
  };

  return (
    <GameContext.Provider
      value={{
        selectedMatch,
        setSelectedMatch,
        gameStarted,
        setGameStarted,
        gameSessionId,
        setGameSessionId,
        gameResults,
        resetGame,
        setGameResults,
        gameLevel,
        setGameLevel,
        nextGameLevel,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
