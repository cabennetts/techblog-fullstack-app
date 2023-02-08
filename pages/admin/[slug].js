import styles from '../../styles/Admin.module.css';
import AuthCheck from '../../components/AuthCheck';
import { firestore, auth } from '../../lib/firebase';
import ImageUploader from '../../components/ImageUploader';
import { serverTimestamp, doc, deleteDoc, updateDoc, getFirestore } from 'firebase/firestore';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useDocumentData, useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminPostEdit(props) {
  return (
    <AuthCheck>
        <PostManager />
    </AuthCheck>
  );
}

/**
 * Fetch document from firestore
 * @returns 
 */
function PostManager() {
  const [preview, setPreview] = useState(false);
  // use router to grab slug from url parameters, giving us document id
  const router = useRouter();
  const { slug } = router.query;

  // const postRef = firestore.collection('users').doc(auth.currentUser.uid).collection('posts').doc(slug);
  // reference path to entire post document 
  const postRef = doc(getFirestore(), 'users', auth.currentUser.uid, 'posts', slug)
  // listen to post in realtime
  const [post] = useDocumentData(postRef);

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>

            <PostForm postRef={postRef} defaultValues={post} preview={preview} />
          </section>

          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button className="btn-blue">Live view</button>
            </Link>
            <DeletePostButton postRef={postRef} />
          </aside>
        </>
      )}
    </main>
  );
}

/**
 * 
 * @param {*} defaultValues - data from firestore document
 * @param {} postRef
 * @param {} preview 
 * @returns 
 */
function PostForm({ defaultValues, postRef, preview }) {
  // useForm will connect our html form to react using '@react-hook-form'
  const { register, handleSubmit, formState, reset, watch, formState: { errors } } = useForm({ defaultValues, mode: 'onChange' });
  const { isValid, isDirty } = formState;

  const updatePost = async ({ content, published }) => {
    await updateDoc(postRef, {
      content,
      published,
      updatedAt: serverTimestamp(),
    });

    reset({ content, published });
    toast.success('Post updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {/* If in preview mode, watch content of form and render with react markdown */}
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch('content')}</ReactMarkdown>
        </div>
      )}
      {/* If not in preview mode, show the controls of form */}
      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />

        <textarea 
          name='content'
          id='content'
          aria-invalid={errors.content ? "true" : "false"}
          {...register('content',
          { maxLength: { value: 20000, message: 'content is too long' },
            minLength: { value: 10, message: 'content is too short' },
            required: { value: true, message: 'content is required' }}
          )} ></textarea>

        {errors.content && <p className="text-danger">{errors.content.message}</p>}
        
        {/* publish checkbox */}
        <fieldset>
          {/* <input className={styles.checkbox} name="published" type="checkbox" ref={register} /> */}
          <input 
            className={styles.checkbox} 
            name="published" 
            type="checkbox" 
            {...register('published')} />
          <label>Published</label>
        </fieldset>
          
        <button type="submit" className="btn-green" disabled={!isDirty || !isValid}>
          Save Changes
        </button>
      </div>
    </form>
  );
}
/**
 * 
 * @param {*} postRef - reference to post 
 * @returns 
 */
function DeletePostButton({ postRef }) {
  const router = useRouter();

  const deletePost = async () => {
    const doIt = confirm('are you sure!');
    if (doIt) {
      await deleteDoc(postRef);
      router.push('/admin');
      toast('post annihilated ', { icon: '🗑️' });
    }
  };
  return (
    <button className="btn-red" onClick={deletePost}>
      Delete
    </button>
  );
}