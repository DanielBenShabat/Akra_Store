'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Store, ClipboardList, Tag, Images, Sparkles, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin/inventory', label: 'Inventory', icon: LayoutGrid },
  { href: '/admin/goosebumps', label: 'Goosebumps', icon: Sparkles },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/archive', label: 'Archive', icon: Images },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-card flex flex-col">
      <div className="h-14 flex items-center px-4 border-b border-border">
        <span className="font-semibold text-sm tracking-wide">akra Admin</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Store className="h-4 w-4 shrink-0" />
          View Store
        </Link>
      </div>
    </aside>
  );
}
