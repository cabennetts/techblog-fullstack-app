import styles from '../../styles/Post.module.css'
import PostContent from '../../components/PostContent'
import { UserContext } from '../../lib/context'
import { firestore, getUserWithUsername, postToJSON, getPostWithSlug } from '../../lib/firebase'
import { doc, getDocs, getDoc, collectionGroup, query, limit, getFirestore } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useContext } from 'react';
import HeartButton from '../../components/HeartButton'
import AuthCheck from '../../components/AuthCheck'

export async function getStaticProps({ params }) {
    const { username, slug } = params
    // console.log(username)
    const userDoc = await getUserWithUsername(username)
    let post
    let path

    if (userDoc) {
        // const postRef = userDoc.ref.collection('posts').doc(slug)
        const postRef = doc(getFirestore(), userDoc.ref.path, 'posts', slug)
        // post = postToJSON(await postRef.get())
        post = postToJSON(await getDoc(postRef))
        // console.log(post)
        path = postRef.path
    } else {
      throw new Error(`Failed to fetch posts, received status ${res.status}`)
    }

    return {
        props: { post, path },
        revalidate: 500
    }
}

export async function getStaticPaths() {
    const q = query(
        collectionGroup(getFirestore(), 'posts'),
        limit(20)
    )
    // const snapshot = await firestore.collectionGroup('posts').get()
    const snapshot = await getDocs(q)
    // map all posts to an object that match the username and slug respectively
    const paths = snapshot.docs.map((doc) => {
        const { slug, username } = doc.data()
        return {
            params: { username, slug },
            // params: { username: username, slug: slug },
        }
    })
    return {
        paths,
        fallback: 'blocking',
    }
}

export default function Post(props) {
    // const postRef = firestore.doc(props.path)
    const postRef = doc(getFirestore(), props.path)
    const [realtimePost] = useDocumentData(postRef)
    // const postRef = firestore.collection('users').doc(auth.currentUser.uid).collection('posts').doc(slug);
    // const [post] = useDocumentData(postRef);
    const post = realtimePost || props.post    
    const { user: currentUser } = useContext(UserContext)
   
    return (
        <main className={styles.container}>
            {/* <Metatags title={post.title} description={post.title} /> */}
            
            <section>
              <PostContent post={post} />
            </section>

            <aside className="card">
              <p>
                <strong>{post.heartCount || 0} 🤍</strong>
              </p>

              <AuthCheck
                fallback={
                  <Link href="/enter">
                    <button>💗 Sign Up</button>
                  </Link>
                }>
                  <HeartButton postRef={postRef} />
              </AuthCheck>
            </aside>
        </main>
    )
}