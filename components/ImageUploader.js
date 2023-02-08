import { useState } from 'react';
import { auth, storage, STATE_CHANGED } from '../lib/firebase';
import Loader from './Loader';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';


// Uploads images to Firebase Storage
export default function ImageUploader() {
    // true when uploading an image to cloud
    const [uploading, setUploading] = useState(false);
    // progress will be a percentage 
    const [progress, setProgress] = useState(0);
    // available when upload is complete
    const [downloadURL, setDownloadURL] = useState(null);
  
    // Creates a Firebase Upload Task
    const uploadFile = async (e) => {
      // Get the file
      const file = Array.from(e.target.files)[0];
      const extension = file.type.split('/')[1];
  
      // Makes reference to the storage bucket location
      const fileRef = ref(storage, `uploads/${auth.currentUser.uid}/${Date.now()}.${extension}`);
      setUploading(true);
  
      // Starts the upload
      const task = uploadBytesResumable(fileRef, file)
  
      // Listen to updates to upload task
      task.on(STATE_CHANGED, (snapshot) => {
        const pct = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0);
        setProgress(pct);
      });
  
      // Get downloadURL AFTER task resolves (Note: this is not a native Promise)
      task
        .then((d) => getDownloadURL(fileRef))
        .then((url) => {
          setDownloadURL(url);
          setUploading(false);
        });
    };
  
    return (
      <div className="box">
        <Loader show={uploading} />
        {uploading && <h3>{progress}%</h3>}
  
        {!uploading && (
          <>
            <label className="btn">
              Upload Img
              <input type="file" onChange={uploadFile} accept="image/x-png,image/gif,image/jpeg" />
            </label>
          </>
        )}
  
        {downloadURL && <code className="upload-snippet">{`![alt](${downloadURL})`}</code>}
      </div>
    );
  }
  