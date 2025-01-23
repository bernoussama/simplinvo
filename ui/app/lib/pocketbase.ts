import pocketbase from "pocketbase";

export const pb = new pocketbase("http://127.0.0.1:8090");

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