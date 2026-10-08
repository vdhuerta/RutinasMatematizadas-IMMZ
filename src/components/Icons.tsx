import { Apple, BookOpen, Box, Dices, Droplets, HelpCircle, ListChecks, LogOut, Milk, Moon, Package, Shirt, Sparkles, Sun, Sunrise, Trees, Hand, Users, type LucideIcon } from 'lucide-react';
const MAP: Record<string, LucideIcon> = { Sun, Droplets, Apple, Trees, Box, Moon, Hand, Sunrise, Shirt, Milk, Sparkles, Users, ListChecks, Package, Dices, BookOpen, LogOut };
export function RoutineIcon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  const I = MAP[name] ?? HelpCircle; return <I size={size} className={className} />;
}
