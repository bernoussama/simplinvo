import { pb } from "./pocketbase";

export async function getInvoices() {
  // console.log(pb.authStore.isValid);

  // check if token is valid?

  const records = await pb.collection("orders").getFullList({
    // sort: "-someField",
  });

  return records;
}
