type NotificationType = "success" | "error" | "warning" | "info";

const ICONS: Record<NotificationType, string> = {
  success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
};

const COLORS: Record<NotificationType, { bg: string; light: string }> = {
  success: { bg: "#388072", light: "#f0faf7" },
  error: { bg: "#e74c3c", light: "#fef2f2" },
  warning: { bg: "#f39c12", light: "#fffbeb" },
  info: { bg: "#2d6a5a", light: "#f0faf7" },
};

let containerEl: HTMLDivElement | null = null;

function getContainer(): HTMLDivElement {
  if (containerEl && document.body.contains(containerEl)) return containerEl;
  containerEl = document.createElement("div");
  containerEl.id = "ousad-notifications";
  containerEl.style.cssText =
    "position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;max-width:380px;width:100%;";
  document.body.appendChild(containerEl);
  return containerEl;
}

function injectStyles(): void {
  if (document.getElementById("ousad-notif-style")) return;
  const style = document.createElement("style");
  style.id = "ousad-notif-style";
  style.textContent = `
    @keyframes ousad-slide-in { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes ousad-slide-out { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(40px); } }
    @keyframes ousad-progress { from { width: 100%; } to { width: 0%; } }
    .ousad-notif { pointer-events: auto; display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; border-radius: 12px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06); animation: ousad-slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; position: relative; overflow: hidden; border-left: 4px solid var(--notif-color); cursor: pointer; transition: transform 0.15s ease; }
    .ousad-notif:hover { transform: scale(1.01); }
    .ousad-notif.removing { animation: ousad-slide-out 0.3s cubic-bezier(0.5, 0, 0.75, 0) forwards; }
    .ousad-notif-icon { flex-shrink: 0; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--notif-color); background: var(--notif-light); }
    .ousad-notif-body { flex: 1; min-width: 0; }
    .ousad-notif-title { font-weight: 700; font-size: 13px; text-transform: capitalize; color: var(--notif-color); margin-bottom: 2px; }
    .ousad-notif-msg { font-size: 13.5px; color: #374151; line-height: 1.4; word-break: break-word; }
    .ousad-notif-close { flex-shrink: 0; background: none; border: none; cursor: pointer; color: #9ca3af; padding: 2px; border-radius: 6px; transition: all 0.15s; line-height: 0; }
    .ousad-notif-close:hover { background: #f3f4f6; color: #374151; }
    .ousad-notif-progress { position: absolute; bottom: 0; left: 0; height: 3px; background: var(--notif-color); opacity: 0.4; border-radius: 0 0 0 12px; animation: ousad-progress var(--notif-duration) linear forwards; }
  `;
  document.head.appendChild(style);
}

function removeNotif(el: HTMLDivElement): void {
  el.classList.add("removing");
  setTimeout(() => el.remove(), 300);
}

export const showNotification = (type: NotificationType, message: string, duration = 3000): void => {
  if (typeof window === "undefined") return;
  injectStyles();
  const container = getContainer();
  const color = COLORS[type] || COLORS.info;
  const el = document.createElement("div") as HTMLDivElement;
  el.className = "ousad-notif";
  el.style.setProperty("--notif-color", color.bg);
  el.style.setProperty("--notif-light", color.light);
  el.style.setProperty("--notif-duration", `${duration}ms`);
  el.innerHTML = `
    <div class="ousad-notif-icon">${ICONS[type] || ICONS.info}</div>
    <div class="ousad-notif-body"><div class="ousad-notif-title">${type}</div><div class="ousad-notif-msg">${message}</div></div>
    <button class="ousad-notif-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    <div class="ousad-notif-progress"></div>
  `;
  el.querySelector(".ousad-notif-close")!.addEventListener("click", () => removeNotif(el));
  el.addEventListener("click", (e) => { if (!(e.target as HTMLElement).closest(".ousad-notif-close")) removeNotif(el); });
  container.appendChild(el);
  const timer = setTimeout(() => removeNotif(el), duration);
  el.addEventListener("mouseenter", () => { clearTimeout(timer); const bar = el.querySelector<HTMLDivElement>(".ousad-notif-progress"); if (bar) bar.style.animationPlayState = "paused"; });
  el.addEventListener("mouseleave", () => { const bar = el.querySelector<HTMLDivElement>(".ousad-notif-progress"); if (bar) bar.style.animationPlayState = "running"; setTimeout(() => removeNotif(el), 1500); });
};
