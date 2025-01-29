import Invoice from "@/components/Invoice";
import { useParams } from "@remix-run/react";
import { useEffect } from "react";

export default function Order() {
  const paramId = useParams<{ orderId: string }>().orderId;

  useEffect(() => {
      
  });
  return <Invoice invoiceId={paramId || ""} />;
}
