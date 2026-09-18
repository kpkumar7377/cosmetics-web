export default function ProductDetailLoading() {
  return (
    <div className="grid md:grid-cols-2 gap-8 px-6 py-8 animate-pulse">
      <div>
        <div className="w-full aspect-[4/5] rounded-2xl bg-sage" />
        <div className="flex gap-2 mt-3">
          <div className="w-16 h-16 rounded-md bg-sage" />
          <div className="w-16 h-16 rounded-md bg-sage" />
          <div className="w-16 h-16 rounded-md bg-sage" />
        </div>
      </div>

      <div>
        <div className="h-7 w-2/3 bg-sage rounded-md mb-3" />
        <div className="h-4 w-full bg-sage rounded-md mb-1.5" />
        <div className="h-4 w-4/5 bg-sage rounded-md mb-5" />

        <div className="h-6 w-24 bg-sage rounded-md mb-6" />

        <div className="flex gap-2 mb-6">
          <div className="h-9 w-16 bg-sage rounded-full" />
          <div className="h-9 w-16 bg-sage rounded-full" />
          <div className="h-9 w-16 bg-sage rounded-full" />
        </div>

        <div className="h-11 w-40 bg-sage rounded-full" />
      </div>
    </div>
  );
}
