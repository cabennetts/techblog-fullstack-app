import Link from 'next/link'
import { useContext } from 'react'
import { UserContext } from '../lib/context'
import { useRouter } from 'next/router';
import { auth } from '../lib/firebase'
import { signOut } from 'firebase/auth'

export default function Navbar() {
    
    const { user, username } = useContext(UserContext)
    const router = useRouter();

    const signOutNow = () => {
        signOut(auth);
        router.reload();
    }
    
    return (
        <nav className='navbar'>
            <ul> 
                <li>
                    <Link href="/">
                        <button className='btn-logo'>FEED</button>
                    </Link>
                </li>

                {username && (
                    <>
                        <li className="push-left">
                            <button onClick={signOutNow}>Sign Out</button>
                        </li>
                        <li>
                            <Link href="/admin">
                                <button className='btn-blue'>Create Post</button>
                            </Link>
                        </li>
                        <li>
                            <Link href={`/${username}`}>
                                <img src={user?.photoURL} />
                            </Link>
                        </li>
                    </>
                )}

                {!username && (
                    <li>
                        <Link href="/enter">
                            <button className='btn-blue'>Log in</button>
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    )
} 