import type { AnyModalComponent } from "@/stores/modalStore";
import { modals, useModalStore } from "@/stores/modalStore";
import { Modal, ModalBody, ModalDescription, ModalHeader, ModalTitle } from "./Modal";

export function ModalView() {
  const active = useModalStore((state) => state.active);

  if (!active) return null;

  const { payload, type } = active;
  // `active.component` is correlated to `active.type`/`active.payload` in the store's own
  // type (see `ActiveModal` in modalStore.ts) — this cast is the one place that correlation
  // legitimately collapses, since we're rendering a lookup result generically, not a
  // statically-known component.
  const Component = active.component as AnyModalComponent;

  return (
    <Modal isOpen={true} onClose={modals.close}>
      <ModalHeader>
        <ModalTitle>{payload.title}</ModalTitle>
        {payload.description && <ModalDescription>{payload.description}</ModalDescription>}
      </ModalHeader>
      <ModalBody>
        <Component type={type} payload={payload} openModal={modals.open} closeModal={modals.close} />
      </ModalBody>
    </Modal>
  );
}
