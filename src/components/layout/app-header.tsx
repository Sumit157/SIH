
'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/app/actions';
import { useUser } from '@/hooks/use-user';


export default function AppHeader() {
  const { user, loading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
      router.refresh();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during logout.';
        toast({
            variant: 'destructive',
            title: 'Logout Failed',
            description: errorMessage,
        });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-bold text-lg">Gau Gyan</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {!loading && (
            user ? (
              <>
                <p className="text-sm text-muted-foreground hidden sm:block">Welcome, {user.displayName || user.email}</p>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
}
