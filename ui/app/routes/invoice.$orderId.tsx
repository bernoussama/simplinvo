import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { pb } from "@/lib/pocketbase";
import { Order, OrderDetail, Client, Product } from "@/utils/schemas";
import Protected from "@/components/Protected";

export default function Invoice() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [products, setProducts] = useState<{ [key: string]: Product }>({});

  useEffect(() => {
    const fetchOrder = async () => {
      const orderRecord = await pb.collection("orders").getOne(orderId);
      setOrder(orderRecord);

      const clientRecord = await pb
        .collection("clients")
        .getOne(orderRecord.client);
      setClient(clientRecord);

      const orderDetailsRecords = await pb
        .collection("order_details")
        .getFullList({
          filter: `order="${orderId}"`,
        });
      setOrderDetails(orderDetailsRecords);

      const productIds = orderDetailsRecords.map((detail) => detail.product);
      const productsRecords = await pb.collection("products").getFullList({
        // filter: `id="${detail}"`,
      });
      const productsMap = productsRecords.reduce((map, product) => {
        map[product.id] = product;
        return map;
      }, {});
      setProducts(productsMap);
    };

    fetchOrder();
  }, [orderId]);

  if (!order || !client) {
    return <div>Loading...</div>;
  }

  return (
    <Protected>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Invoice {order.id}</h1>
        <div className="mb-4">
          <h2 className="text-xl font-bold">Client</h2>
          <p>{client.name}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-bold">Order Details</h2>
          <p>PO: {order.po}</p>
          <p>Date: {order.date}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-bold">Products</h2>
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.map((detail) => (
                <tr key={detail.id}>
                  <td>{products[detail.product]?.name}</td>
                  <td>{detail.quantity}</td>
                  <td>{products[detail.product]?.price}</td>
                  <td>{detail.quantity * products[detail.product]?.price}</td>
                </tr>
              ))}
              <tr>
                <td></td>
                <td></td>
                <td className="text-end">Total:</td>
                <td>
                  {orderDetails.reduce(
                    (total, detail) =>
                      total + detail.quantity * products[detail.product]?.price,
                    0
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Protected>
  );
}
