import Link from 'next/link';

export default function Breadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: { label: string; href: string; active?: boolean }[];
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((crumb, idx) => (
          <li key={idx}>
            <Link
              href={crumb.href}
              className={`${
                crumb.active
                  ? 'font-semibold text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {crumb.label}
            </Link>
            {idx < breadcrumbs.length - 1 && (
              <span className="mx-2 text-gray-400">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
