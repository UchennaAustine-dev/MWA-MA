import { useCallback, useState } from "react";

export interface ModalState {
  [key: string]: boolean;
}

export function useModalManager(initialState: ModalState = {}) {
  const [modals, setModals] = useState<ModalState>(initialState);

  const openModal = useCallback((modalName: string) => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
  }, []);

  const closeModal = useCallback((modalName: string) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals((prev) => {
      const newState: ModalState = {};
      Object.keys(prev).forEach((key) => {
        newState[key] = false;
      });
      return newState;
    });
  }, []);

  const toggleModal = useCallback((modalName: string) => {
    setModals((prev) => ({ ...prev, [modalName]: !prev[modalName] }));
  }, []);

  const isModalOpen = useCallback(
    (modalName: string) => {
      return modals[modalName] || false;
    },
    [modals]
  );

  return {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    toggleModal,
    isModalOpen,
  };
}
