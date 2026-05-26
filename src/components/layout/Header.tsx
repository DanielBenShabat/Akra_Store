import { TopBar } from './TopBar';
import { MainNav } from './MainNav';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background">
      <TopBar />
      <MainNav />
    </header>
  );
}
