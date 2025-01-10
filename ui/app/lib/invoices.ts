import { pb } from "./pocketbase";

export async function getInvoices() {
  const records = await pb.collection("orders").getFullList({
    // sort: "-someField",
  });
  return records;
}
