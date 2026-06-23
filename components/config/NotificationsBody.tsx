"use client";

// ──────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN · pestaña NOTIFICACIONES
// Canales (app/correo/SMS/WhatsApp), severidades que notifican, escalado si
// nadie atiende y horario silencioso. El envío real (correo/SMS) llega con el
// backend; aquí se configura. Persistido + auditoría.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { toast } from "sonner";
import { ROLES, ROL_NOMBRE } from "@/lib/constants";
import { useT } from "@/lib/state/I18nProvider";
import { useAdmin } from "@/lib/state/AdminProvider";
import { useIntegraciones, type NotifPrefs } from "@/lib/state/IntegrationsProvider";
import { useSession } from "@/lib/state/SessionProvider";
import type { Rol } from "@/lib/types";
import { Card } from "../ui/Card";
import { Button, Switch } from "../ui/Primitives";
import { Label } from "../ui/Typo";

export function NotificationsBody() {
  const { notif, setNotif } = useIntegraciones();
  const { registrar } = useAdmin();
  const { rol } = useSession();
  const t = useT();
  const [f, setF] = useState<NotifPrefs>(notif);

  const set = (parcial: Partial<NotifPrefs>) => setF((prev) => ({ ...prev, ...parcial }));
  const input = "rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800";

  function guardar() {
    setNotif(f);
    registrar(ROL_NOMBRE[rol], "Guardó notificaciones", `Canales: ${[f.inApp && "app", f.email && "correo", f.sms && "SMS", f.whatsapp && "WhatsApp"].filter(Boolean).join(", ") || "ninguno"}`);
    toast(t("notif.savedToast"));
  }

  return (
    <div className="space-y-4">
      {/* Canales */}
      <Card className="px-7 py-6">
        <Label>{t("notif.channels")}</Label>
        <div className="mt-4 space-y-4">
          <Fila titulo={t("notif.inApp")} desc={t("notif.inAppDesc")}>
            <Switch checked={f.inApp} onChange={(v) => set({ inApp: v })} label={t("notif.inApp")} />
          </Fila>
          <Fila titulo={t("notif.email")} desc={t("notif.emailDesc")}>
            <div className="flex items-center gap-3">
              {f.email && (
                <input value={f.emailDest} onChange={(e) => set({ emailDest: e.target.value })} placeholder={t("team.emailPlaceholder")} className={input} />
              )}
              <Switch checked={f.email} onChange={(v) => set({ email: v })} label={t("notif.email")} />
            </div>
          </Fila>
          <Fila titulo={t("notif.sms")} desc={t("notif.smsDesc")}>
            <div className="flex items-center gap-3">
              {f.sms && (
                <input value={f.telDest} onChange={(e) => set({ telDest: e.target.value })} placeholder="+52 …" className={input} />
              )}
              <Switch checked={f.sms} onChange={(v) => set({ sms: v })} label={t("notif.sms")} />
            </div>
          </Fila>
          <Fila titulo={t("notif.whatsapp")} desc={t("notif.whatsappDesc")}>
            <Switch checked={f.whatsapp} onChange={(v) => set({ whatsapp: v })} label={t("notif.whatsapp")} />
          </Fila>
        </div>
      </Card>

      {/* Cuándo notificar + escalado */}
      <Card className="px-7 py-6">
        <Label>{t("notif.when")}</Label>
        <div className="mt-4 space-y-4">
          <Fila titulo={t("notif.critical")} desc={t("notif.criticalDesc")}>
            <Switch checked={f.critico} onChange={(v) => set({ critico: v })} label={t("notif.critical")} />
          </Fila>
          <Fila titulo={t("notif.warning")} desc={t("notif.warningDesc")}>
            <Switch checked={f.advertencia} onChange={(v) => set({ advertencia: v })} label={t("notif.warning")} />
          </Fila>
          <Fila titulo={t("notif.escalate")} desc={t("notif.escalateDesc")}>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={f.escaladoMin}
                onChange={(e) => set({ escaladoMin: Number(e.target.value) })}
                className={`${input} w-16`}
              />
              <span className="text-xs text-neutral-400">{t("notif.minTo")}</span>
              <select value={f.escalarA} onChange={(e) => set({ escalarA: e.target.value as Rol })} className={input}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {t(`roles.${r}`)}
                  </option>
                ))}
              </select>
            </div>
          </Fila>
        </div>
      </Card>

      {/* Horario silencioso */}
      <Card className="px-7 py-6">
        <Label>{t("notif.quiet")}</Label>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-sm">{t("notif.dnd")}</div>
            <div className="text-xs text-neutral-400">{t("notif.dndDesc")}</div>
          </div>
          <div className="flex items-center gap-2">
            <input type="time" value={f.silencioInicio} onChange={(e) => set({ silencioInicio: e.target.value })} className={input} />
            <span className="text-xs text-neutral-400">{t("notif.to")}</span>
            <input type="time" value={f.silencioFin} onChange={(e) => set({ silencioFin: e.target.value })} className={input} />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={guardar}>{t("notif.save")}</Button>
      </div>
    </div>
  );
}

function Fila({ titulo, desc, children }: { titulo: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm">{titulo}</div>
        <div className="text-xs text-neutral-400">{desc}</div>
      </div>
      {children}
    </div>
  );
}
