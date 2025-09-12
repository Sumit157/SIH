
'use server';

import { firebaseConfig } from '@/lib/firebase';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { z } from 'zod';

function getFirebaseApp() {
    if (getApps().length) {
        return getApp();
    }
    return initializeApp(firebaseConfig);
}

const emailSchema = z.string().email({ message: "Invalid email address." });
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters long." });

export async function signup(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const emailValidation = emailSchema.safeParse(email);
  if (!emailValidation.success) {
    return { message: emailValidation.error.errors[0].message };
  }

  const passwordValidation = passwordSchema.safeParse(password);
  if (!passwordValidation.success) {
    return { message: passwordValidation.error.errors[0].message };
  }

  try {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    await createUserWithEmailAndPassword(auth, email, password);
    return { message: "User registered successfully!", success: true };
  } catch (e: any) {
    // It's better to return a generic error message to the user
    // and log the specific error on the server for security.
    console.error(e);
    if (e.code === 'auth/email-already-in-use') {
        return { message: 'This email is already in use.' };
    }
    return { message: 'An unexpected error occurred. Please try again.' };
  }
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
        return { message: emailValidation.error.errors[0].message };
    }

    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
        return { message: passwordValidation.error.errors[0].message };
    }

    try {
        const app = getFirebaseApp();
        const auth = getAuth(app);
        await signInWithEmailAndPassword(auth, email, password);
        return { message: "Logged in successfully!", success: true };
    } catch (e: any) {
        console.error(e);
        if (e.code === 'auth/invalid-credential') {
             return { message: 'Invalid email or password.' };
        }
        return { message: 'An unexpected error occurred. Please try again.' };
    }
}
