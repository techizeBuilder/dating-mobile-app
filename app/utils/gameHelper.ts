export const calculateSharedAnswers = (yourAnswers: string[], opponentAnswers: string[]) => {
  let shared = 0;
  for (let i = 0; i < yourAnswers.length; i++) {
    if (yourAnswers[i] === opponentAnswers[i]) {
      shared++;
    }
  }
  return shared;
};
