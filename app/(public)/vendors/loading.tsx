/** Shown at once when the vendors page is opened from another page, while its data arrives. */
export default function VendorsLoading() {
  const block = { background: "rgba(43,24,7,0.07)" };

  return (
    <div className="min-h-screen pb-20" style={{ background: "#fbf7f2" }} aria-busy="true" aria-label="Loading vendors">
      <div className="max-w-6xl mx-auto px-4 pt-10">
        <div className="mx-auto w-32 h-3 rounded animate-pulse" style={block} />
        <div className="mx-auto mt-4 w-72 max-w-full h-10 rounded animate-pulse" style={block} />
        <div className="mt-10 flex justify-center gap-7 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-10 h-10 rounded-full animate-pulse" style={block} />
              <div className="w-12 h-3 rounded animate-pulse" style={block} />
            </div>
          ))}
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-9">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-square animate-pulse" style={block} />
              <div className="mt-3 w-2/3 h-4 rounded animate-pulse" style={block} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
