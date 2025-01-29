import pocketbase from "pocketbase";
const isProd = import.meta.env.PROD;
// const apiUrl = isProd
//   ? import.meta.env.VITE_PB_API_URL
//   : "http://127.0.0.1:8090";

const apiUrl = isProd
  ? typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}${
        window.location.port ? `:${window.location.port}` : ""
      }`
    : "http://127.0.0.1:8090"
  : "http://127.0.0.1:8090";
const baseURL = apiUrl;
console.log("baseURL: ", baseURL);
export const pb = new pocketbase(baseURL);

export const currentUser = pb.authStore.record;
export function getCurrentUser() {
  return pb.authStore.record;
}

export function isLoggedIn() {
  return pb.authStore.record !== null && pb.authStore.isValid;
}

export const fetchHeaderImage = async (companyId: string) => {
  const record = await pb.collection("companies").getOne(companyId);
  const headerFilename = record.header;
  const url = pb.files.getURL(record, headerFilename, {
    thumb: "100x250",
  });
  return url;
};

export const fetchStampImage = async (companyId: string) => {
  const record = await pb.collection("companies").getOne(companyId);
  const headerFilename = record.stamp;
  const url = pb.files.getURL(record, headerFilename, {
    thumb: "100x250",
  });
  return url;
};
