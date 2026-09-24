# Firebase setup for push notifications and gallery filters

The gallery filters work after deploying the site. Push notifications need Firebase Console setup and deployment.

## Browser notifications

1. In Firebase Console, create a Web Push key under Project Settings → Cloud Messaging → Web Push certificates.
2. Put the public key into `firebaseVapidKey` in `firebase-config.js`.
3. Use HTTPS, enable the Firebase Cloud Messaging APIs if prompted, and deploy the Firestore rules and Cloud Function:

   ```powershell
   firebase use janani-sangsad-31248
   firebase deploy --only firestore:rules,functions
   ```

4. Visitors can opt in under Notices. In Admin → Notices, select Yes to send an urgent notice. In Admin → Schedule, select Yes on a new or changed schedule entry to notify subscribers.

Cloud Functions deployment requires the Firebase Blaze plan. Set budget alerts before deploying.

## Gallery filters

For each new or edited photo, select its year and occasion in Admin → Gallery. The public gallery then filters by those fields. Older photos without tags remain visible under the all-years and all-occasions filters; edit them to make them appear in specific filters.
