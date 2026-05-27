import { Search, User, ChevronDown } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Placeholder } from '@/components/ui/Placeholder';
import { CartButton } from '@/components/cart/CartButton';
import { siteConfig } from '@/config/site';

export function TopBar() {
  return (
    <div className="h-topbar border-b border-border">
      <div className="site-container h-full grid grid-cols-[1fr_auto_1fr] items-center gap-4">

        {/* Left zone: Search */}
        <div className="flex items-center gap-1.5">
          <IconButton aria-label="Search" icon={<Search size={18} strokeWidth={1.5} />} className="-ml-2" />
          <span className="text-nav text-muted-foreground uppercase tracking-nav hidden sm:inline select-none">
            Search
          </span>
        </div>

        {/* Center zone: Logo mark + brand name */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 shrink-0">
            <Placeholder aspectRatio="1/1" variant="light" />
          </div>
          <span className="text-nav font-bold uppercase tracking-nav whitespace-nowrap">
            {siteConfig.brandName}
          </span>
        </div>

        {/* Right zone: Account, Cart, Currency */}
        <div className="flex items-center gap-0.5 justify-end">
          <IconButton aria-label="Account" icon={<User size={18} strokeWidth={1.5} />} />
          <CartButton />
          <span className="flex items-center gap-0.5 text-nav uppercase tracking-nav ml-2 select-none">
            {siteConfig.currency.code}
            <ChevronDown size={13} strokeWidth={1.5} aria-hidden="true" />
          </span>
        </div>

      </div>
    </div>
  );
}
