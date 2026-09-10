import type { ReactNode, FormEvent } from "react";
import "./Modal.css";

interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ children }: { readonly children: ReactNode }) {
  return <div className="modal-header">{children}</div>;
}

export function ModalTitle({ children }: { readonly children: ReactNode }) {
  return <h3 className="modal-title">{children}</h3>;
}

export function ModalDescription({ children }: { readonly children: ReactNode }) {
  return <p className="modal-description">{children}</p>;
}

interface ModalBodyProps {
  readonly children: ReactNode;
  readonly onSubmit?: (e: FormEvent) => void;
}

export function ModalBody({ children, onSubmit }: ModalBodyProps) {
  if (onSubmit) {
    return (
      <form onSubmit={onSubmit} className="modal-body">
        {children}
      </form>
    );
  }
  return <div className="modal-body">{children}</div>;
}

export function ModalActions({ children }: { readonly children: ReactNode }) {
  return <div className="modal-actions">{children}</div>;
}
