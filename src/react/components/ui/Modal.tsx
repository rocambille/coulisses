/*
  Purpose:
  Reusable Modal dialog component based on Pico CSS.
*/

import type { ReactNode } from "react";

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <dialog open>
      <article>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button
            type="button"
            aria-label="Fermer"
            className="close"
            onClick={onClose}
          />
        </header>
        {children}
      </article>
    </dialog>
  );
}
