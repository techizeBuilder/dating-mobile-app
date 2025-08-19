import React, { createContext, useContext, useState } from 'react';
import { IRtcEngine } from 'react-native-agora';

// Define the context shape
interface AgoraContextType {
    engine: IRtcEngine | null;
    setEngine: (engine: IRtcEngine | null) => void;
}

// Create the context
const AgoraContext = createContext<AgoraContextType | undefined>(undefined);

// AgoraProvider to wrap your app
export const AgoraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [engine, setEngine] = useState<IRtcEngine | null>(null);

    return (
        <AgoraContext.Provider value={{ engine, setEngine }}>
            {children}
        </AgoraContext.Provider>
    );
};

// Custom hook to use Agora context
export const useAgora = (): AgoraContextType => {
    const context = useContext(AgoraContext);
    if (!context) {
        throw new Error('useAgora must be used within an AgoraProvider');
    }
    return context;
};
