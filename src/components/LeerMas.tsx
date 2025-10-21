import React, { useState } from 'react';

interface LeerMasProps {
  children: React.ReactNode;
  maxChars?: number; // máximo de caracteres antes de truncar]
}

export default function LeerMas({ children, maxChars = 160 }: LeerMasProps) {
  const texto = String(children || '');
  const [expanded, setExpanded] = useState(false);

  if (texto.length <= maxChars) return <span>{texto}</span>;

  const mostrar = expanded ? texto : texto.slice(0, maxChars).trimEnd() + '…';

  return (
    <span>
      <span>{mostrar}</span>
      <button
        onClick={() => setExpanded((s) => !s)}
        className="ml-2 text-sm font-semibold text-blue-600 hover:underline"
        type="button"
      >
        {expanded ? 'Leer menos' : 'Leer más'}
      </button>
    </span>
  );
}
