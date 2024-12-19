import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard" },
    { name: "description", content: "Dashboard page" },
  ];
};

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
    </div>
  );
}
