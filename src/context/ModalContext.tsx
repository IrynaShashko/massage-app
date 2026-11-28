import { createContext, ReactNode, useContext, useState } from "react";
import { Modal } from "../components/Modal";

import { AuthReturnState } from "../hooks/useAuthReturn";

interface ModalContextType {
  /** Sign-in prompt; extra marks where to bring the visitor after sign-in */
  openModal: (extra?: Omit<AuthReturnState, "from">) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [extra, setExtra] = useState<Omit<AuthReturnState, "from">>();

  const openModal = (options?: Omit<AuthReturnState, "from">) => {
    setExtra(options);
    setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {isOpen && <Modal onClose={closeModal} authExtra={extra} />}
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within ModalProvider");
  return context;
};
