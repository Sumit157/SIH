
'use server';

import { firebaseConfig } from '@/lib/firebase';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { z } from 'zod';

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
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
    const auth = getAuth(app);
    await createUserWithEmailAndPassword(auth, email, password);
    return { message: "User registered successfully!", success: true };
  } catch (e: any) {
    return { message: e.message };
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
        const auth = getAuth(app);
        await signInWithEmailAndPassword(auth, email, password);
        return { message: "Logged in successfully!", success: true };
    } catch (e: any) {
        return { message: e.message };
    }
}
