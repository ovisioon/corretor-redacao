import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/account.module.css'

export default function SignupPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [serie, setSerie] = useState('')
  const [bio, setBio] = useState('')
  const [aceitaTermos, setAceitaTermos] = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!aceitaTermos) return alert('Você precisa aceitar os termos de uso.')

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user

      // Atualiza nome no perfil de autenticação
      if (user && nome) {
        await updateProfile(user, {
          displayName: nome
        })
      }

      // Salva dados adicionais no Firestore
      await setDoc(doc(db, 'usuarios', user.uid), {
        nome: nome,
        email: email,
        serie: serie,
        bio: bio,
        criadoEm: new Date()
      })

      router.push('/inicial')
    } catch (error: any) {
      alert('Erro ao cadastrar: ' + error.message)
    }
  }

  return (
    <>
      <Head>
        <title>Criar Conta</title>
      </Head>

      <div className={styles.container}>
        <form className={styles.formBox} onSubmit={handleSignup}>
          <h2 className={styles.title}>Criar Conta</h2>

          <input
            type="text"
            className={styles.input}
            placeholder="Nome completo"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
          />

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

          <select
            className={styles.input}
            value={serie}
            onChange={e => setSerie(e.target.value)}
            required
          >
            <option value="">Selecione sua série</option>
            <option value="1ano">1º ano</option>
            <option value="2ano">2º ano</option>
            <option value="3ano">3º ano</option>
          </select>

          <textarea
            className={styles.textarea}
            placeholder="Frase de perfil ou bio (opcional)"
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
          />

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={aceitaTermos}
              onChange={e => setAceitaTermos(e.target.checked)}
              required
            /> Aceito os <Link href="/termos" className={styles.checkboxLink}>termos de uso</Link>
          </label>

          <button type="submit" className={styles.button}>Cadastrar</button>

          <div className={styles.linkBox}>
            <Link href="/login" className={`${styles.link} ${styles.buttonLink}`}>Já tenho conta</Link>
          </div>
        </form>
      </div>
    </>
  )
}
