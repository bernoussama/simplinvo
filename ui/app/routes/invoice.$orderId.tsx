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
type IProduct = {
  id: string;
  quantity: number;
  price: number;
};

export default function Invoice() {
  const { orderId } = useParams<{ orderId: string }>();
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
  const [formData, setFormData] = useState<Partial<Product>>({});

  const currency = new Intl.NumberFormat();

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
      setAllproducts(productsRecords);

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
  }

  function handleNewProduct() {
    setFormData({});
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

  function handleNewProductSave() {}

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
                    ${currency.format(products[detail.product]?.price)}
                  </Text>
                  <Text style={styles.column4}>
                    $
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
              <Text style={styles.totalAmount}>${currency.format(total)}</Text>
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
                  type="price"
                  name="price"
                  value={formData.price || ""}
                  onChange={handleInputChange}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Phone</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.quantity || ""}
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
              {addingProduct && (
                <tr>
                  <td>
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
                      className="input input-bordered w-24"
                    />
                  </td>
                  <td>{productToAdd.quantity * productToAdd.price}</td>
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
        <div className="border rounded h-[800px]">
          <PDFViewer width="100%" height="100%">
            <InvoicePDF />
          </PDFViewer>
        </div>
      </div>
    </Protected>
  );
}
