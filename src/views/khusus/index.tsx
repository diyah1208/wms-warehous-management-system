// import { uploadPartsByPage } from "@/services/khusus";
// import { useState } from "react";

// export default function ImportPage() {
//   const [page, setPage] = useState<number>(1);
//   const [loading, setLoading] = useState(false);
//   const [log, setLog] = useState<string[]>([]);

//   const handleUpload = async () => {
//     setLoading(true);
//     setLog((prev) => [...prev, `🚀 Mulai upload halaman ${page}...`]);

//     try {
//       await uploadPartsByPage(page);
//       setLog((prev) => [...prev, `✅ Upload halaman ${page} selesai.`]);
//     } catch (err: any) {
//       console.error(err);
//       setLog((prev) => [...prev, `❌ Gagal upload halaman ${page}`]);
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
//       <h1 className="text-2xl font-bold mb-4">Import Master Part</h1>
//       <p className="text-gray-600 mb-6 text-center">
//         Upload data part dari JSON besar (250 item per halaman).
//       </p>

//       <div className="flex gap-2 items-center mb-4">
//         <label htmlFor="page" className="text-sm">
//           Halaman ke:
//         </label>
//         <input
//           id="page"
//           type="number"
//           min={1}
//           value={page}
//           onChange={(e) => setPage(Number(e.target.value))}
//           className="border rounded px-2 py-1 w-20 text-center"
//         />
//         <button
//           disabled={loading}
//           onClick={handleUpload}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded disabled:opacity-50"
//         >
//           {loading ? "Uploading..." : "Upload"}
//         </button>
//       </div>

//       {log.length > 0 && (
//         <div className="w-full max-w-md bg-gray-100 rounded p-4 text-sm font-mono">
//           {log.map((line, i) => (
//             <div key={i}>{line}</div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
