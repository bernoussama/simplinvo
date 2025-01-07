/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { pb } from "@/lib/pocketbase";
import { Order, OrderDetail, Client, Product } from "@/utils/schemas";
import Protected from "@/components/Protected";
import {
  Page,
  Text,
  View,
  Document,
  PDFViewer,
  StyleSheet,
} from "@react-pdf/renderer";

export default function Invoice() {
  const { orderId } = useParams<{ orderId: string }>();
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

  async function handleQuantityChange(
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) {
    const newDetails = [...orderDetails];
    newDetails[index].quantity = parseInt(e.target.value);
    console.log("newDetails: ", newDetails);

    try {
      const record = await pb
        .collection("order_details")
        .update(newDetails[index].id, newDetails[index]);
      console.log("updated quantity for record: ", record);

      setOrderDetails(newDetails);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  }
  async function handlePriceChange(
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) {
    const newProducts = { ...products };
    const detail = orderDetails[index];
    newProducts[detail.product].price = parseFloat(e.target.value);
    const data = newProducts[detail.product];
    const record_id = detail.product;
    try {
      const record = await pb.collection("products").update(record_id, data);
      console.log("updated quantity for record: ", record);

      setProducts(newProducts);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  }

  if (!order || !client) {
    return <div>Loading...</div>;
  }

  // Define PDF styles
  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontSize: 12,
    },
    header: {
      fontSize: 24,
      marginBottom: 20,
      color: "#374151",
    },
    clientInfo: {
      fontSize: 14,
      marginBottom: 20,
    },
    infoRow: {
      flexDirection: "row",
      marginBottom: 5,
    },
    label: {
      width: 60,
      fontWeight: "bold",
    },
    // table: {
    //   marginTop: 20,
    //   borderWidth: 1,
    //   borderColor: "#000",
    // },
    // tableHeader: {
    //   flexDirection: "row",
    //   borderBottomWidth: 1,
    //   borderColor: "#000",
    //   backgroundColor: "#f3f4f6",
    //   padding: 8,
    //   fontWeight: "bold",
    // },
    // tableRow: {
    //   flexDirection: "row",
    //   borderBottomWidth: 1,
    //   borderColor: "#000",
    //   padding: 8,
    // },
    column1: { width: "40%" },
    column2: { width: "20%", textAlign: "center" },
    column3: { width: "20%", textAlign: "right" },
    column4: { width: "20%", textAlign: "right" },
    total: {
      marginTop: 20,
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    totalLabel: {
      fontWeight: "bold",
      marginRight: 20,
    },
    totalAmount: {
      fontWeight: "bold",
    },

    table: {
      marginTop: 20,
      borderWidth: 1,
      borderColor: "#000",
      borderRadius: 8, // Add this for rounded corners
      overflow: "hidden", // This is important to make borderRadius work
    },
    tableHeader: {
      borderRadius: 8, // Add this for rounded corners
      flexDirection: "row",
      borderBottomWidth: 1,
      borderColor: "#000",
      backgroundColor: "#f3f4f6",
      padding: 8,
      fontWeight: "bold",
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderColor: "#000",
      padding: 8,
    },
    // Make last row's border bottom disappear
    tableRowLast: {
      flexDirection: "row",
      padding: 8,
      borderBottomWidth: 0,
    },
  });

  const InvoicePDF = () => {
    // Calculate total
    const total = orderDetails.reduce(
      (sum, detail) =>
        sum + detail.quantity * (products[detail.product]?.price || 0),
      0
    );

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View>
            <Text style={styles.header}>Invoice #{order.id}</Text>

            <View style={styles.clientInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Client:</Text>
                <Text>{client.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>PO:</Text>
                <Text>{order.po}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Date:</Text>
                <Text>{new Date(order.date).toLocaleDateString()}</Text>
              </View>
            </View>

            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={styles.column1}>Product</Text>
                <Text style={styles.column2}>Quantity</Text>
                <Text style={styles.column3}>Price</Text>
                <Text style={styles.column4}>Total</Text>
              </View>

              {/* Table Rows */}
              {orderDetails.map((detail, index) => (
                <View
                  key={detail.id}
                  style={
                    index === orderDetails.length - 1
                      ? styles.tableRowLast
                      : styles.tableRow
                  }
                >
                  <Text style={styles.column1}>
                    {products[detail.product]?.name}
                  </Text>
                  <Text style={styles.column2}>{detail.quantity}</Text>
                  <Text style={styles.column3}>
                    ${products[detail.product]?.price.toFixed(2)}
                  </Text>
                  <Text style={styles.column4}>
                    $
                    {(
                      detail.quantity * (products[detail.product]?.price || 0)
                    ).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Total */}
            <View style={styles.total}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </Page>
      </Document>
    );
  };

  return (
    <Protected>
      <div className="container mx-auto p-4 grid grid-cols-2 gap-4">
        {/* Editable Form */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-bold mb-4">Edit Invoice</h2>
          <div className="form-control">
            <label className="label">PO Number</label>
            <input
              type="text"
              value={order.po}
              onChange={(e) => setOrder({ ...order, po: e.target.value })}
              className="input input-bordered"
            />
          </div>
          <div className="form-control">
            <label className="label">Date</label>
            <input
              type="date"
              value={order.date}
              onChange={(e) => setOrder({ ...order, date: e.target.value })}
              className="input input-bordered"
            />
          </div>
          {/* Add more editable fields */}
          <table className="table table-zebra w-full mt-4">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.map((detail, index) => (
                <tr key={detail.id}>
                  <td>{products[detail.product]?.name}</td>
                  <td>
                    <input
                      type="number"
                      value={detail.quantity}
                      onChange={(e) => handleQuantityChange(e, index)}
                      className="input input-bordered w-20"
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      step=".01"
                      value={products[detail.product]?.price}
                      onChange={(e) => handlePriceChange(e, index)}
                      className="input input-bordered w-24"
                    />
                  </td>
                  {/* <td>{products[detail.product]?.price}</td> */}
                  <td>{detail.quantity * products[detail.product]?.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PDF Preview */}
        <div className="border rounded h-[800px]">
          <PDFViewer width="100%" height="100%">
            <InvoicePDF />
          </PDFViewer>
        </div>
      </div>
    </Protected>
  );
}
