import { create } from 'zustand';

type CallDetails = any;

interface CallState {
  incomingCall: boolean;
  callDetails: CallDetails | null;
  isUnlimitedCall: boolean;
  setIsUnlimitedCall: (value: boolean) => void;
  setIncomingCall: (value: boolean) => void;
  setIncomingCallDetails: (data: CallDetails) => void;
  clearvideocalldata: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  incomingCall: false,
  callDetails: null,
  isUnlimitedCall: false,
  setIncomingCall: (value) => set({ incomingCall: value }),
  setIncomingCallDetails: (data) => set({ callDetails: data }),
  setIsUnlimitedCall: (value) => set({ isUnlimitedCall: value }),
  clearvideocalldata: () => set({ incomingCall: false, callDetails: null, isUnlimitedCall: false, })
}));