import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useRouter } from 'next/router'
import Head from 'next/head'
import styles from '../styles/account.module.css'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, senha)
      router.push('/inicial') // redireciona após login
    } catch (error: any) {
      alert('Erro: ' + error.message)
    }
  }

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>

      <div className={styles.container}>
        <form className={styles.formBox} onSubmit={handleLogin}>
          <h2 className={styles.title}>Login</h2>

          <input
            type="email"
            className={styles.input}
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className={styles.input}
            placeholder="Senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
          />

          <button type="submit" className={styles.button}>Entrar</button>

          <div className={styles.linkBox}>
            <Link href="/signup" className={`${styles.link} ${styles.buttonLink}`}>Criar conta</Link>
          </div>
        </form>
      </div>
    </>
  )
}
