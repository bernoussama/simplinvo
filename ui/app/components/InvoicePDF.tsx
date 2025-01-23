import {
  Document,
  Page,
  StyleSheet,
  View,
  Text,
  Image,
} from "@react-pdf/renderer";
import {
  type Order,
  type OrderDetail,
  type Client,
  type Product,
} from "@/utils/schemas";
import { numberToWordsFrench, currency } from "@/lib/utils";

interface InvoicePDFProps {
  order: Order;
  client: Client;
  company: any;
  orderDetails: OrderDetail[];
  products: { [key: string]: Product };
  entete: boolean;
  stamp: boolean;
  headerUrl: string;
  stampUrl: string;
}

const styles = StyleSheet.create({
  pageBackground: {
    top: "0",
    left: "0",
    position: "absolute",
    minWidth: "100%",
    minHeight: "100%",
    maxHeight: "100%",
    maxWidth: "100%",
    height: "100%",
    width: "100%",
  },
  stamp: {
    top: "65%",
    left: "50%",
    position: "absolute",
    height: "15%",
    width: "15%",
  },
  page: {
    padding: 30,
    paddingTop: 200,
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
    borderRadius: 8,
    overflow: "hidden",
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
    borderRadius: 8,
    overflow: "hidden",
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
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    borderRadius: 8,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderColor: "#000",
    padding: 8,
  },
  tableRowLast: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 0,
  },
});

export const InvoicePDF = ({
  order,
  client,
  company,
  orderDetails,
  products,
  entete,
  stamp,
  headerUrl,
  stampUrl,
}: InvoicePDFProps) => {
  const total = orderDetails.reduce(
    (sum, detail) =>
      sum + detail.quantity * (products[detail.product]?.price || 0),
    0
  );
  const totalDecimals = (total % 1).toFixed(2).split(".")[1];

  return (
    <Document>
      <Page size="A4">
        <View style={styles.pageBackground}>
          {entete && <Image src={headerUrl} style={styles.pageBackground} />}
          <View style={styles.page}>
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
              <View style={styles.tableHeader}>
                <Text style={{ width: "20%", textAlign: "center" }}>
                  Invoice
                </Text>
                <Text style={{ width: "20%", textAlign: "center" }}>Date</Text>
                <Text style={{ width: "35%", textAlign: "center" }}>
                  Client
                </Text>
                <Text style={{ width: "25%", textAlign: "center" }}>PO</Text>
              </View>

              <View style={styles.tableRowLast}>
                <Text style={{ width: "20%", textAlign: "center" }}>
                  {order.id}
                </Text>
                <Text style={{ width: "20%", textAlign: "center" }}>
                  {new Date(order.date).toLocaleDateString()}
                </Text>
                <Text style={{ width: "35%", textAlign: "center" }}>
                  {client.name}
                </Text>
                <Text style={{ width: "25%", textAlign: "center" }}>
                  {order.po}
                </Text>
              </View>
            </View>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.column1}>Product</Text>
                <Text style={styles.column2}>Quantity</Text>
                <Text style={styles.column3}>Price</Text>
                <Text style={styles.column4}>Total</Text>
              </View>

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
          {stamp && <Image src={stampUrl} style={styles.stamp} />}
        </View>
      </Page>
    </Document>
  );
};
