import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-lg gap-3 px-4 py-20 text-center">
      <p className="eyebrow">Not found</p>
      <h1 className="font-serif text-3xl font-semibold">That page isn't here</h1>
      <p className="text-muted">The problem or module may have been renamed.</p>
      <Link href="/library" className="font-medium text-accent hover:underline">
        Browse the guesstimate library
      </Link>
    </div>
  );
}
