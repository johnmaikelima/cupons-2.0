export default function LoadingPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="h-96 flex items-center justify-center">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
