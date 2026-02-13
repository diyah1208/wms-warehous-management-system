// // import axios from "axios";

// // const api = axios.create({
// //   // baseURL: "http://localhost:8000/api",
// //   baseURL: "http://10.10.6.207:8000/api",
// //   headers: {
// //     "Content-Type": "application/json",
// //     Accept: "application/json",
// //   },
// // });

// // /* ===============================
// //    REQUEST: kirim token (jika ada)
// // ================================ */
// // api.interceptors.request.use((config) => {
// //   const token = localStorage.getItem("token");
// //   if (token) {
// //     config.headers.Authorization = `Bearer ${token}`;
// //   }
// //   return config;
// // });

// // /* ===============================
// //    RESPONSE: auto logout (AMAN)
// // ================================ */
// // const PUBLIC_ROUTES = [
// //   "/login",
// //   "/register",
// //   "/forgot-password",
// // ];

// // api.interceptors.response.use(
// //   (res) => res,
// //   (err) => {
// //     const is401 = err.response?.status === 401;
// //     const currentPath = window.location.pathname;

// //     const isPublicRoute = PUBLIC_ROUTES.some((path) =>
// //       currentPath.startsWith(path)
// //     );

// //     if (is401 && !isPublicRoute) {
// //       localStorage.removeItem("token");
// //       window.location.href = "/login";
// //     }

// //     return Promise.reject(err);
// //   }
// // );

// // export default api;

// import axios from "axios";

// const api = axios.create({
//   // baseURL: "http://localhost:8000/api",
//   baseURL: "http://10.10.6.207:8000/api",
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });

// /* ===============================
//    REQUEST: kirim token (jika ada)
// ================================ */
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// /* ===============================
//    RESPONSE: auto logout (AMAN)
// ================================ */
// const PUBLIC_ROUTES = [
//   "/login",
//   "/register",
//   "/forgot-password",
// ];

// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     const is401 = err.response?.status === 401;
//     const currentPath = window.location.pathname;

//     const isPublicRoute = PUBLIC_ROUTES.some((path) =>
//       currentPath.startsWith(path)
//     );

//     if (is401 && !isPublicRoute) {
//       localStorage.removeItem("token");
//       window.location.href = "/login";
//     }

//     return Promise.reject(err);
//   }
// );

// export default api;

import axios from "axios";

const api = axios.create({
  //baseURL: "https://wms-lourdes.my.id/be-wms/public/api",
  //baseURL: "http://localhost:8000/api",
  baseURL: "http://10.10.6.37:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ===============================
   REQUEST: kirim token
================================ */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ===============================
   RESPONSE: auto logout
================================ */
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
];

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const is401 = err.response?.status === 401;
    const currentPath = window.location.pathname;

    const isPublicRoute = PUBLIC_ROUTES.some((path) =>
      currentPath.startsWith(path)
    );

    if (is401 && !isPublicRoute) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default api;
