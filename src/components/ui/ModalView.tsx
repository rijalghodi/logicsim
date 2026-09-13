import { modals, useModalStore } from "@/stores/modalStore";
import { Modal, ModalBody, ModalDescription, ModalHeader, ModalTitle } from "./Modal";

export function ModalView() {
  const active = useModalStore((state) => state.active);

  if (!active) return null;

  const { component: Component, payload, type } = active;

  return (
    <Modal isOpen={true} onClose={modals.close}>
      <ModalHeader>
        <ModalTitle>{payload.title}</ModalTitle>
        {payload.description && <ModalDescription>{payload.description}</ModalDescription>}
      </ModalHeader>
      <ModalBody>
        <Component type={type} payload={payload} />
      </ModalBody>
    </Modal>
  );
}
