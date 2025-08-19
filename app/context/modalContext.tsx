import React, { createContext, useContext, useState } from "react";

type ModalContent = {
  title: string;
  message: string;
  buttons?: {
    text: string;
    onPress: () => void;
    style?: "default" | "cancel" | "destructive";
  }[];
};

type ModalContextType = {
  showModal: (content: ModalContent) => void;
  hideModal: () => void;
  modalVisible: boolean;
  modalContent: ModalContent | null;
};

const ModalContext = createContext<ModalContextType>({
  showModal: () => {},
  hideModal: () => {},
  modalVisible: false,
  modalContent: null,
});

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);

  const showModal = (content: ModalContent) => {
    setModalContent(content);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setModalContent(null);
  };

  return (
    <ModalContext.Provider
      value={{ showModal, hideModal, modalVisible, modalContent }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
