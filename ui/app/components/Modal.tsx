import { ReactNode } from "react";

type ModalProps = {
  children: ReactNode;
  onClose: () => void;
};

export default function Modal({ children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg w-1/2">
        <button className="absolute top-2 right-2" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}
