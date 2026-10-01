import { Apple, Box, Droplets, HelpCircle, Moon, Sun, Trees, Hand, type LucideIcon } from 'lucide-react';
const MAP: Record<string, LucideIcon> = { Sun, Droplets, Apple, Trees, Box, Moon, Hand };
export function RoutineIcon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  const I = MAP[name] ?? HelpCircle; return <I size={size} className={className} />;
}
