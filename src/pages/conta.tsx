import { useEffect, useState } from 'react'
import { auth, db } from '../lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged, User } from 'firebase/auth'
import Head from 'next/head'
import styles from '../styles/perfil.module.css'
import Link from 'next/link'
import Image from 'next/image'

export default function ContaPage() {
  const [usuario, setUsuario] = useState<User | null>(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [serie, setSerie] = useState('')
  const [bio, setBio] = useState('')
  const [avatarURL, setAvatarURL] = useState('/avatar-default.png')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUsuario(user)
      if (user) {
        const docRef = doc(db, 'usuarios', user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const dados = docSnap.data()
          setNome(dados.nome || user.displayName || 'Usuário')
          setEmail(dados.email || user.email || '')
          setSerie(dados.serie || '')
          setBio(dados.bio || '')
          setAvatarURL(dados.avatar || '/avatar-default.png')
        }
      }
    })
    return () => unsubscribe()
  }, [])

  return (
    <>
      <Head>
        <title>Meu Perfil</title>
      </Head>

      <div className={styles.container}>
        <Link href="/inicial" className={styles.voltar}>← Voltar</Link>
        <div className={styles.cardTopBar}></div>

        <div className={styles.card}>
          <Image
            src={avatarURL}
            alt="Avatar"
            className={styles.avatar}
            width = {80}
            height = {80}
          />

          <h2 className={styles.nome}>{nome}</h2>
          <p className={styles.serie}>{serie}</p>
          <p className={styles.bio}>“{bio}”</p>
          <p className={styles.email}>📧 {email}</p>

          <div className={styles.actions}>
            <Link href="/editor" className={styles.button}>✏️ Corretor</Link>
            <Link href="/redacoes" className={styles.button}>📚 Minhas Redações</Link>
            <Link href="/editar-perfil" className={styles.link}>Editar Perfil</Link>
          </div>
        </div>
      </div>
    </>
  )
}
