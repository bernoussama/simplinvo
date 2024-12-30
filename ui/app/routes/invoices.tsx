/* eslint-disable jsx-a11y/label-has-associated-control */
import { MetaFunction } from "@remix-run/node";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pb } from "@/lib/pocketbase";
import { OrderSummary, Order, Client, Product } from "@/utils/schemas";
import Modal from "@/components/Modal";
import Protected from "@/components/Protected";

export const meta: MetaFunction = () => {
  return [
    { title: "Invoices" },
    { name: "description", content: "Invoices page" },
  ];
};

export default function Invoices() {
  const navigate = useNavigate();
  const [orderSummaries, setOrderSummaries] = useState<OrderSummary[]>([]);
  const [orderDetails, setOrderDetails] = useState<Order[]>([]);
  const [formData, setFormData] = useState<Partial<Order>>({
    company: "",
    po: "",
    client: "",
    date: "",
    products: [{ product: "", quantity: 0 }],
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [clientMap, setClientMap] = useState<{ [key: string]: string }>({});
  const [products, setProducts] = useState<Product[]>([]);

  async function getAllOrderSummaries() {
    const records = await pb.collection("orders").getFullList({
      sort: "-date",
    });
    console.log("Records:", records);
    return records;
  }

  useEffect(() => {
    const fetchOrderSummaries = async () => {
      const allOrderSummaries = await getAllOrderSummaries();

      setOrderSummaries(
        allOrderSummaries.map((order) => {
          order.date = order.date.split(" ")[0];
          return order;
        }) as unknown as OrderSummary[]
      );
      console.log("All order summaries:", allOrderSummaries);
    };

    const fetchClientsAndProducts = async () => {
      const clientsRecords = await pb.collection("clients").getFullList({
        sort: "-created",
      });
      setClients(clientsRecords);
      const clientMap = clientsRecords.reduce((map, client) => {
        map[client.id] = client.name;
        return map;
      }, {});
      setClientMap(clientMap);

      const productsRecords = await pb.collection("products").getFullList({
        sort: "-created",
      });
      setProducts(productsRecords);
    };

    fetchOrderSummaries();
    fetchClientsAndProducts();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newProducts = [...formData.products];
    newProducts[index] = { ...newProducts[index], [name]: value };
    setFormData((prev) => ({ ...prev, products: newProducts }));
  };

  const handleAddProduct = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { product: "", quantity: 0 }],
    }));
  };

  const handleRemoveProduct = (index: number) => {
    const newProducts = formData.products.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, products: newProducts }));
  };

  const handleNewOrderClick = () => {
    setFormData({
      company: "",
      po: "",
      client: "",
      date: "",
      products: [{ product: "", quantity: 0 }],
    });
    setEditingOrderId(null);
    setIsModalOpen(true);
  };

  const handleCancelClick = () => {
    setIsModalOpen(false);
    setFormData({
      company: "",
      po: "",
      client: "",
      date: "",
      products: [{ product: "", quantity: 0 }],
    });
  };
  const handleEditClick = async (orderSummary: OrderSummary) => {
    // Fetch the order details
    const orderDetails = await pb
      .collection("order_details")
      .getFullList({ filter: `order="${orderSummary.id}"` });

    // Populate the form with the existing order data
    setFormData({
      company: orderSummary.company,
      po: orderSummary.po,
      client: orderSummary.client,
      date: orderSummary.date,
      products: orderDetails.map((detail) => ({
        product: detail.product,
        quantity: detail.quantity,
      })),
    });
    setEditingOrderId(orderSummary.id);
    setIsModalOpen(true);
  };
  function handleShowClick(orderSummary: OrderSummary) {
    navigate(`/invoice/${orderSummary.id}`);
  }
  const handleNewOrderSave = async () => {
    if (editingOrderId) {
      // Update the existing order
      const orderData = {
        company: pb.authStore.record?.company,
        po: formData.po,
        client: formData.client,
        date: formData.date,
        total: formData.products?.reduce((acc, product) => {
          const productDetails = products.find((p) => p.id === product.product);
          return (
            acc + (productDetails ? productDetails.price * product.quantity : 0)
          );
        }, 0),
      };
      await pb.collection("orders").update(editingOrderId, orderData);

      // Delete existing order details
      const existingOrderDetails = await pb
        .collection("order_details")
        .getFullList({ filter: `order="${editingOrderId}"` });
      await Promise.all(
        existingOrderDetails.map((detail) =>
          pb.collection("order_details").delete(detail.id)
        )
      );

      // Add new order details
      formData.products?.forEach(async (element) => {
        const orderDetailData = {
          company: pb.authStore.record?.company,
          order: editingOrderId,
          product: element.product,
          quantity: Number(element.quantity),
        };
        await pb.collection("order_details").create(orderDetailData);
      });
    } else {
      // Create the order first
      const orderData = {
        company: pb.authStore.record?.company,
        po: formData.po,
        client: formData.client,
        date: formData.date,
      };
      const newOrder = await pb.collection("orders").create(orderData);

      // Add entry for each product in invoice/order
      formData.products?.forEach(async (element) => {
        const orderDetailData = {
          company: pb.authStore.record?.company,
          order: newOrder.id,
          product: element.product,
          quantity: Number(element.quantity),
        };
        await pb.collection("order_details").create(orderDetailData);
      });
    }

    setFormData({
      company: "",
      po: "",
      client: "",
      date: "",
      products: [{ product: "", quantity: 0 }],
    });
    setIsModalOpen(false);
  };

  return (
    <Protected>
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-row justify-between w-full mb-4 mt-4 p-4">
          <h1 className="text-3xl font-bold">Invoices</h1>
          <button className="btn btn-primary" onClick={handleNewOrderClick}>
            New
          </button>
        </div>
        <div className={`modal ${isModalOpen ? "modal-open" : ""}`}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">New Order Detail</h3>
            <form>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">PO</span>
                </label>
                <input
                  type="text"
                  name="po"
                  value={formData.po || ""}
                  onChange={handleInputChange}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Client</span>
                </label>
                <select
                  name="client"
                  value={formData.client || ""}
                  onChange={handleInputChange}
                  className="select select-bordered"
                >
                  <option value="" disabled>
                    Select a client
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Date</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={
                    formData.date
                      ? new Date(formData.date).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={handleInputChange}
                  className="input input-bordered"
                />
              </div>
              {formData.products.map((product, index) => (
                <div key={index} className="form-control">
                  <label className="label">
                    <span className="label-text">Product</span>
                  </label>
                  <select
                    name="product"
                    value={product.product}
                    onChange={(e) => handleProductChange(index, e)}
                    className="select select-bordered"
                  >
                    <option value="" disabled>
                      Select a product
                    </option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  <label className="label">
                    <span className="label-text">Quantity</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={product.quantity}
                    onChange={(e) => handleProductChange(index, e)}
                    className="input input-bordered"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary mt-2"
                    onClick={() => handleRemoveProduct(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary mt-2"
                onClick={handleAddProduct}
              >
                Add Product
              </button>
            </form>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={handleNewOrderSave}>
                Save
              </button>
              <button className="btn" onClick={handleCancelClick}>
                Cancel
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            {/* head */}
            <thead>
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Date</th>
                <th>PO</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orderSummaries.map((orderSummary, _index) => (
                <tr key={orderSummary.id}>
                  <td>{orderSummary.id}</td>
                  <td>{clientMap[orderSummary.client]}</td>
                  <td>{orderSummary.date}</td>
                  <td>{orderSummary.po}</td>
                  <td>{orderSummary.total}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEditClick(orderSummary)}
                    >
                      Edit
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleShowClick(orderSummary)}
                    >
                      Show
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Protected>
  );
}
