// ──────────────────────────────────────────────────────────────────────────
// RUTA "/activo/[id]" · DETALLE DE ACTIVO
// El id viaja codificado en la URL (las máquinas tienen espacios y símbolos);
// aquí se decodifica y se pasa a la vista.
// ──────────────────────────────────────────────────────────────────────────

import { AssetDetail } from "@/components/AssetDetail";

export default function Page({ params }: { params: { id: string } }) {
  return <AssetDetail id={decodeURIComponent(params.id)} />;
}
