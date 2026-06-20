"use client";

// ──────────────────────────────────────────────────────────────────────────
// FLOTA ARRASTRABLE (NEXIA Pro)
// Reordena las tarjetas arrastrando (escritorio + táctil + teclado). Las
// CRÍTICAS siempre arriba; luego las FIJADAS; luego el orden del usuario.
// El orden y los pins se guardan (useFleetOrder).
// ──────────────────────────────────────────────────────────────────────────

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { col } from "@/lib/constants";
import { ordenarConPreferencias } from "@/lib/domain/flota";
import { useFleetOrder } from "@/lib/state/useFleetOrder";
import type { Maquina } from "@/lib/types";
import { Icon } from "../ui/Icon";
import { MachineCardPro } from "./MachineCardPro";

export function SortableFleet({ maquinas }: { maquinas: Maquina[] }) {
  const { orden, pins, setOrden, togglePin } = useFleetOrder();
  const display = ordenarConPreferencias(maquinas, orden, pins);
  const ids = display.map((m) => m.id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oi = ids.indexOf(String(active.id));
      const ni = ids.indexOf(String(over.id));
      if (oi !== -1 && ni !== -1) setOrden(arrayMove(ids, oi, ni));
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {display.map((m) => (
            <SortableCard key={m.id} m={m} pinned={pins.includes(m.id)} onPin={() => togglePin(m.id)} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableCard({ m, pinned, onPin }: { m: Maquina; pinned: boolean; onPin: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: m.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  };

  const ctrlBtn = "flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-neutral-500 shadow-sm ring-1 ring-neutral-200/70 backdrop-blur transition-colors hover:text-neutral-800 dark:bg-neutral-800/90 dark:text-neutral-400 dark:ring-neutral-700";

  return (
    <div ref={setNodeRef} style={style} className={`group/sort relative ${isDragging ? "opacity-90" : ""}`}>
      <MachineCardPro m={m} />

      {/* Controles (handle + pin): aparecen al pasar el cursor; el pin queda fijo si está activo */}
      <div
        className={`absolute right-2 top-2 z-10 flex gap-1 transition-opacity ${pinned ? "opacity-100" : "opacity-0 group-hover/sort:opacity-100"}`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPin();
          }}
          aria-label={pinned ? "Desfijar máquina" : "Fijar máquina arriba"}
          aria-pressed={pinned}
          className={ctrlBtn}
          style={pinned ? { color: col("brand") } : undefined}
        >
          <Icon name="pin" className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Arrastrar para reordenar"
          className={`${ctrlBtn} cursor-grab touch-none active:cursor-grabbing`}
          {...attributes}
          {...listeners}
        >
          <Icon name="grip" className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
