export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <div className="mt-4 text-center text-gray-400">Loading...</div>
      </div>
    </div>
  )
}
