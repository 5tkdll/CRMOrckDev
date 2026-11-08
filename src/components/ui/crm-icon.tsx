import type { CSSProperties } from "react";
export type IconName = "terminal" | "dashboard" | "business" | "point_of_sale" | "task_alt" | "code" | "dns" | "upload_file" | "sell" | "settings" | "account_circle" | "help" | "add" | "chevron_right" | "search" | "database" | "logout" | "web_asset_off" | "call" | "block" | "edit" | "open_in_new" | "location_on" | "trending_up" | "schedule";
// Local SVG pictograms: no icon font, CDN, emoji or new dependency required.
const drawings: Record<IconName, React.ReactNode> = {
  terminal: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3m6 0h4"/></>,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="11" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="18" width="7" height="3" rx="1"/></>,
  business: <><path d="M3 21V3h11v18M14 8h7v13M1 21h22M7 7h3m-3 4h3m-3 4h3m-3 4h3m7-7h1m-1 4h1"/></>,
  point_of_sale: <><path d="M4 21h16V10H4zm2-11 2-7h8l2 7M7 14h2m3 0h2m3 0h1M7 17h2m3 0h2m3 0h1M10 6h4"/></>,
  task_alt: <><path d="M21 11v1a9 9 0 1 1-5.3-8.2"/><path d="m8 11 4 4L22 4"/></>,
  code: <><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/></>,
  dns: <><rect x="3" y="3" width="18" height="7" rx="1"/><rect x="3" y="14" width="18" height="7" rx="1"/><path d="M7 6.5h.1M7 17.5h.1M12 6.5h5M12 17.5h5"/></>,
  upload_file: <><path d="M14 2H5v20h14V7zm0 0v5h5M12 18V10m-3 3 3-3 3 3"/></>,
  sell: <><path d="m3 3 9 .1 9 9-9 9-9-9Z"/><circle cx="7.5" cy="7.5" r="1"/></>,
  settings: <><path d="m9 3 .7 2.2 4.6 0L15 3l3 1.7-.8 2.2 2.3 4 .5.1 2-.1v3.5l-2.4.5-2.3 4 .7 2.1-3 1.7-.7-2.2H9.7L9 22l-3-1.7.8-2.2-2.3-4L2 13.5V10l2.5-.5 2.3-4L6 3.3Z" transform="translate(0 -1) scale(1 .95)"/><circle cx="12" cy="11" r="3"/></>,
  account_circle: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="9" r="3"/><path d="M5 18c1-5 13-5 14 0"/></>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 0 1 6 0c0 2-3 2-3 5m0 4h.01"/></>,
  add: <path d="M12 5v14M5 12h14"/>,
  chevron_right: <path d="m9 5 7 7-7 7"/>,
  search: <><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>,
  database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/></>,
  logout: <><path d="M9 3H3v18h6m6-15 6 6-6 6M8 12h13"/></>,
  web_asset_off: <><path d="M3 9V4h18v14h-3M3 13v5h9M3 2l19 20M8 8h13"/></>,
  call: <path d="m5 3 4 4-2 3c2 3 4 5 7 6l3-2 4 4-2 3C10 22 2 14 2 6Z"/>,
  block: <><circle cx="12" cy="12" r="9"/><path d="m6 6 12 12"/></>,
  edit: <><path d="m15 4 5 5M3 21l5-1L21 7l-5-5L3 15Z"/></>,
  open_in_new: <><path d="M14 3h7v7M21 3 10 14M10 3H3v18h18v-7"/></>,
  location_on: <><path d="M12 22S4 14 4 9a8 8 0 0 1 16 0c0 5-8 13-8 13Z"/><circle cx="12" cy="9" r="2"/></>,
  trending_up: <><path d="m3 17 6-6 4 4 8-10M15 5h6v6"/></>,
  schedule: <><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>,
};
export function CrmIcon({name,size=20,className,style}:{name:IconName;size?:number;className?:string;style?:CSSProperties}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className} style={{flexShrink:0,...style}}>{drawings[name]}</svg>;
}
