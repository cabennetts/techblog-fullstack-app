// import firebase from 'firebase/compat/app'
// import 'firebase/compat/auth';
// import 'firebase/compat/firestore';
// import 'firebase/compat/storage';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, where, getDocs, doc, query, limit } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCqlUGk0_gAon2MyCuHVds6hzIR3UxzpMk",
  authDomain: "techblog-b8874.firebaseapp.com",
  projectId: "techblog-b8874",
  storageBucket: "techblog-b8874.appspot.com",
  messagingSenderId: "99358426330",
  appId: "1:99358426330:web:0e1322412cabb586efd1e3",
  measurementId: "G-RYTKJS26RP"
};

// if (!firebase.apps.length) {
//     firebase.initializeApp(firebaseConfig)
// }
function createFirebaseApp(firebaseConfig) {
  try {
    return getApp();
  } catch {
    return initializeApp(firebaseConfig);
  }
}

const firebaseApp = createFirebaseApp(firebaseConfig);
// Auth exports
// export const auth = firebase.auth();
export const auth = getAuth(firebaseApp);
export const googleAuthProvider = new GoogleAuthProvider();

// export const auth = firebase.auth();
// export const googleAuthProvider = new firebase.auth.GoogleAuthProvider()

// export const firestore = firebase.firestore();
export const firestore = getFirestore(firebaseApp);

// Storage exports
// export const storage = firebase.storage();
export const storage = getStorage(firebaseApp);
export const STATE_CHANGED = 'state_changed';

// export const fromMillis = firebaseApp.firestore.Timestamp.fromMillis
// export const serverTimestamp = firebaseApp.firestore.FieldValue.serverTimestamp;

/**
 * Gets a users/{uid} document with username
 * @param {string} username 
 * @returns data from user
 */
export async function getUserWithUsername(username) {
  // const usersRef = firestore.collection('users')
  // const query = usersRef.where('username', '==', username).limit(1)
  const q = query(
    collection(firestore, 'users'), 
    where('username', '==', username),
    limit(1)
  )
  // const userDoc = (await query.get()).docs[0]
  const userDoc = (await getDocs(q)).docs[0];
  return userDoc
}

/**
 * Gets a posts/{slug} document with post slug 
 * @param {string} slug 
 * @returns 
 */
export async function getPostWithSlug(slug) {
  const q = query(
    collection(firestore, 'posts'),
    where('slug', '==', slug),
    limit(1)
  )
  const postDoc = (await getDocs(q)).docs[0]
  return postDoc
}
/**
 * Converts a firestore document to JSON
 * @param {DocumentSnapshot} doc 
 * @returns 
 */
export function postToJSON(doc) {
  const data = doc.data()
  return {
    ...data,
    createdAt: data?.createdAt.toMillis() || 0,
    updatedAt: data?.updatedAt.toMillis() || 0,
  }
}

