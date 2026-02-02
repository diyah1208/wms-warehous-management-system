// import { createMasterPart } from "./master-part";
// // import dataJSON from "@/stocks.json";
// import type { MasterPart } from "@/types";

// const PAGE_SIZE = 250;

// export async function uploadPartsByPage(page = 1): Promise<void> {
//   const start = (page - 1) * PAGE_SIZE;
//   const end = start + PAGE_SIZE;

//   const slice = dataJSON.slice(start, end);

//   console.log(`Uploading items ${start + 1} to ${end}...`);

//   for (const item of slice) {
//     const part_number = String(item["Part no"]).trim();
//     const part_name = String(item["Part Name"]).trim();
//     const part_satuan = String(item["Satuan"]).trim();

//     if (!part_number || !part_name || !part_satuan) {
//       console.warn(`Skipped part due to missing fields:`, item);
//       continue;
//     }

//     const masterPart: MasterPart = {
//       part_number,
//       part_name,
//       part_satuan,
//       created_at: new Date().toISOString(),
//       updated_at: new Date().toISOString(),
//     };

//     try {
//       const success = await createMasterPart(masterPart);
//       if (success) {
//         console.log(`✅ Uploaded: ${part_number}`);
//       } else {
//         console.log(`⚠️ Duplicate skipped: ${part_number}`);
//       }

//       // opsional delay (misalnya 20ms) biar gak limit Firestore
//       // await sleep(20);
//     } catch (error) {
//       console.error(`❌ Error for ${part_number}:`, error);
//     }
//   }

//   console.log(`✅ Done uploading page ${page}`);
// }
