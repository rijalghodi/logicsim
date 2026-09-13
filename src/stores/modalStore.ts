import { SaveChipModal } from "@/components/ui/SaveChipModal";
import { UnsavedAlert } from "@/components/ui/UnsavedAlert";
import { DeleteChipAlert } from "@/components/ui/DeleteChipAlert";
import { CustomizePortModal } from "@/components/ui/CustomizePortModal";
import { PreferencesModal } from "@/components/ui/PreferencesModal";
import { create } from "zustand";

/** Chrome every modal shares, on top of whatever business payload `P` a specific modal needs. */
interface ModalChrome {
  readonly title: string;
  readonly description?: string;
}

/**
 * Props every registered modal body receives. `openModal`/`closeModal` reuse
 * `modals.open`/`modals.close`'s own types (`typeof open`/`typeof close`) rather than a
 * separately-declared, looser signature — so a modal opening a *different* modal type from
 * inside its own handler (e.g. `UnsavedAlert`'s SAVE button opening "save-chip") is checked
 * exactly the same way a top-level caller is, with no separate, unchecked path.
 */
export type ModalContextProps<P> = {
  readonly type: ModalType;
  readonly payload: P & ModalChrome;
  readonly openModal: typeof open;
  readonly closeModal: typeof close;
};

/** One registry entry: a modal body fixed to payload shape `P`, plus the chrome defaults callers can omit at `open()` time. */
interface ModalConfig<P> {
  readonly component: (props: ModalContextProps<P>) => React.JSX.Element | null;
  readonly defaultPayload: ModalChrome;
}

/**
 * Pins down `P` at each registration so TypeScript checks `component` against *that* modal's
 * own payload type, instead of every entry being widened to one shared, unchecked shape.
 * Plain identity function — it exists only so the caller can supply `<P>` explicitly; TS can't
 * infer it from `component` alone here, since inference through a function parameter position
 * would go the wrong way (it would infer `P` as whatever `component` already says, defeating
 * the check instead of enforcing it against what the caller intends to register).
 */
function defineModal<P>(config: ModalConfig<P>): ModalConfig<P> {
  return config;
}

export const modalTypes = {
  "save-chip": defineModal<{ chipId: string | null }>({
    component: SaveChipModal,
    defaultPayload: { title: "SAVE CHIP", description: "Enter a name and color for the chip." },
  }),
  "unsaved-alert": defineModal<{ chipIdToOpen: string | null }>({
    component: UnsavedAlert,
    defaultPayload: { title: "UNSAVED CHANGES", description: "Do you want to save this circuit before proceeding?" },
  }),
  "delete-chip": defineModal<{ chipId: string }>({
    component: DeleteChipAlert,
    defaultPayload: { title: "DELETE CHIP", description: "This action cannot be undone." },
  }),
  "customize-port": defineModal<{ portId: string }>({
    component: CustomizePortModal,
    defaultPayload: { title: "CUSTOMIZE PORT", description: "Enter a new name for this boundary port." },
  }),
  preferences: defineModal<object>({
    component: PreferencesModal,
    defaultPayload: { title: "PREFERENCES", description: "Personalize how the circuit is displayed." },
  }),
} as const;

type ModalRegistry = typeof modalTypes;
export type ModalType = keyof ModalRegistry;

/** The business payload a given modal type expects, recovered from its own registration. */
type PayloadOf<K extends ModalType> = ModalRegistry[K] extends ModalConfig<infer P> ? P : never;

/**
 * The active modal, kept as a discriminated union — one branch per registered type — rather
 * than a single pre-erased shape. `type`, `payload`, and `component` all stay correlated even
 * in the store's own state, not just at the `open()` call site.
 */
type ActiveModal = {
  [K in ModalType]: {
    readonly type: K;
    readonly payload: PayloadOf<K> & Required<ModalChrome>;
    readonly component: ModalRegistry[K]["component"];
  };
}[ModalType];

interface ModalState {
  readonly active: ActiveModal | null;
}

/**
 * Deliberately-erased component shape, for exactly one use: `ModalView` rendering "whichever
 * modal is active" generically, from a lookup result rather than a statically-known component.
 * Individual modal declarations should never use this — they should keep declaring
 * `ModalContextProps<TheirOwnSpecificPayload>` directly, the way every registered modal already does.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyModalComponent = (props: ModalContextProps<any>) => React.JSX.Element | null;

export const useModalStore = create<ModalState>(() => ({ active: null }));

function open<K extends ModalType>(type: K, payload: PayloadOf<K> & Partial<ModalChrome>): void {
  const config = modalTypes[type];
  const resolvedPayload = { ...config.defaultPayload, ...payload } as PayloadOf<K> & Required<ModalChrome>;
  // The one necessary cast: `K` is only known at the type level inside this generic function's
  // signature, not at its runtime body, so TS can't itself verify that `resolvedPayload` and
  // `config.component` line up with the *same* branch of `ActiveModal` for this specific `K` —
  // that correlation is exactly what registration (`defineModal<P>`) and this function's own
  // parameter type already checked, on both sides, before we got here.
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
