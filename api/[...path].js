// The canonical implementation lives with the frontend so it can be deployed
// both from this repository root and from a Vercel project rooted at `frontend`.
export { default } from '../frontend/api/[...path].js';
