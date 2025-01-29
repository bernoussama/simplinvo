import pocketbase from "pocketbase";

// if running vite dev or vite build
const isProd = import.meta.env.MODE === "production";

const baseURL = isProd ? "/" : "http://localhost:8090/";

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
