import axios from "axios";

export const apiPublic = axios.create({
  //baseURL:  "http://localhost:8000",
  //baseURL: "https://wms-lourdes.my.id/be-wms/public/api",
  baseURL: "http://10.10.6.37:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
export default apiPublic;

