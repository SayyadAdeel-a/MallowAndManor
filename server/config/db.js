// Delegates to shared/db.js so the Express server and the Vercel functions
// always share one mongoose instance. See the note in shared/db.js.
export { default } from '../../shared/db.js';
