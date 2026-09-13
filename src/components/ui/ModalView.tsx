import type { AnyModalComponent } from "@/stores/modalStore";
import { modals, useModalStore } from "@/stores/modalStore";
import { Modal, ModalBody, ModalDescription, ModalHeader, ModalTitle } from "./Modal";

export function ModalView() {
  const active = useModalStore((state) => state.active);

  if (!active) return null;

  const { payload, type } = active;

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
