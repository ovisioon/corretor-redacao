import Head from 'next/head'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import styles from '../styles/inicial.module.css'
import Link from 'next/link'

export default function HomePage() {
  const [usuario, setUsuario] = useState<User | null>(null)
  const [menuAberto, setMenuAberto] = useState(false)
  const [avatarURL, setAvatarURL] = useState('/avatar-default.png')
  const [nome, setNome] = useState('Usuário')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUsuario(user)

      if (user) {
        const docRef = doc(db, 'usuarios', user.uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const dados = docSnap.data()
          setAvatarURL(dados.avatar || '/avatar-default.png')
          setNome(dados.nome || user.displayName || 'Usuário')
        } else {
          setNome(user.displayName || 'Usuário')
        }
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <>
      <Head>
        <title>Projeto IA Escolar</title>
      </Head>

      <div className={styles.body}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Projeto IA Escolar</h1>

          {usuario ? (
            <div className={styles.menuHeader}>
              <div className={styles.perfil}>
                <Link href="/conta" className={styles.conta}>Minha Conta</Link>
                <span className={styles.email}>Olá, {nome}</span>
                <img
                  src={avatarURL}
                  alt="Avatar"
                  className={styles.avatar}
                  onClick={() => setMenuAberto(!menuAberto)}
                />
              </div>

              {menuAberto && (
                <div className={styles.menuContent}>
                  <button
                    className={styles.fecharMenu}
                    onClick={() => setMenuAberto(false)}
                  >
                    ✖ Fechar Menu
                  </button>

                  <Link href="/redagram">📷 Redagram</Link>
                  <Link href="/editor">✏️ Corretor</Link>
                  <Link href="/cursos">📚 Cursos</Link>
                  <Link href="/monitor">💬 Falar com Monitor</Link>
                </div>
              )}
            </div>
          ) : (
            <nav className={styles.nav}>
              <Link href="/login" className={styles.buttonLink}>Login</Link>
              <Link href="/signup" className={styles.buttonLink}>Criar Conta</Link>
            </nav>
          )}
        </header>

        {/* Seção de apresentação */}
        <section className={styles.section}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Bem-vindo!</h2>
            <p className={styles.cardText}>
              Plataforma escolar para treinar redações com Inteligência Artificial.<br />
              Corrija, aprenda e melhore como se tivesse um avaliador do ENEM do seu lado.
            </p>
          </div>
        </section>

        {/* Rodapé */}
        <footer className={styles.footer}>
          <Link href="/sobre" className={styles.footerLink}>Sobre Nós</Link> | <Link href="/contato" className={styles.footerLink}>Fale Conosco</Link>
        </footer>
      </div>
    </>
  )
}
