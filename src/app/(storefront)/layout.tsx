import { NavProvider } from '@/components/layout/NavContext';
import { NavDrawer } from '@/components/layout/NavDrawer';
import { CartDrawer } from '@/components/cart/CartDrawer';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <NavProvider>
      <div className="max-w-[430px] mx-auto min-h-screen relative bg-background shadow-2xl flex flex-col">
        {children}
        <NavDrawer />
        <CartDrawer />
      </div>
    </NavProvider>
  );
}
