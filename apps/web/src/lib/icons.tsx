// Inline SVG icons — lucide-flavored. One file, no dependency.
// Usage: <Icon name="send" className="w-5 h-5" />

import type { SVGProps } from 'react';

type Path = string | string[];

const ICONS: Record<string, Path> = {
  // navigation / status
  wallet: ['M19 7H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z', 'M16 14h2', 'M3 7V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v2'],
  send: 'M5 12h14M13 5l7 7-7 7',
  receive: 'M19 12H5M11 19l-7-7 7-7',
  swap: 'M3 7h13l-3-3M21 17H8l3 3',
  collect: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M9 13h6', 'M9 17h4'],
  bank: ['M3 21h18', 'M3 10h18', 'M5 6l7-3 7 3', 'M4 10v11', 'M20 10v11', 'M8 14v3', 'M12 14v3', 'M16 14v3'],
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  shieldCheck: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z', 'm9 12 2 2 4-4'],
  id: ['M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z', 'M14 8h4', 'M14 12h4', 'M6 16c0-2 1.8-3 3-3s3 1 3 3', 'M9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'],
  bell: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
  user: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'],
  settings: ['M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
  qr: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M3 14h7v7H3z', 'M14 14h3v3h-3z', 'M20 14v3h-3', 'M14 20h3v1', 'M20 20h1v1'],
  arrowUp: 'M12 19V5M5 12l7-7 7 7',
  arrowDown: 'M12 5v14M19 12l-7 7-7-7',
  arrowUpRight: 'M7 17 17 7M7 7h10v10',
  arrowDownLeft: 'M17 7 7 17M7 7v10h10',
  plus: 'M12 5v14M5 12h14',
  plusCircle: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 8v8', 'M8 12h8'],
  copy: ['M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2', 'M9 2h6v4H9z'],
  check: 'M20 6 9 17l-5-5',
  checkCircle: ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'm9 11 3 3L22 4'],
  x: 'M18 6 6 18M6 6l12 12',
  xCircle: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M15 9l-6 6', 'M9 9l6 6'],
  warning: ['M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z', 'M12 9v4', 'M12 17h.01'],
  spark: ['M12 3v3', 'M12 18v3', 'M5.6 5.6l2.1 2.1', 'M16.3 16.3l2.1 2.1', 'M3 12h3', 'M18 12h3', 'M5.6 18.4l2.1-2.1', 'M16.3 7.7l2.1-2.1'],
  globe: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M2 12h20', 'M12 2a14 14 0 0 1 0 20', 'M12 2a14 14 0 0 0 0 20'],
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z',
  alert: ['M21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z', 'M12 9v4', 'M12 17h.01'],
  receipt: ['M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2', 'M8 7h8', 'M8 11h8', 'M8 15h5'],
  star: 'M12 2 9.2 8.6 2 9.3l5.5 4.7L5.8 21 12 17.3 18.2 21l-1.7-7L22 9.3l-7.2-.7Z',
  trending: 'M22 7 13 16l-4-4-7 7',
  history: ['M3 12a9 9 0 1 0 9-9c-2.6 0-5 1.1-6.7 2.8L3 8', 'M3 3v5h5', 'M12 7v5l3 3'],
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'm21 21-4.3-4.3'],
  back: 'M19 12H5M12 19l-7-7 7-7',
  logout: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  flower: ['M12 12V2', 'M12 12v10', 'M12 12 2 12', 'M12 12l10 0', 'M12 12 5 5', 'M12 12l7-7', 'M12 12 5 19', 'M12 12l7 7'],
  sparkles: ['M12 3 9 9l-6 .75 4.5 3.94L6 21l6-3 6 3-1.5-7.31L21 9.75 15 9z'],
  eye: ['M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
  eyeOff: ['M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94', 'M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19', 'M1 1l22 22'],
};

export type IconName = keyof typeof ICONS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size, className, ...rest }: IconProps) {
  const def = ICONS[name];
  const paths = Array.isArray(def) ? def : [def];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
