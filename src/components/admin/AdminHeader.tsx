import { LogOut } from 'lucide-react';
import { logoutAction } from '@/app/admin/login/actions';
import { Button } from '@/components/admin-ui/button';

export default function AdminHeader() {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-end px-6">
      <form action={logoutAction}>
        <Button variant="ghost" size="sm" type="submit" className="gap-2 text-muted-foreground">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </form>
    </header>
  );
}
