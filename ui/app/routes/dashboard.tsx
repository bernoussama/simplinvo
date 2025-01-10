import { getCurrentUser, isLoggedIn } from "@/lib/pocketbase";
import { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { getInvoices } from "@/lib/invoices"; // Assuming you have a function to fetch invoices

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard" },
    { name: "description", content: "Dashboard page" },
  ];
};
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { faker } from "@faker-js/faker";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Chart.js Line Chart",
    },
  },
};

const labels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Dashboard() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState<number[]>([]);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    if (isLoggedIn()) {
      setUsername(getCurrentUser()?.name);
    }

    const fetchInvoices = async () => {
      const invoices = await getInvoices();

      console.log("invoices: ", invoices);
      const totals = labels.map((month) => {
        return invoices
          .filter((invoice) => {
            const invoiceMonth = new Date(invoice.date).toLocaleString(
              "default",
              { month: "long" }
            );
            console.log(invoiceMonth);

            return invoiceMonth === month;
          })
          .reduce((sum, invoice) => sum + invoice.total, 0);
      });
      console.log("totals: ", totals);

      setInvoiceData(totals);
    };

    fetchInvoices();
  }, []);

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: "Dataset 2",
        data: invoiceData,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };
  return (
    <div>
      {/* <h1 className="text-3xl font-bold">Dashboard</h1> */}
      {loggedIn ? (
        <>
          <h1 className="text-3xl font-bold">Welcome {username}</h1>
          <Line options={options} data={data} />
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
