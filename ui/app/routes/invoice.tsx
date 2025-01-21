/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { pb } from "@/lib/pocketbase";
import { Order, OrderDetail, Client, Product } from "@/utils/schemas";
import Protected from "@/components/Protected";
import {
  pdf,
  Page,
  Text,
  View,
  Document,
  PDFViewer,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { numberToWordsFrench, currency } from "@/lib/utils";
type IProduct = {
  id: string;
  quantity: number;
  price: number;
};
type NewProduct = {
  id?: string;
  name: string;
  price: number;
  quantity: number;
};

export default function Invoice() {
  const paramId = useParams<{ orderId: string }>().orderId;
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [orderId, setOrderId] = useState<string>("");
  const [order, setOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [products, setProducts] = useState<{ [key: string]: Product }>({});
  const [company, setCompany] = useState(null);

  const [allProducts, setAllproducts] = useState<Product[]>([]);
  const [addingProduct, setAddingProduct] = useState(false);
  const [productToAdd, setProductToAdd] = useState<IProduct>({
    id: "product",
    quantity: 1,
    price: 1,
  });
  // modal stuff
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<NewProduct>>({
    name: "product",
    price: 1,
    quantity: 1,
  });

  useEffect(() => {
    async function fetchIds() {
      const orders = await pb
        .collection("orders")
        .getFullList({ fields: "id" });

      const ids = orders.map((order) => order.id);
      setOrderIds(ids);

      if (paramId) {
        setOrderId(paramId);
      } else {
        setOrderId(ids[0]);
      }
    }
    fetchIds();
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      const companyId = pb.authStore.record?.company;
      const companyRecord = await pb
        .collection("Companies")
        .getOne(companyId, { fields: "name,country,city,ice" });

      setCompany(companyRecord);
      const orderRecord = await pb.collection("orders").getOne(orderId);
      setOrder({
        ...orderRecord,
        date: orderRecord.date
          ? new Date(orderRecord.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });

      const clientRecord = await pb
        .collection("clients")
        .getOne(orderRecord.client);
      setClient(clientRecord);

      fetchOrderdetails();

      fetchProducts(orderDetails);
    };

    fetchOrder();
  }, [orderId]);

  async function fetchOrderdetails() {
    const orderDetailsRecords = await pb
      .collection("order_details")
      .getFullList({
        filter: `order="${orderId}"`,
      });
    setOrderDetails(orderDetailsRecords);
  }

  const fetchProducts = async (orderDetailsRecords) => {
    const productIds = orderDetailsRecords.map((detail) => detail.product);
    const productsRecords = await pb.collection("products").getFullList({
      // filter: `id="${detail}"`,
    });
    setAllproducts(productsRecords);

    const productsMap = productsRecords.reduce((map, product) => {
      map[product.id] = product;
      return map;
    }, {});
    setProducts(productsMap);
  };

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

  async function handleAddProduct() {
    // event: MouseEvent<HTMLButtonElement, MouseEvent>
    // setFormData({});
    // setIsModalOpen(true);
    // setAddingProduct(true);
    //
    console.log(productToAdd);

    const data = {
      company: pb.authStore.record?.company,
      order: orderId,
      product: productToAdd.id,
      quantity: Number(productToAdd.quantity),
    };

    console.log(data);
    const record = await pb.collection("order_details").create(data);
    console.log("product added: ", record);
    fetchOrderdetails();
  }

  function handleNewProduct() {
    setIsModalOpen(true);
  }

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function handleNewProductSave() {
    const productData = {
      company: pb.authStore.record?.company,
      name: formData.name,
      price: Number(formData.price),
    };
    const productRecord = await pb.collection("products").create(productData);

    const detailsData = {
      company: pb.authStore.record?.company,
      order: orderId,
      product: productRecord.id,
      quantity: Number(formData.quantity),
    };
    const detailsRecord = await pb
      .collection("order_details")
      .create(detailsData);
    console.log(detailsRecord);
    await fetchProducts(orderDetails);
    await fetchOrderdetails();
    setFormData({
      name: "",
      price: 1,
      quantity: 1,
    });
    setIsModalOpen(false);
    setAddingProduct(false);
  }

  const handleProductChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log(name, value);
    const newProduct = { ...productToAdd };
    switch (name) {
      case "id":
        newProduct.id = value;
        break;
      case "quantity":
        newProduct.quantity = parseInt(value);
        break;
      case "price":
        newProduct.price = parseFloat(value);
        break;
      default:
        break;
    }
    setProductToAdd(newProduct);
    console.log("product to add: ", productToAdd);
  };

  // Define PDF styles
  const styles = StyleSheet.create({
    page: {
      padding: 30,
      paddingTop: 120,
      fontSize: 12,
    },
    header: {
      flexDirection: "row",
      marginBottom: 20,
      justifyContent: "space-between",
    },
    clientInfo: {
      textAlign: "center",
      flexDirection: "column",
      justifyContent: "space-between",
      gap: 10,
      width: "45%",
      padding: "8px",
      fontSize: 14,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#000",
      borderRadius: 8, // Add this for rounded corners
      overflow: "hidden", // This is important to make borderRadius work
    },

    companyInfo: {
      textAlign: "center",
      flexDirection: "column",
      justifyContent: "space-evenly",
      width: "45%",
      padding: "8px",
      fontSize: 14,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#000",
      borderRadius: 8, // Add this for rounded corners
      overflow: "hidden", // This is important to make borderRadius work
    },
    infoRow: {
      flexDirection: "row",
      marginBottom: 5,
    },
    label: {
      width: 60,
      fontWeight: "bold",
    },
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
      // borderBottomWidth: 1,
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
    const totalDecimals = (total % 1).toFixed(2).split(".")[1];

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View>
            {/* <Text style={styles.header}>Invoice {order.id}</Text> */}

            <View style={styles.header}>
              <View style={styles.companyInfo}>
                <Text>{company?.name}</Text>
                <Text>{company?.city}</Text>
                <Text>{company?.country}</Text>
              </View>

              <View style={styles.clientInfo}>
                <Text>{client.name}</Text>
                <Text>{client.address}</Text>
                <Text>ice: {client.ice}</Text>
              </View>
            </View>

            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={{ width: "25%", textAlign: "center" }}>
                  Invoice
                </Text>
                <Text style={{ width: "25%", textAlign: "center" }}>Date</Text>
                <Text style={{ width: "25%", textAlign: "center" }}>
                  Client
                </Text>
                <Text style={{ width: "25%", textAlign: "center" }}>PO</Text>
              </View>

              <View style={styles.tableRowLast}>
                <Text style={{ width: "25%", textAlign: "center" }}>
                  {order.id}
                </Text>
                <Text style={{ width: "25%", textAlign: "center" }}>
                  {new Date(order.date).toLocaleDateString()}
                </Text>
                <Text style={{ width: "25%", textAlign: "center" }}>
                  {client.name}
                </Text>
                <Text style={{ width: "25%", textAlign: "center" }}>
                  {order.po}
                </Text>
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
                    {currency.format(products[detail.product]?.price)}
                  </Text>
                  <Text style={styles.column4}>
                    {currency.format(
                      detail.quantity * (products[detail.product]?.price || 0)
                    )}
                  </Text>
                </View>
              ))}
            </View>

            {/* Total */}
            <View style={styles.total}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>{currency.format(total)}</Text>
            </View>
            <View>
              <Text>
                {numberToWordsFrench(total) + " dirhams"}
                {Number(totalDecimals) > 0
                  ? " et " +
                    numberToWordsFrench(Number(totalDecimals)) +
                    " centimes."
                  : ""}
              </Text>
            </View>
          </View>
        </Page>
      </Document>
    );
  };

  return (
    <Protected>
      <div className="container mx-auto p-4 grid grid-cols-2 gap-4">
        <div className={`modal ${isModalOpen ? "modal-open" : ""}`}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">New Client</h3>
            <form>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Price</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Phone</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="input input-bordered"
                />
              </div>
            </form>
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={handleNewProductSave}
              >
                Save
              </button>
              <button className="btn" onClick={handleModalClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Editable Form */}
        <div className="border p-4 rounded flex flex-col gap-4">
          <div className="flex flex-row gap-4 justify-between">
            <h2 className="text-xl font-bold mb-4">Edit Invoice</h2>
            {/* dropdown menu containing order ids that set orderId to the one selected */}
            <div className="form-control flex-row gap-2">
              <label className="label text-nowrap">Invoice ID</label>
              <select
                name="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="select select-bordered text-wrap w-full"
              >
                <option value="" disabled>
                  Select an invoice
                </option>
                {orderIds.map((order) => (
                  <option key={order} value={order}>
                    {order}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
                <th className="text-right">Total</th>
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
                      className="input input-bordered w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  {/* <td>{products[detail.product]?.price}</td> */}
                  <td className="text-right">
                    {currency.format(
                      detail.quantity * products[detail.product]?.price
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-error"
                      onClick={async () => {
                        await pb.collection("order_details").delete(detail.id);
                        fetchOrderdetails();
                      }}
                    >
                      delete
                    </button>
                  </td>
                </tr>
              ))}
              {addingProduct && (
                <tr className="text-wrap">
                  <td className="text-wrap">
                    <select
                      name="id"
                      value={products[productToAdd.id]}
                      onChange={(e) => handleProductChange(e)}
                      className="select select-bordered text-wrap w-full"
                    >
                      <option value="" disabled>
                        Select a product
                      </option>
                      {allProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}

                      <option
                        value={products[productToAdd.id]}
                        onClick={handleNewProduct}
                      >
                        new product
                      </option>
                    </select>
                  </td>
                  <td>
                    <input
                      name="quantity"
                      type="number"
                      step={1}
                      value={productToAdd.quantity}
                      onChange={(e) => handleProductChange(e)}
                      className="input input-bordered w-20"
                    />
                  </td>

                  <td>
                    <input
                      name="price"
                      type="number"
                      step={0.01}
                      value={productToAdd.price}
                      onChange={(e) => handleProductChange(e)}
                      className="input input-bordered w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  <td>
                    {currency.format(
                      productToAdd.quantity * productToAdd.price
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {addingProduct && (
            <div className="w-full flex items-center justify-evenly {}">
              <button className="btn btn-secondary" onClick={handleAddProduct}>
                Confirm
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setAddingProduct(false)}
              >
                Cancel
              </button>
            </div>
          )}
          {!addingProduct && (
            <button
              className=" btn btn-secondary"
              onClick={() => setAddingProduct(true)}
            >
              Add
            </button>
          )}
        </div>

        {/* PDF Preview */}
        <div className="border rounded h-[800px] flex flex-col gap-4 p-2">
          <div className="flex justify-evenly w-full gap-4">
            <button className="btn">
              <PDFDownloadLink
                document={<InvoicePDF />}
                fileName={orderId + ".pdf"}
              >
                {({ blob, url, loading, error }) =>
                  loading ? "Loading document..." : "Download"
                }
              </PDFDownloadLink>
            </button>
            {/* button to print InvoicePDF */}
            <button
              className="btn"
              onClick={async () => {
                const blob = await pdf(<InvoicePDF />).toBlob();
                const url = URL.createObjectURL(blob);
                const printWindow = window.open(url);
                if (printWindow) {
                  printWindow.onload = () => {
                    printWindow.print();
                  };
                }
              }}
            >
              Print
            </button>
          </div>
          <PDFViewer width="100%" height="100%" className="rounded">
            <InvoicePDF />
          </PDFViewer>
        </div>
      </div>
    </Protected>
  );
}
