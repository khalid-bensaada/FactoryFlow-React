export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="my-3 flex flex-wrap items-center gap-2">
      <button className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 px-2.5 py-1 text-sm text-white" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Précédent
      </button>
      <span>
        Page {page} / {pages}
      </span>
      <button className="inline-block cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 px-2.5 py-1 text-sm text-white" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Suivant
      </button>
    </div>
  );
}
