/** Shown at once when the collection is opened from another page, while its data arrives. */
export default function CollectionLoading() {
  const block = { background: "rgba(43,24,7,0.07)" };

  return (
    <div className="min-h-screen pb-16" style={{ background: "#fbf7f2" }} aria-busy="true" aria-label="Loading collection">
      <div className="pt-8 px-4 flex justify-center gap-6 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full animate-pulse" style={block} />
            <div className="w-12 h-3 rounded animate-pulse" style={block} />
          </div>
        ))}
      </div>
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="w-40 h-3 rounded animate-pulse" style={block} />
        <div className="mt-4 w-72 max-w-full h-10 rounded animate-pulse" style={block} />
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="col-span-2 row-span-2 aspect-square md:aspect-auto rounded-md animate-pulse" style={block} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-md animate-pulse" style={block} />
          ))}
        </div>
      </div>
    </div>
  );
}
