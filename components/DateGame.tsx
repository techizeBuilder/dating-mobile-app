import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView } from 'react-native';
import { Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import axios from 'axios';
import { Audio } from "expo-av"
import { API_BASE_URL } from '@/app/apiUrl';
import { useUserProfile } from '@/app/context/userContext';
import { useSocket } from '@/app/context/socketContext';
import AnswerFeedbackAnimation from './AnswerFeedbackAnimation';
import { useGame } from '@/app/context/gameContext';
import useSoundManager from '@/hooks/useSoundManager';
import { calculateSharedAnswers } from '@/app/utils/gameHelper';
import { useModal } from '@/app/context/modalContext';
import { router } from 'expo-router';

// Create an animated version of the Circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Option {
  text: string;
  _id: string;
}

interface Question {
  id: string;
  question: string;
  type: string;
  category: {
    id: string;
    name: string;
  };
  points: number;
  options: Option[];
  required: boolean;
}

interface GameProps {
  onComplete: (results: { answers: string[]; shared: number }) => void;
  onClose: () => void;
}


export default function DateGame({ onComplete, onClose }: GameProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const progress = useRef(new Animated.Value(0)).current;
  const { token, user } = useUserProfile();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const { socket } = useSocket();
  const [yourAnswer, setYourAnswer] = useState<string | null>(null);
  const [opponentAnswer, setOpponentAnswer] = useState<string | null>(null);
  const [animationType, setAnimationType] = useState<'match' | 'mismatch' | null>(null);
  const [animationTrigger, setAnimationTrigger] = useState(false);
  const {
    selectedMatch,
    gameStarted,
    gameSessionId,
    gameLevel, resetGame,
  } = useGame();
  const { showModal } = useModal();
  const {
    playBackgroundSound,
    playMatchSound,
    playMismatchSound,
    stopAllSounds
  } = useSoundManager();

  const hasSubmittedRef = useRef(false);
  const answersRef = useRef<string[]>([]);
  const hasPlayedBackground = useRef(false);
  const [opponentAnswers, setOpponentAnswers] = useState<string[]>([]);


  // Fetch games
  const getAllGames = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/user/quiz-games?stage=${gameLevel}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // console.log("Games response in game page:", res);
      if (res.data.status) {
        setQuestions(res.data.questions);
      }
    } catch (err) {
      console.log("error in getting games in game page : ", err);
      setError('Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllGames();
  }, [gameLevel]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);


  const handleClose = useCallback(async () => {
    await stopAllSounds();
    hasPlayedBackground.current = false;

    resetGame(socket, user._id, gameSessionId ?? undefined);

    onClose();
  }, [onClose, stopAllSounds, socket, gameSessionId, user._id]);


  useEffect(() => {
    if (!socket || !gameStarted) return;

    const onOpponentDisconnected = ({
      gameSessionId: disconnectedSessionId,
      opponentId,
    }: {
      gameSessionId: string;
      opponentId: string;
    }) => {
      if (disconnectedSessionId !== gameSessionId) return;

      console.log(
        `[DateGame] Opponent ${opponentId} disconnected from game session ${disconnectedSessionId}`
      );

      if (gameLevel === 3) {
        // ✅ Level 3: silently reset and navigate
        // resetGame(socket, user?._id, disconnectedSessionId);
        console.log("its level 3")
      } else {
        // ✅ Level 1 & 2: show modal
        showModal({
          title: "Opponent Left",
          message: "Your opponent has ended the game.",
          buttons: [
            {
              text: "OK",
              onPress: () => {
                resetGame(socket, user?._id, disconnectedSessionId);
                router.replace("/(tabs)/matches");
              },
            },
          ],
        });
      }
    };

    socket.on("opponentDisconnected", onOpponentDisconnected);

    return () => {
      socket.off("opponentDisconnected", onOpponentDisconnected);
    };
  }, [socket, gameSessionId, gameStarted, stopAllSounds, onClose]);


  useEffect(() => {
    if (questions.length === 0) return;

    let timer: NodeJS.Timeout;

    // Reset time and progress
    setTimeLeft(30);
    progress.setValue(0);

    // Animate from 0 to 1 over 30 seconds
    Animated.timing(progress, {
      toValue: 1,
      duration: 30000,
      useNativeDriver: false,
    }).start();

    // Countdown every second
    timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(timer);
      progress.stopAnimation();
      progress.setValue(0);
    };
  }, [currentQuestion, questions]);


  // 3. Update your useEffect for questions
  useEffect(() => {
    if (questions.length > 0 && !hasPlayedBackground.current) {
      const initSound = async () => {
        await stopAllSounds();
        await playBackgroundSound();
      };
      initSound();
      hasPlayedBackground.current = true;
    }
    return () => {
      stopAllSounds();
    };
  }, [questions]);


  // Sockets for store answers
  const handleAnswer = async (answer: string) => {

    // Immediately show user's selection
    setSelectedOption(answer);
    setYourAnswer(answer);

    // Submit answer to backend via socket
    socket?.emit('submitAnswer', {
      answerText: answer,
      userId: user._id,
      receiverId: selectedMatch?.id,
      gameSessionId,
      questionIndex: currentQuestion, // ✅ add this
    });


    // Update both local state and ref
    setAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      updatedAnswers[currentQuestion] = answer;
      answersRef.current = updatedAnswers;
      return updatedAnswers;
    });


  };

  // Ensure handleGameComplete triggers navigation
  const handleGameComplete = useCallback(async (finalAnswers: string[] = answers) => {
    console.log("Final answers:", answers);
    // await stopAllSounds();
    const resultPayload = {
      quizSessionId: gameSessionId,
      receiverId: selectedMatch?.id,
      answers: finalAnswers,
      totalQuestions: questions.length,
    };
    console.log("🚀 Submitting result to backend with payload:", resultPayload);

    try {
      await axios.post(`${API_BASE_URL}/user/quiz-result`, resultPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Calculate shared answers (or your scoring logic)
      const sharedAnswers = calculateSharedAnswers(finalAnswers, opponentAnswers);

      await stopAllSounds();

      // Trigger completion callback - THIS SHOULD NAVIGATE TO RESULTS
      onComplete({
        answers: finalAnswers,
        shared: sharedAnswers
      });


    } catch (err) {
      console.error("Final submission error:", err);
      // Handle error (maybe show alert before navigating)
      await stopAllSounds();
      onComplete({ answers: [], shared: 0 });
    }
  }, [answers, gameSessionId, selectedMatch?.id, questions.length, token, onComplete]);

  const safeHandleGameComplete = (finalAnswers: string[]) => {
    console.log("Trying to complete game", hasSubmittedRef.current);
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    // Safety guard: Only submit number of answers equal to questions
    const cleanAnswers = finalAnswers.slice(0, questions.length);
    handleGameComplete(cleanAnswers);
  };

  // 4. Update your handleTimeout
  const handleTimeout = useCallback(async () => {
    // Reset all state related to question UI
    setSelectedOption(null);
    setYourAnswer(null);
    setOpponentAnswer(null);
    setShowAnswerFeedback(false);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTimeLeft(30);
      progress.setValue(0);
      await playBackgroundSound();
    } else {
      await handleGameComplete();
    }
  }, [currentQuestion, questions.length, handleGameComplete, stopAllSounds, playBackgroundSound]);


  // Listen for when both players answered
  useEffect(() => {
    let timeoutId: NodeJS.Timeout; // move outside for cleanup

    const handleBothAnswers = async (data: {
      gameSessionId: string;
      questionIndex: number;
      yourAnswer: string;
      opponentAnswer: string;
      userId: string;
    }) => {
      console.log("📩 bothAnswersReceived fired!", {
        userId: data.userId,
        expectedUserId: user._id,
        currentQuestion,
        questionIndexFromSocket: data.questionIndex,
        yourAnswerInRef: answersRef.current[data.questionIndex]
      });

      // Ensure event is for the correct user
      if (data.userId !== user._id) return;

      // Ignore mismatched questions
      if (data.questionIndex !== currentQuestion) return;

      const yourLatestAnswer = answersRef.current[data.questionIndex];
      if (yourLatestAnswer === undefined || yourLatestAnswer === null) {
        console.warn("⚠️ Answer missing in ref but allowing flow.");
        // allow flow even if undefined
      }

      setOpponentAnswer(data.opponentAnswer);
      setOpponentAnswers(prev => {
        const updated = [...prev];
        updated[data.questionIndex] = data.opponentAnswer;
        return updated;
      });

      setShowAnswerFeedback(true);

      if (yourLatestAnswer === data.opponentAnswer) {
        await playMatchSound();
        setAnimationType("match");
      } else {
        await playMismatchSound();
        setAnimationType("mismatch");
      }

      setAnimationTrigger(true);

      // Wait before moving to next question
      timeoutId = setTimeout(async () => {
        const isFinal = currentQuestion >= questions.length - 1;

        setSelectedOption(null);
        setYourAnswer(null);
        setOpponentAnswer(null);
        setShowAnswerFeedback(false);

        if (!isFinal) {
          setCurrentQuestion((prev) => prev + 1);
          await stopAllSounds();
          await playBackgroundSound();
        } else {
          await stopAllSounds();
          safeHandleGameComplete([...answersRef.current]);
        }
      }, 1000);
    };

    console.log("📡 Subscribed to bothAnswersReceived");
    socket?.on("bothAnswersReceived", handleBothAnswers);

    return () => {
      console.log("🧹 Cleaning up bothAnswersReceived listener and timeout");
      socket?.off("bothAnswersReceived", handleBothAnswers);
      if (timeoutId) clearTimeout(timeoutId); // ✅ proper cleanup
    };
  }, [currentQuestion, questions.length, playMatchSound, playMismatchSound, playBackgroundSound, stopAllSounds]);



  const RADIUS = 58;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const progressStrokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });



  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No questions available.</Text>
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🎉 Emoji Animation Overlay */}
      <AnswerFeedbackAnimation
        type={animationType}
        trigger={animationTrigger}
        onComplete={() => setAnimationTrigger(false)}
      />

      <View style={styles.header}>
        <View style={styles.circleWrapper}>
          <Svg width="120" height="120" viewBox="0 0 120 120">
            <Circle
              cx="60"
              cy="60"
              r="58"
              stroke="#e6e6e6"
              strokeWidth="4"
              fill="none"
            />
            <AnimatedCircle
              cx="60"
              cy="60"
              r={RADIUS}
              stroke="#FF00FF"
              strokeWidth="4"
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={progressStrokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </Svg>
          <Text style={styles.timer}>{timeLeft}s</Text>
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionNumber}>
          Question {currentQuestion + 1} of {questions.length}
        </Text>
        <Text style={styles.questionText}>
          {questions[currentQuestion].question}
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.optionsContainer}>
          {questions[currentQuestion]?.options.map((option) => {
            const isYourAnswer = yourAnswer === option.text;
            const isOpponentAnswer = opponentAnswer === option.text;

            return (
              <Pressable
                key={option._id}
                style={[
                  styles.option,
                  isYourAnswer && styles.yourAnswer,
                  isOpponentAnswer && styles.opponentAnswer,
                  isYourAnswer && isOpponentAnswer && styles.bothAnsweredSame,
                ]}
                disabled={showAnswerFeedback || !!selectedOption}

                onPress={() => handleAnswer(option.text)}
              >
                <Text style={styles.optionText}>{option.text}</Text>
              </Pressable>
            );
          })}
        </View>

        <LinearGradient
          colors={['#FF00FF', '#D000FF', '#8000FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.closeButton}
        >
          <Pressable onPress={handleClose}>
            <Text style={styles.closeButtonText}>End Game</Text>
          </Pressable>
        </LinearGradient>
      </ScrollView>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 20,
  },
  header: {
    marginBottom: 24,
    marginTop: 16,
    alignItems: 'center',
  },
  circleWrapper: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  timer: {
    position: 'absolute',
    fontFamily: 'Orbitron-Bold',
    fontSize: 24,
    color: '#FF00FF',
    textAlign: 'center',
  },
  questionContainer: {
    marginBottom: 32,
  },
  questionNumber: {
    fontFamily: 'Rajdhani',
    fontSize: 16,
    color: '#00FFFF',
    marginBottom: 8,
  },
  questionText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 24,
    color: '#03d7fc',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 16,
  },
  yourAnswer: {
    backgroundColor: '#43A047',     // Rich green
    borderColor: '#2C6B2F',         // Deeper natural green for contrast
    shadowColor: '#2E7D32',         // Subtle matching shadow
    elevation: 4,
  },

  opponentAnswer: {
    backgroundColor: '#fc034e',     // Bold red/pink tone
    borderColor: '#b0023a',         // Deep crimson border for contrast
    shadowColor: '#a00135',         // Dark matching shadow
    elevation: 4,
  },

  bothAnsweredSame: {
    backgroundColor: '#0575b5',     // Strong blue tone
    borderColor: '#015c8f',         // Deeper blue border for consistency
    shadowColor: '#02639c',         // Subtle shadow in tone
    elevation: 4,
  },


  answerLabel: {
    fontSize: 12,
    color: 'white',
    marginTop: 4,
    fontStyle: 'italic',
  },
  option: {
    borderWidth: 2,
    borderColor: '#03d7fc',
    borderRadius: 12,
    padding: 16,
  },
  optionText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 18,
    color: '#03d7fc',
    textAlign: 'center',
  },
  optionCorrect: {
    backgroundColor: '#00FF7F',
    borderColor: '#00FF7F',
  },
  optionWrong: {
    backgroundColor: '#FF4C4C',
    borderColor: '#FF4C4C',
  },
  optionSelected: {
    backgroundColor: '#D3D3D3',
    borderColor: '#888',
  },

  closeButton: {
    backgroundColor: 'rgba(255, 0, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#FF00FF',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  closeButtonText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 16,
    color: '#000000',
  },
  errorText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 18,
    color: '#FF00FF',
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 18,
    color: '#03d7fc',
    textAlign: 'center',
    marginBottom: 24,
  },
});