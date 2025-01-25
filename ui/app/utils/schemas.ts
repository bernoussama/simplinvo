import { faker } from "@faker-js/faker";

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  ice: string;
  tax: number;
  header: File | null;
}

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  ice: string;
  tax: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  tax: number;
};

export type OProduct = { product: string; quantity: number };

export type Order = {
  company: string;
  id: string;
  po: string;
  client: string;
  date: string;
  products: OProduct[];
  quantity: string;
  total: number;
};

export interface OrderDetail {
  id: string;
  order: string;
  product: string;
  quantity: number;
}

export type OrderSummary = {
  order: string;
  id: string;
  po: string;
  client: string;
  date: string;
  total: number;
};

export function generateMockClients(count: number): Client[] {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    country: faker.location.country(),
    postal_code: faker.location.zipCode(),
    ice: faker.string.numeric(10),
    tax: faker.number.int({ min: 0, max: 20 }),
  }));
}

export function generateMockProducts(count: number): Product[] {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price()),
    tax: faker.number.int({ min: 0, max: 20 }),
  }));
}

export function generateMockOrders(count: number): Order[] {
  const clients = generateMockClients(count);
  const products = generateMockProducts(count * 2);

  return Array.from({ length: count }, (_, index) => {
    const client = clients[index];
    const orderProducts = products.slice(index * 2, index * 2 + 2);
    const quantities = orderProducts.map(() =>
      faker.number.int({ min: 1, max: 10 })
    );
    const total = orderProducts.reduce(
      (sum, product, i) => sum + product.price * quantities[i],
      0
    );

    return {
      id: faker.string.uuid(),
      po: faker.string.alphanumeric(10),
      client,
      date: faker.date.recent(),
      products: orderProducts,
      quantity: quantities,
      total,
    };
  });
}

export function generateMockOrderSummaries(count: number): OrderSummary[] {
  const orders = generateMockOrders(count);

  return orders.map((order) => ({
    id: order.id,
    po: order.po,
    client: order.client,
    date: order.date,
    total: order.total,
  }));
}
