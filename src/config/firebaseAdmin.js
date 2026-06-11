import admin from "firebase-admin";

let firebaseReady = false;

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
      firebaseReady = true;
    } catch (err) {
      console.warn("Firebase Admin initialization skipped:", err.message);
    }
  } else {
    console.warn("Firebase Admin credentials not configured — Google login disabled");
  }
} else {
  firebaseReady = true;
}

export { firebaseReady };
export default admin;
