import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyBm2JINp1nlqhbSvHHn_DU5rEbOQdj22o8',
  authDomain: 'correcao-redacao.firebaseapp.com',
  projectId: 'correcao-redacao-26849',
  storageBucket: 'correcao-redacao.appspot.com',
  messagingSenderId: '420801511416',
  appId: '1:420801511416:web:0c8f1b2d3e4f5g6h7i8j9k',
}

const app = initializeApp(firebaseConfig)

// Exportando as instâncias do Firebase
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage()
