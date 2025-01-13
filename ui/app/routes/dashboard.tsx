import { getCurrentUser, isLoggedIn } from "@/lib/pocketbase";
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
// import { faker } from "@faker-js/faker";

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

export default function Dashboard() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState<number[]>([]);
  const [totalSales, setTotalSales] = useState<string>("");
  const [year, setYear] = useState<number>(0);

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
            const invoiceYear = new Date(invoice.date).toLocaleString(
              "default",
              { year: "numeric" }
            );
            console.log("invoice year", invoiceYear);

            return parseInt(invoiceYear) === year;
          })
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

      setInvoiceData(totals);
      const total = invoices
        .reduce((sum, invoice) => sum + invoice.total, 0)
        .toFixed(2);
      setTotalSales(total);
      setYear(new Date().getFullYear());
    };

    fetchInvoices();
  }, [year]);

  const data = {
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
  };
  function updateYear(event: ChangeEvent<HTMLSelectElement>): void {
    setYear(Number(event.target.value));
  }
  const years = Array.from({ length: 2025 - 1900 }, (_, i) => 1900 + i);

  return (
    <div>
      {/* <h1 className="text-3xl font-bold">Dashboard</h1> */}
      {loggedIn ? (
        <div className="container">
          <h1 className="text-3xl font-bold">Welcome {username}</h1>
          <div className="grid grid-cols-2 gap-4 p-2">
            <div className="card shadow-lg p-6 rounded-lg w-full max-h-screen mx-auto border"></div>
            <div className="card shadow-lg p-6 rounded-lg w-full max-h-screen mx-auto border">
              <div className="bg-grey w-full p-2 flex justify-between">
                <h2 className="text-lg font-bold mb-4">Sales</h2>
                {/* <span>{year}</span> */}
                {/* <label htmlFor="year">Select Year:</label> */}
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
              <div className="flex flex-row">
                <div className="w-full">
                  <Line options={options} data={data} />
                </div>
                <div className=" grid grid-rows-3 gap-2">
                  <div className="stat mx-auto text-center break-all">
                    <h3 className="stat-title text-secondary">Total Sales</h3>
                    <p className="stat-value text-lg text-secondary break-all">
                      ${totalSales}
                    </p>
                  </div>
                  {/* <div className="stat"> */}
                  {/*   <h3 className="stat-title text-green-600">Total Receipts</h3> */}
                  {/*   <p className="stat-value text-green-600">$2,380.73</p> */}
                  {/* </div> */}
                  {/* <div className="stat"> */}
                  {/*   <h3 className="stat-title text-red-600">Total Expenses</h3> */}
                  {/*   <p className="stat-value text-red-600">$1,521.56</p> */}
                  {/* </div> */}
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
