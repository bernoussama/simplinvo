import { getCurrentUser, isLoggedIn, pb } from "@/lib/pocketbase";
import { MetaFunction } from "@remix-run/node";
import { ChangeEvent, useEffect, useState } from "react";
import { getInvoices } from "@/lib/invoices"; // Assuming you have a function to fetch invoices

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard" },
    { name: "description", content: "Dashboard page" },
  ];
};
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ChartData,
} from "chart.js";

import { Doughnut, Line } from "react-chartjs-2";
// import { faker } from "@faker-js/faker";

ChartJS.register(
  ArcElement,
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
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: false,
      text: "",
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
const colors = [
  "rgba(255, 99, 132, 0.2)",
  "rgba(54, 162, 235, 0.2)",
  "rgba(255, 206, 86, 0.2)",
  "rgba(75, 192, 192, 0.2)",
  "rgba(153, 102, 255, 0.2)",
  "rgba(255, 159, 64, 0.2)",
];

export default function Dashboard() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState<number[]>([]);
  const [totalSales, setTotalSales] = useState<string>("".toLocaleLowerCase());
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [data, setData] = useState<ChartData>({
    labels,
    datasets: [
      {
        fill: false,
        label: "Sales",
        data: invoiceData,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  });
  const [doughnutData, setDoughnutData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: "Sales by client",
        data: [],
        // borderColor: "rgb(53, 162, 235)",
        // backgroundColor: "rgba(53, 162, 235, 0.5)",
        borderWidth: 1,
      },
    ],
  });

  const currency = new Intl.NumberFormat({ style: "currency" });

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    if (isLoggedIn()) {
      setUsername(getCurrentUser()?.name);
    }

    console.log("year: ", year);

    const fetchInvoices = async () => {
      const invoices = await getInvoices();

      console.log("invoices: ", invoices);
      const yearInvoices = invoices.filter((invoice) => {
        const invoiceYear = new Date(invoice.date).toLocaleString("default", {
          year: "numeric",
        });
        console.log("invoice year", invoiceYear);

        return parseInt(invoiceYear) === year;
      });
      const totals = labels.map((month) => {
        return yearInvoices
          .filter((invoice) => {
            const invoiceMonth = new Date(invoice.date).toLocaleString(
              "default",
              { month: "long" }
            );

            return invoiceMonth === month;
          })
          .reduce((sum, invoice) => sum + invoice.total, 0);
      });
      console.log("totals: ", totals);

      // group totals by clients
      const clientsSales: Map<string, number> = new Map();
      yearInvoices.forEach((element) => {
        if (clientsSales.has(element.client)) {
          clientsSales.set(
            element.client,
            clientsSales.get(element.client) + element.total
          );
        } else {
          clientsSales.set(element.client, element.total);
        }
      });
      console.log(clientsSales);
      const clientLabels: string[] = [];
      Array.from(clientsSales.keys()).forEach(async (id: string) => {
        const record = await pb.collection("clients").getOne(id);
        clientLabels.push(record.name);
      });

      setDoughnutData({
        labels: clientLabels,
        datasets: [
          {
            label: "Sales by client",
            data: [...clientsSales.values()],
            backgroundColor: colors.slice(0, clientLabels.length + 2),
            borderColor: colors.slice(0, clientLabels.length + 2),
            borderWidth: 1,
          },
        ],
      });
      console.log(doughnutData);

      setInvoiceData(totals);
      setData({
        labels,
        datasets: [
          {
            fill: false,
            label: "Sales",
            data: totals,
            borderColor: "rgb(53, 162, 235)",
            backgroundColor: "rgba(53, 162, 235, 0.5)",
          },
        ],
      });
      const total = yearInvoices.reduce(
        (sum, invoice) => sum + invoice.total,
        0
      );
      setTotalSales(currency.format(total));
    };

    fetchInvoices();
  }, [year]);

  function updateYear(event: ChangeEvent<HTMLSelectElement>) {
    setYear(Number(event.target.value));
  }

  const years = Array.from({ length: 2025 - 1900 + 1 }, (_, i) => 1900 + i);

  return (
    <div>
      {/* <h1 className="text-3xl font-bold">Dashboard</h1> */}
      {loggedIn ? (
        <div className="container p-2">
          <h1 className="text-3xl font-bold">Welcome {username}</h1>
          <div className="grid grid-cols-3 grid-rows-2 gap-4 p-2 max-h-screen">
            <div className="card shadow-lg rounded-lg w-full max-h-screen mx-auto border">
              <div className="bg-secondary w-full p-2 flex items-center justify-start rounded-t-lg h-16">
                <h2 className="card-title">Sales by client</h2>
              </div>
              <div className="p-2 h-full">
                <Doughnut options={options} data={doughnutData} />
              </div>
            </div>
            <div className="card shadow-lg rounded-lg w-full h-full mx-auto border col-span-2">
              <div className="bg-secondary w-full p-2 flex justify-between items-center rounded-t-lg h-16">
                <h2 className="card-title">Sales</h2>
                <select
                  id="year"
                  name="year"
                  className="select"
                  onChange={updateYear}
                >
                  <option value={year}>{year}</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className=" card-body flex flex-row h-full p-2">
                <div className="w-full h-full">
                  <Line options={options} data={data} />
                </div>
                <div className=" grid grid-rows-3 gap-2">
                  <div className="stat mx-auto text-center break-all">
                    <h3 className="stat-title text-secondary">Total Sales</h3>
                    <p className="stat-value text-lg text-secondary break-all">
                      ${totalSales}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
