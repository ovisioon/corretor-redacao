import { useEffect, useState, useRef } from 'react'
import { auth, db } from '../lib/firebase'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'
import { onAuthStateChanged, User } from 'firebase/auth'
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import styles from '../styles/redagram.module.css'

type Comentario = {
  autor: string
  avatar: string
  texto: string
  likes?: string[]
}

type Post = {
  id: string
  autor: string
  avatar: string
  texto: string
  criadoEm: any
  likes: string[]
  comentarios: Comentario[]
  imagemURL?: string
}

export default function RedagramPage() {
  const [usuario, setUsuario] = useState<User | null>(null)
  const [nome, setNome] = useState('')
  const [avatar, setAvatar] = useState('/avatar-default.png')
  const [texto, setTexto] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewURL, setPreviewURL] = useState<string>('')
  const [posts, setPosts] = useState<Post[]>([])
  const [comentariosAbertos, setComentariosAbertos] = useState<{ [id: string]: boolean }>({})
  const [novoComentarioTexto, setNovoComentarioTexto] = useState<{ [id: string]: string }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. Autenticação e perfil do usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUsuario(user)
      if (user) {
        const uSnap = await getDoc(doc(db, 'usuarios', user.uid))
        if (uSnap.exists()) {
          const data = uSnap.data()
          setNome(data.nome || user.displayName || 'Usuário')
          setAvatar(data.avatar || '/avatar-default.png')
        }
      }
    })
    return () => unsubscribe()
  }, [])

  // 2. Inscrição em posts em tempo real (com defaults para likes/comentarios)
  useEffect(() => {
    const ref = collection(db, 'redagram')
    const q = query(ref, orderBy('criadoEm', 'desc'))
    const unsubscribe = onSnapshot(q, snapshot => {
      const lista = snapshot.docs.map(docSnap => {
        const data = docSnap.data() as Omit<Post, 'id'>
        return {
          id: docSnap.id,
          autor: data.autor,
          avatar: data.avatar,
          texto: data.texto,
          criadoEm: data.criadoEm,
          likes: data.likes ?? [],
          comentarios: data.comentarios ?? [],
          imagemURL: data.imagemURL ?? ''
        } as Post
      })
      setPosts(lista)
    })
    return () => unsubscribe()
  }, [])

  // 3. Captura de arquivo e preview
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      const url = URL.createObjectURL(selected)
      setPreviewURL(url)
    }
  }

  // Limpar preview e input
  function clearFile() {
    setFile(null)
    setPreviewURL('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // 4. Enviar novo post (texto e/ou imagem)
  async function postar(e: React.FormEvent) {
    e.preventDefault()
    // exigir texto ou imagem
    if (!usuario || (texto.trim() === '' && !file)) return

    // dados do usuário
    const uSnap = await getDoc(doc(db, 'usuarios', usuario.uid))
    const data = uSnap.exists() ? uSnap.data() : {}
    const nomeFinal = data.nome || usuario.displayName || 'Usuário'
    const avatarFinal = data.avatar || '/avatar-default.png'

    // upload de imagem (se existir)
    let imagemURL = ''
    if (file) {
      const storage = getStorage()
      const path = `posts/${usuario.uid}/${Date.now()}_${file.name}`
      const imgRef = storageRef(storage, path)
      const uploadTask = uploadBytesResumable(imgRef, file)
      await new Promise<void>((resolve, reject) =>
        uploadTask.on(
          'state_changed',
          () => {},
          (err) => reject(err),
          () => resolve()
        )
      )
      imagemURL = await getDownloadURL(uploadTask.snapshot.ref)
    }

    // salvar post no Firestore
    await addDoc(collection(db, 'redagram'), {
      autor: nomeFinal,
      avatar: avatarFinal,
      texto: texto.trim(),
      criadoEm: serverTimestamp(),
      likes: [] as string[],
      comentarios: [] as Comentario[],
      imagemURL
    })

    // limpar campos
    setTexto('')
    clearFile()
  }

  // 5. Toggle seção de comentários
  function toggleComentarios(id: string) {
    setComentariosAbertos(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <>
      <Head>
        <title>Redagram</title>
      </Head>

      <div className={styles.container}>
        <Link href="/inicial" className={styles.voltar}>
          ← Voltar
        </Link>

        {/* Form de novo post */}
        <form onSubmit={postar} className={styles.postBox}>
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            className={styles.input}
            placeholder="Compartilhe uma frase, pensamento ou conquista..."
            rows={3}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.fileInput}
          />

          {/* Preview de imagem */}
          {previewURL && (
            <div className={styles.previewWrapper}>
              <Image
                src={previewURL}
                alt="Preview"
                width={200}
                height={150}
                className={styles.previewImage}
              />
              <button type="button" onClick={clearFile} className={styles.clearButton}>
                Remover
              </button>
            </div>
          )}

          <button type="submit" className={styles.button}>
            Publicar
          </button>
        </form>

        {/* Feed de posts */}
        <div className={styles.feed}>
          {posts.map(post => {
            const jaCurtiuPost = usuario
              ? post.likes.includes(usuario.uid)
              : false

            return (
              <div key={post.id} className={styles.card}>
                {/* Cabeçalho do post */}
                <div className={styles.postHeader}>
                  <Image
                    src={post.avatar}
                    alt="Avatar do autor"
                    width={40}
                    height={40}
                    className={styles.avatar}
                  />
                  <strong>{post.autor}</strong>
                </div>

                {/* Texto do post */}
                {post.texto && <p className={styles.texto}>{post.texto}</p>}

                {/* Imagem do post (se houver) */}
                {post.imagemURL && (
                  <div className={styles.imageWrapper}>
                    <Image
                      src={post.imagemURL}
                      alt="Imagem do post"
                      width={400}
                      height={300}
                      className={styles.postImage}
                    />
                  </div>
                )}

                {/* Ações: curtir, comentários, apagar */}
                <div className={styles.actions}>
                  {post.autor === nome && (
                    <button
                      onClick={async () => {
                        if (!confirm('Apagar este post?')) return
                        await deleteDoc(doc(db, 'redagram', post.id))
                      }}
                      className={styles.deleteButton}
                    >
                      🗑️
                    </button>
                  )}

                  <button
                    disabled={jaCurtiuPost}
                    onClick={async () => {
                      if (!usuario || jaCurtiuPost) return
                      const postRef = doc(db, 'redagram', post.id)
                      await updateDoc(postRef, {
                        likes: [...post.likes, usuario.uid]
                      })
                    }}
                    className={styles.likeButton}
                  >
                    ❤️ {post.likes.length}
                  </button>

                  <button
                    onClick={() => toggleComentarios(post.id)}
                    className={styles.comentarButton}
                  >
                    {comentariosAbertos[post.id]
                      ? 'Fechar comentários'
                      : '💬 Ver comentários'}
                  </button>
                </div>

                {/* Preview do último comentário */}
                {!comentariosAbertos[post.id] &&
                  post.comentarios.length > 0 && (
                  <div className={styles.ultimoComentarioBox}>
                    <Image
                      src={post.comentarios.at(-1)!.avatar}
                      alt="avatar"
                      width={32}
                      height={32}
                      className={styles.comentarioAvatar}
                    />
                    <strong>{post.comentarios.at(-1)!.autor}</strong>{' '}
                    {post.comentarios.at(-1)!.texto}
                  </div>
                )}

                {/* Lista completa de comentários */}
                {comentariosAbertos[post.id] && (
                  <div className={styles.comentarios}>
                    {post.comentarios.map((comentario, index) => {
                      const jaCurtiuComent =
                        usuario !== null &&
                        comentario.likes?.includes(usuario.uid)

                      const ehSeu = comentario.autor === nome

                      return (
                        <div key={index} className={styles.comentario}>
                          <Image
                            src={comentario.avatar}
                            alt="avatar"
                            width={32}
                            height={32}
                            className={styles.comentarioAvatar}
                          />
                          <div>
                            <strong>{comentario.autor}</strong>{' '}
                            {comentario.texto}
                            <div className={styles.comentarioActions}>
                              <button
                                disabled={!!jaCurtiuComent}
                                onClick={async () => {
                                  if (!usuario || jaCurtiuComent) return
                                  const novos = post.comentarios.map((c, i) =>
                                    i === index
                                      ? {
                                          ...c,
                                          likes: [...(c.likes || []), usuario.uid]
                                        }
                                      : c
                                  )
                                  const postRef = doc(db, 'redagram', post.id)
                                  await updateDoc(postRef, {
                                    comentarios: novos
                                  })
                                }}
                                className={styles.likeButton}
                              >
                                👍 {comentario.likes?.length || 0}
                              </button>

                              {ehSeu && (
                                <button
                                  onClick={async () => {
                                    if (!confirm('Apagar este comentário?'))
                                      return
                                    const filtrados = post.comentarios.filter(
                                      (_, i) => i !== index
                                    )
                                    const postRef = doc(
                                      db,
                                      'redagram',
                                      post.id
                                    )
                                    await updateDoc(postRef, {
                                      comentarios: filtrados
                                    })
                                  }}
                                  className={styles.deleteButton}
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Formulário de novo comentário */}
                    <form
                      onSubmit={async e => {
                        e.preventDefault()
                        const txt = novoComentarioTexto[post.id]?.trim()
                        if (!txt) return
                        const novo: Comentario = {
                          autor: nome,
                          avatar,
                          texto: txt,
                          likes: []
                        }
                        const postRef = doc(db, 'redagram', post.id)
                        await updateDoc(postRef, {
                          comentarios: [...post.comentarios, novo]
                        })
                        setNovoComentarioTexto(prev => ({
                          ...prev,
                          [post.id]: ''
                        }))
                      }}
                      className={styles.comentarioForm}
                    >
                      <textarea
                        rows={2}
                        className={styles.input}
                        placeholder="Escreva um comentário..."
                        value={novoComentarioTexto[post.id] || ''}
                        onChange={e =>
                          setNovoComentarioTexto(prev => ({
                            ...prev,
                            [post.id]: e.target.value
                          }))
                        }
                      />
                      <button type="submit" className={styles.button}>
                        Enviar
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
