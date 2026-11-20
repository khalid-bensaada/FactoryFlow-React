import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 w-full max-w-md">
        <h1>404</h1>
        <p>Cette page n’existe pas.</p>
        <Link className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 px-4 py-2 text-[0.95rem] text-white" to="/">
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
