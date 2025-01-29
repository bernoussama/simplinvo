/* eslint-disable jsx-a11y/label-has-associated-control */
import { MetaFunction } from "@remix-run/node";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { pb } from "@/lib/pocketbase";
import { OrderSummary, Order, Client, Product } from "@/utils/schemas";
import Protected from "@/components/Protected";
import { currency } from "@/lib/utils";

export const meta: MetaFunction = () => {
  const { t } = useTranslation("invoices");
  return [
    { title: t("title") },
    { name: "description", content: t("description") },
  ];
};

export default function Invoices() {
  const { t } = useTranslation(["common", "invoices"]);
  const navigate = useNavigate();
  const [orderSummaries, setOrderSummaries] = useState<OrderSummary[]>([]);
  const [formData, setFormData] = useState<Partial<Order>>({
    company: "",
    po: "",
    client: "",
    date: new Date().toISOString().split("T")[0],
    products: [{ product: "", quantity: 1 }],
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [clientMap, setClientMap] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Product[]>([]);

  async function getAllOrderSummaries() {
    const records = await pb.collection("orders").getFullList({
      sort: "-date",
    });

    return records;
  }

  const fetchOrderSummaries = async () => {
    const allOrderSummaries = await getAllOrderSummaries();

    setOrderSummaries(
      allOrderSummaries.map((order) => ({
        ...order,
        date: order.date.split(" ")[0],
      })) as OrderSummary[]
    );
  };

  useEffect(() => {
    const fetchClients = async () => {
      const clientsRecords = (await pb.collection("clients").getFullList({
        sort: "-created",
      })) as unknown as Client[];
      setClients(clientsRecords);

      const newClientMap: Record<string, string> = {};
      clientsRecords.forEach((client) => {
        newClientMap[client.id] = client.name;
      });
      setClientMap(newClientMap);
    };

    fetchOrderSummaries();
    fetchClients();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const clientsRecords: Client[] = await pb
        .collection("clients")
        .getFullList({
          sort: "-created",
        });
      setClients(clientsRecords);

      const newClientMap: Record<string, string> = {};
      clientsRecords.forEach((client) => {
        newClientMap[client.id] = client.name;
      });
      setClientMap(newClientMap);

      const productsRecords: Product[] = await pb
        .collection("products")
        .getFullList({
          // sort: "-created",
        });
      setProducts(productsRecords);
    };
    if (isModalOpen) {
      fetchProducts();
    }
  }, [isModalOpen]);

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
      products: [...(prev.products || []), { product: "", quantity: 1 }],
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
      date: new Date().toISOString().split("T")[0],
      products: [{ product: "", quantity: 1 }],
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
    if (editingOrderId) {
      setEditingOrderId(null);
    }
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
    const batch = pb.createBatch();
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
      batch.collection("orders").update(editingOrderId, orderData);

      const existingOrderDetails = await pb
        .collection("order_details")
        .getFullList({ filter: `order="${editingOrderId}"` });

      existingOrderDetails.map((detail) =>
        batch.collection("order_details").delete(detail.id)
      );

      formData.products?.forEach((element) =>
        batch.collection("order_details").create({
          company: pb.authStore.record?.company,
          order: editingOrderId,
          product: element.product,
          quantity: Number(element.quantity),
        })
      );
      setEditingOrderId(null);
    } else {
      const newOrder = await pb.collection("orders").create(orderData);

      formData.products?.forEach((element) =>
        batch.collection("order_details").create({
          company: pb.authStore.record?.company,
          order: newOrder.id,
          product: element.product,
          quantity: Number(element.quantity),
        })
      );
    }

    const result = await batch.send();

    setFormData({
      company: "",
      po: "",
      client: "",
      date: "",
      products: [{ product: "", quantity: 1 }],
    });
    setIsModalOpen(false);

    fetchOrderSummaries();
  };

  return (
    <Protected>
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-row justify-between w-full mb-4 mt-4 p-4">
          <h1 className="text-3xl font-bold">{t("invoices:title")}</h1>
          <button className="btn btn-secondary" onClick={handleNewOrderClick}>
            {t("invoices:new")}
          </button>
        </div>
        <div className={`modal ${isModalOpen ? "modal-open" : ""}`}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              {t("invoices:newOrderDetail")}
            </h3>
            <form>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t("invoices:po")}</span>
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
                  <span className="label-text">{t("invoices:client")}</span>
                </label>
                <select
                  name="client"
                  value={formData.client || ""}
                  onChange={handleInputChange}
                  className="select select-bordered"
                >
                  <option value="" disabled>
                    {t("invoices:selectClient")}
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
                  <span className="label-text">{t("invoices:date")}</span>
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
                    <span className="label-text">{t("invoices:product")}</span>
                  </label>
                  <select
                    name="product"
                    value={product.product}
                    onChange={(e) => handleProductChange(index, e)}
                    className="select select-bordered"
                  >
                    <option value="" disabled>
                      {t("invoices:selectProduct")}
                    </option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  <label className="label">
                    <span className="label-text">{t("invoices:quantity")}</span>
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
                    {t("invoices:remove")}
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary mt-2"
                onClick={handleAddProduct}
              >
                {t("invoices:addProduct")}
              </button>
            </form>
            <div className="modal-action">
              <button
                className="btn btn-secondary"
                onClick={handleNewOrderSave}
              >
                {t("common:save")}
              </button>
              <button className="btn" onClick={handleCancelClick}>
                {t("common:cancel")}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>{t("invoices:id")}</th>
                <th>{t("invoices:client")}</th>
                <th>{t("invoices:date")}</th>
                <th>{t("invoices:po")}</th>
                <th>{t("invoices:total")}</th>
                <th></th>
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
                      {t("common:edit")}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-accent"
                      onClick={() => handleShowClick(orderSummary)}
                    >
                      {t("invoices:show")}
                    </button>
                  </td>

                  <td>
                    <button
                      className="btn btn-error"
                      onClick={async () => {
                        const records = await pb
                          .collection("order_details")
                          .getFullList({
                            filter: `order="${orderSummary.id}"`,
                          });

                        const batch = pb.createBatch();
                        records.forEach((record) => {
                          batch.collection("order_details").delete(record.id);
                        });

                        batch.collection("orders").delete(orderSummary.id);

                        await batch.send();
                        fetchOrderSummaries();
                      }}
                    >
                      {t("common:delete")}
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
