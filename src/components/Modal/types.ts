import { ReactNode } from "react";

import { AuthReturnState } from "../../hooks/useAuthReturn";

export interface ModalPropsType {
  children?: ReactNode;
  onClose: () => void;
  /** added to the router state of the link to /auth */
  authExtra?: Omit<AuthReturnState, "from">;
}

export interface ModalContentProps {
  children: ReactNode;
}
