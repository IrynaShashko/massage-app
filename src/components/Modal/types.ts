import { ReactNode } from "react";

export interface ModalPropsType {
  children?: ReactNode;
  onClose: () => void;
}

export interface ModalContentProps {
  children: ReactNode;
}
