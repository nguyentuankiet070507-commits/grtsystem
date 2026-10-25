import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'GRTSystem | Find a seat before you arrive', description: 'Real-time café occupancy demo' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="vi"><body>{children}</body></html>; }
