/* eslint-disable jsx-a11y/label-has-associated-control */
import { MetaFunction } from "@remix-run/node";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pb } from "@/lib/pocketbase";
import { OrderSummary, Order, Client, Product } from "@/utils/schemas";
import Protected from "@/components/Protected";
import { currency } from "@/lib/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "Invoices" },
    { name: "description", content: "Invoices page" },
  ];
};

export default function Invoices() {
  const navigate = useNavigate();
  const [orderSummaries, setOrderSummaries] = useState<OrderSummary[]>([]);
  const [formData, setFormData] = useState<Partial<Order>>({
    company: "",
    po: "",
    client: "",
    date: "",
    products: [{ product: "", quantity: 1 }],
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [clientMap, setClientMap] = useState<Record<string, string>>({});
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
        allOrderSummaries.map((order) => ({
          ...order,
          date: order.date.split(" ")[0],
        })) as OrderSummary[]
      );
      console.log("All order summaries:", allOrderSummaries);
    };

    const fetchClientsAndProducts = async () => {
      const clientsRecords = (await pb.collection("clients").getFullList({
        sort: "-created",
      })) as unknown as Client[];
      setClients(clientsRecords);

      const newClientMap: Record<string, string> = {};
      clientsRecords.forEach((client) => {
        newClientMap[client.id] = client.name;
      });
      setClientMap(newClientMap);

      const productsRecords = (await pb.collection("products").getFullList({
        sort: "-created",
      })) as unknown as Product[];
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
    setFormData((prev) => {
      const newProducts = [...(prev.products || [])];
      newProducts[index] = { ...newProducts[index], [name]: value };
      return { ...prev, products: newProducts };
    });
  };

  const handleAddProduct = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...(prev.products || []), { product: "", quantity: 0 }],
    }));
  };

  const handleRemoveProduct = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products?.filter((_, i) => i !== index),
    }));
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
    const orderDetails = await pb
      .collection("order_details")
      .getFullList({ filter: `order="${orderSummary.id}"` });

    setFormData({
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

  const handleShowClick = (orderSummary: OrderSummary) => {
    navigate(`/invoice/${orderSummary.id}`);
  };

  const handleNewOrderSave = async () => {
    console.log(formData.products);
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

    if (editingOrderId) {
      await pb.collection("orders").update(editingOrderId, orderData);

      const existingOrderDetails = await pb
        .collection("order_details")
        .getFullList({ filter: `order="${editingOrderId}"` });

      await Promise.all(
        existingOrderDetails.map((detail) =>
          pb.collection("order_details").delete(detail.id)
        )
      );

      formData.products?.forEach(
        async (element) =>
          await pb.collection("order_details").create({
            company: pb.authStore.record?.company,
            order: editingOrderId,
            product: element.product,
            quantity: Number(element.quantity),
          })
      );
    } else {
      const newOrder = await pb.collection("orders").create(orderData);

      formData.products?.forEach(
        async (element) =>
          await pb.collection("order_details").create({
            company: pb.authStore.record?.company,
            order: newOrder.id,
            product: element.product,
            quantity: Number(element.quantity),
          })
      );
    }

    setFormData({
      company: "",
      po: "",
      client: "",
      date: "",
      products: [{ product: "", quantity: 1 }],
    });
    setIsModalOpen(false);
  };

  return (
    <Protected>
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-row justify-between w-full mb-4 mt-4 p-4">
          <h1 className="text-3xl font-bold">Invoices</h1>
          <button className="btn btn-secondary" onClick={handleNewOrderClick}>
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
              {formData.products?.map((product, index) => (
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
              <button
                className="btn btn-secondary"
                onClick={handleNewOrderSave}
              >
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
              {orderSummaries.map((orderSummary) => (
                <tr key={orderSummary.id}>
                  <td>{orderSummary.id}</td>
                  <td>{clientMap[orderSummary.client]}</td>
                  <td>{orderSummary.date}</td>
                  <td>{orderSummary.po}</td>
                  <td>{currency.format(orderSummary.total)}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEditClick(orderSummary)}
                    >
                      Edit
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-accent"
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
