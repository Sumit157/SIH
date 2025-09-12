import Link from 'next/link';
import { Logo } from '@/components/icons/logo';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-bold text-lg">Gau Gyan</span>
        </Link>
      </div>
    </header>
  );
}
