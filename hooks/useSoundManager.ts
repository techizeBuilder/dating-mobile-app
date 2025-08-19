
import { useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

export default function useSoundManager() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const matchSoundRef = useRef<Audio.Sound | null>(null);
  const mismatchSoundRef = useRef<Audio.Sound | null>(null);

  const stopAllSounds = useCallback(async () => {
    try {
      const stopPromises = [];

      if (soundRef.current?._loaded) {
        stopPromises.push(soundRef.current.stopAsync().then(() => soundRef.current?.unloadAsync()));
        soundRef.current = null;
      }
      if (matchSoundRef.current?._loaded) {
        stopPromises.push(matchSoundRef.current.stopAsync().then(() => matchSoundRef.current?.unloadAsync()));
        matchSoundRef.current = null;
      }
      if (mismatchSoundRef.current?._loaded) {
        stopPromises.push(mismatchSoundRef.current.stopAsync().then(() => mismatchSoundRef.current?.unloadAsync()));
        mismatchSoundRef.current = null;
      }

      await Promise.all(stopPromises);
    } catch (err) {
      console.error("Error stopping sounds:", err);
    }
  }, []);

const playBackgroundSound = useCallback(async () => {
  await stopAllSounds(); // keep this here ✅
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/popsound.mp3'),
      { shouldPlay: true, isLooping: true }
    );
    soundRef.current = sound;
  } catch (err) {
    console.error("Error playing background sound:", err);
  }
}, [stopAllSounds]);


const playMatchSound = useCallback(async () => {
  try {
    if (matchSoundRef.current?._loaded) {
      await matchSoundRef.current.stopAsync();
      await matchSoundRef.current.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/correctAnwer.mp3'),
      { shouldPlay: true }
    );
    matchSoundRef.current = sound;
  } catch (err) {
    console.error("Error playing match sound:", err);
  }
}, []);

const playMismatchSound = useCallback(async () => {
  try {
    if (mismatchSoundRef.current?._loaded) {
      await mismatchSoundRef.current.stopAsync();
      await mismatchSoundRef.current.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/wrongAnswer.mp3'),
      { shouldPlay: true }
    );
    mismatchSoundRef.current = sound;
  } catch (err) {
    console.error("Error playing mismatch sound:", err);
  }
}, []);


  useEffect(() => {
    return () => {
      stopAllSounds();
    };
  }, [stopAllSounds]);

  return {
    playBackgroundSound,
    playMatchSound,
    playMismatchSound,
    stopAllSounds
  };
}
