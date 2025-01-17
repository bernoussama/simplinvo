import pocketbase from "pocketbase";

export const pb = new pocketbase("http://127.0.0.1:8090");

export const currentUser = pb.authStore.record;
export function getCurrentUser() {
  return pb.authStore.record;
}

export function isLoggedIn() {
  return pb.authStore.record !== null && pb.authStore.isValid;
}
