import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './config';

export function firebaseSignIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function firebaseSignUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function firebaseSignOut() {
  return signOut(auth);
}

export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}
