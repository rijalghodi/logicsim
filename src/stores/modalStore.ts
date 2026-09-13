import { SaveChipModal } from "@/components/ui/SaveChipModal";
import { UnsavedAlert } from "@/components/ui/UnsavedAlert";
import { DeleteChipAlert } from "@/components/ui/DeleteChipAlert";
import { CustomizePortModal } from "@/components/ui/CustomizePortModal";
import { PreferencesModal } from "@/components/ui/PreferencesModal";
import { create } from "zustand";

/** Header fields every modal has: a title, and an optional description. */
interface ModalMeta {
  readonly title: string;
  readonly description?: string;
}

/** Props a modal body component receives: its payload (chrome + business data), and functions to open another modal or close itself. */
export type ModalContextProps<P> = {
  readonly type: ModalType;
  readonly payload: P & ModalMeta;
  readonly openModal: typeof open;
  readonly closeModal: typeof close;
};

/** One registry entry: the component to render, and the default title/description to use when `open()` doesn't provide one. */
interface ModalConfig<P> {
  readonly component: (props: ModalContextProps<P>) => React.JSX.Element | null;
  readonly defaultPayload: ModalMeta;
}

/** Registers a modal. `P` is picked up automatically from `component`'s own payload type. */
export function defineModal<P>(config: ModalConfig<P>): ModalConfig<P> {
  return config;
}

/** A dictionary of all registered modals. */
export const modalTypes = {
  "save-chip": defineModal({
    component: SaveChipModal,
    defaultPayload: { title: "SAVE CHIP", description: "Enter a name and color for your new custom chip." },
  }),
  "unsaved-alert": defineModal({
    component: UnsavedAlert,
    defaultPayload: { title: "UNSAVED CHANGES" },
  }),
  "delete-chip": defineModal({
    component: DeleteChipAlert,
    defaultPayload: { title: "DELETE CHIP" },
  }),
  "customize-port": defineModal({
    component: CustomizePortModal,
    defaultPayload: { title: "CUSTOMIZE PORT", description: "Enter a new name for this boundary port." },
  }),
  preferences: defineModal({
    component: PreferencesModal,
    defaultPayload: { title: "PREFERENCES", description: "Personalize how the circuit is displayed." },
  }),
} as const;

type ModalRegistry = typeof modalTypes;
export type ModalType = keyof ModalRegistry;

/** The business payload a given modal type expects, recovered from its own registration. */
type PayloadOf<K extends ModalType> = ModalRegistry[K] extends ModalConfig<infer P> ? P : never;

/** The currently open modal: its type, its resolved payload, and the component to render. */
type ActiveModal = {
  [K in ModalType]: {
    readonly type: K;
    readonly payload: PayloadOf<K> & ModalMeta;
    readonly component: ModalRegistry[K]["component"];
  };
}[ModalType];

interface ModalState {
  readonly active: ActiveModal | null;
}

/** Generic component type, used only by `ModalView` to render whichever modal is active. Don't use this for a modal's own declaration — use `ModalContextProps<YourPayload>` instead. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyModalComponent = (props: ModalContextProps<any>) => React.JSX.Element | null;

export const useModalStore = create<ModalState>(() => ({ active: null }));

function open<K extends ModalType>(type: K, payload?: PayloadOf<K> & Partial<ModalMeta>): void {
  const config = modalTypes[type];
  const resolvedPayload = { ...config.defaultPayload, ...payload } as PayloadOf<K> & ModalMeta;
  useModalStore.setState({
    active: { type, payload: resolvedPayload, component: config.component } as ActiveModal,
  });
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
