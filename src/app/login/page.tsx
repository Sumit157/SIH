
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginUser, createSessionCookie } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="animate-spin mr-2" />}
      Login
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginUser, null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state?.success && state.customToken) {
      const handleLogin = async () => {
        try {
          const userCredential = await signInWithCustomToken(auth, state.customToken!);
          const idToken = await userCredential.user.getIdToken();
          await createSessionCookie(idToken);
          
          toast({
            title: 'Login Successful',
            description: 'Welcome back!',
          });
          router.push('/');
          router.refresh();
        } catch (error) {
          console.error("Firebase sign in error", error);
          toast({
            variant: "destructive",
            title: 'Login Failed',
            description: 'Could not complete sign in process.',
          });
        }
      }
      handleLogin();
    }
  }, [state, toast, router]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
             {state?.message && !state.success && (
                <Alert variant="destructive">
                    <AlertTriangle/>
                    <AlertTitle>Login Failed</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
