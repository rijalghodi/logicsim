import { SaveChipModal } from "@/components/ui/SaveChipModal";
import { UnsavedAlert } from "@/components/ui/UnsavedAlert";
import { DeleteChipAlert } from "@/components/ui/DeleteChipAlert";
import { CustomizePortModal } from "@/components/ui/CustomizePortModal";
import { PreferencesModal } from "@/components/ui/PreferencesModal";
import { create } from "zustand";

export type ModalProps<P> = {
  type: ModalType;
  payload: P;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModalComponent = (props: ModalProps<any>) => React.JSX.Element | null;

export const modalTypes = {
  "save-chip": SaveChipModal,
  "unsaved-alert": UnsavedAlert,
  "delete-chip": DeleteChipAlert,
  "customize-port": CustomizePortModal,
  preferences: PreferencesModal,
};

export type ModalType = keyof typeof modalTypes;
export type ModalPayload = { title: string; description?: string } & Record<string, unknown>;

type ActiveModal = {
  type: ModalType;
  payload: ModalPayload;
  component: ModalComponent;
};

interface ModalState {
  readonly active: ActiveModal | null;
}

export const useModalStore = create<ModalState>(() => ({ active: null }));

function open(type: ModalType, payload: ModalPayload): void {
  useModalStore.setState({ active: { type, payload, component: modalTypes[type] } });
}

function close(): void {
  useModalStore.setState({ active: null });
}

function getActive() {
  return useModalStore.getState().active;
}

export const modals = {
  open,
  close,
  getActive,
};
