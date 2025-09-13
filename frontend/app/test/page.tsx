export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-olive-400 mb-4">Tailwind Test</h1>
      <div className="bg-olive-500/20 p-4 rounded-lg border border-olive-500/30">
        <p className="text-white">If you can see this styled content, Tailwind is working!</p>
        <button className="mt-4 px-4 py-2 bg-olive-500 text-white rounded hover:bg-olive-600 transition-colors">
          Test Button
        </button>
      </div>
    </div>
  )
}
