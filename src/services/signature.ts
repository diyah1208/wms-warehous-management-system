import api from "@/lib/axios";
export async function saveSignature(kode: string, signatureBase64: string) {
  try {
    const response = await api.post(`/mr/sign/${kode}`, {
      signature: signatureBase64,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error saving signature:", error);
    throw error.response?.data || error;
  }
}

export async function saveSignaturePR(kode: string, signatureBase64: string) {
  try {
    const response = await api.post(`/pr/sign/${kode}`, {
      signature: signatureBase64,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error saving signature:", error);
    throw error.response?.data || error;
  }
}