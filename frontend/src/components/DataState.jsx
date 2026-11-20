export default function DataState({ loading, error, empty, emptyText = 'Aucune donnée', children }) {
  if (loading) return <p className="p-8 text-center">Chargement...</p>;
  if (error) return <p className="rounded-md bg-red-100 px-3 py-2 text-red-800">{error}</p>;
  if (empty) return <p className="p-8 text-center text-gray-500">{emptyText}</p>;
  return children;
}
