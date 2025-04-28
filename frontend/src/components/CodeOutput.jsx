export default function CodeOutput({ code }) {
  return (
    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
      <h2 className="text-lg font-semibold mb-3">Generated Code:</h2>
      <pre className="bg-white p-3 rounded-lg overflow-x-auto">{code}</pre>
    </div>
  );
}
