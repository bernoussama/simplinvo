import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Simplinvo" },
    { name: "description", content: "We make invoices simple!" },
  ];
};

export default function Index() {
  return <h1 className="text-3xl">Index</h1>;
}
