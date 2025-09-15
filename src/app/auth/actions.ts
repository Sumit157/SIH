
'use server';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { cookies } from 'next/headers';

export async function registerUser(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { message: 'Email and password are required.' };
  }

  try {
    const auth = getAuth(app);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    
    cookies().set('session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { message: 'Registration successful!', success: true };
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'auth/email-already-in-use') {
        return { message: 'This email is already registered.' };
    }
    return { message: error.message || 'An unknown registration error occurred.' };
  }
}

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { message: 'Email and password are required.' };
  }

  try {
    const auth = getAuth(app);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    cookies().set('session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    return { message: 'Login successful!', success: true };
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.code === 'auth/invalid-credential') {
        return { message: 'Incorrect email or password.' };
    }
    return { message: error.message || 'An unknown login error occurred.' };
  }
}
