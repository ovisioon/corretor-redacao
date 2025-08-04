import { useState, useEffect } from 'react'
import { auth, db } from '../lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged, User } from 'firebase/auth'
import Head from 'next/head'
import styles from '../styles/editar.module.css'
import Link from 'next/link'
import Image from 'next/image'

export default function EditarPerfil() {
  const [usuario, setUsuario] = useState<User | null>(null)
  const [nome, setNome] = useState('')
  const [serie, setSerie] = useState('')
  const [bio, setBio] = useState('')
  const [avatarURL, setAvatarURL] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user)
        const docRef = doc(db, 'usuarios', user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const dados = docSnap.data()
          setNome(dados.nome || '')
          setSerie(dados.serie || '')
          setBio(dados.bio || '')
          setAvatarURL(dados.avatar || '')
        }
      }
    })
    return () => unsubscribe()
  }, [])

  async function salvarDados(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!usuario) return

    try {
      const docRef = doc(db, 'usuarios', usuario.uid)
      await updateDoc(docRef, {
        nome,
        serie,
        bio,
        avatar: avatarURL,
        atualizadoEm: new Date()
      })

      alert('Perfil atualizado com sucesso!')
    } catch (err) {
      console.error('Erro ao salvar perfil:', err)
      alert('Erro ao salvar. Veja o console.')
    }
  }

  return (
    <>
      <Head>
        <title>Editar Perfil</title>
      </Head>

      <div className={styles.container}>
        <Link href="/conta" className={styles.voltar}>← Voltar</Link>

        <form className={styles.formBox} onSubmit={salvarDados}>
          <h2 className={styles.title}>Editar Perfil</h2>

          <Image src={avatarURL || '/avatar-default.png'} alt="Avatar" className={styles.avatarPreview} width={80} height={80}/>

          <input
            type="text"
            value={avatarURL}
            onChange={(e) => setAvatarURL(e.target.value)}
            className={styles.input}
            placeholder="URL da imagem do avatar"
          />

          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={styles.input}
            placeholder="Nome"
            required
          />

          <select
            value={serie}
            onChange={(e) => setSerie(e.target.value)}
            className={styles.input}
          >
            <option value="">Selecione sua série</option>
            <option value="1º ano">1º ano</option>
            <option value="2º ano">2º ano</option>
            <option value="3º ano">3º ano</option>
          </select>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={styles.textarea}
            placeholder="Bio ou frase de perfil"
            rows={3}
          />

          <button type="submit" className={styles.button}>Salvar</button>
        </form>
      </div>
    </>
  )
}
