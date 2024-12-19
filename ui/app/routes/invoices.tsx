import { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import {
  generateMockOrderSummaries,
  generateMockOrders,
  OrderSummary,
  Order,
} from "@/utils/schemas";
import Modal from "@/components/Modal";

export const meta: MetaFunction = () => {
  return [
    { title: "Invoices" },
    { name: "description", content: "Invoices page" },
  ];
};

const mockOrderSummaries: OrderSummary[] = generateMockOrderSummaries(10);
const mockOrders: Order[] = generateMockOrders(10);

export default function Invoices() {
  const [orderSummaries, setOrderSummaries] =
    useState<OrderSummary[]>(mockOrderSummaries);
  const [orders] = useState<Order[]>(mockOrders);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Order>>({});

  const handleEditClick = (orderId: string) => {
    const order = orders.find((order) => order.id === orderId);
    if (order) {
      setEditingOrderId(orderId);
      setFormData(order);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = () => {
    setOrderSummaries((prevOrderSummaries) =>
      prevOrderSummaries.map((orderSummary) =>
        orderSummary.id === editingOrderId
          ? { ...orderSummary, ...formData }
          : orderSummary
      )
    );
    setEditingOrderId(null);
    setFormData({});
  };

  const handleCancelClick = () => {
    setEditingOrderId(null);
    setFormData({});
  };

  const handleCloseModal = () => {
    setEditingOrderId(null);
    setFormData({});
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Invoices</h1>
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          {/* head */}
          <thead>
            <tr>
              <th></th>
              <th>PO</th>
              <th>Client</th>
              <th>Date</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orderSummaries.map((orderSummary, index) => (
              <tr key={orderSummary.id}>
                <th>{index + 1}</th>
                <td>{orderSummary.po}</td>
                <td>{orderSummary.client.name}</td>
                <td>{new Date(orderSummary.date).toLocaleDateString()}</td>
                <td>{orderSummary.total.toFixed(2)}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEditClick(orderSummary.id)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingOrderId && (
        <Modal onClose={handleCloseModal}>
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Edit Order</h2>
            <input
              type="text"
              name="po"
              value={formData.po || ""}
              onChange={handleInputChange}
              className="input input-bordered w-full"
            />
            <input
              type="text"
              name="client"
              value={formData.client?.name || ""}
              onChange={handleInputChange}
              className="input input-bordered w-full"
            />
            <input
              type="date"
              name="date"
              value={
                formData.date
                  ? new Date(formData.date).toISOString().split("T")[0]
                  : ""
              }
              onChange={handleInputChange}
              className="input input-bordered w-full"
            />
            <textarea
              name="products"
              value={
                formData.products?.map((product) => product.name).join(", ") ||
                ""
              }
              onChange={handleInputChange}
              className="textarea textarea-bordered w-full"
              rows={3}
            />
            <input
              type="number"
              name="total"
              value={formData.total || 0}
              onChange={handleInputChange}
              className="input input-bordered w-full"
            />
            <div className="flex justify-end gap-2">
              <button className="btn btn-accent" onClick={handleSaveClick}>
                Save
              </button>
              <button className="btn" onClick={handleCancelClick}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
