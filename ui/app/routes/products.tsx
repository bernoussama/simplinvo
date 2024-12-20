/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState, useEffect } from "react";
import { pb } from "@/lib/pocketbase";
import { MetaFunction } from "@remix-run/node";
import { generateMockProducts, Product } from "@/utils/schemas";
import Protected from "@/components/Protected";

export const meta: MetaFunction = () => {
  return [
    { title: "Products" },
    { name: "description", content: "Products page" },
  ];
};

// const mockProducts: Product[] = generateMockProducts(10);
//
async function getAllProducts() {
  const records = await pb.collection("products").getFullList({
    sort: "-name",
  });
  console.log("Records:", records);
  return records;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      const allProducts = await getAllProducts();
      setProducts(allProducts as unknown as Product[]);
      console.log("All products:", allProducts);
    };

    fetchProducts();
  }, []);

  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id);
    setFormData(product);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async () => {
    try {
      const data = {
        company: pb.authStore.record?.company,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        tax: formData.tax,
      };
      const updatedProduct = await pb
        .collection("products")
        .update(editingProductId!, data);
      console.log("Product updated:", updatedProduct);
      const allProducts = await getAllProducts();
      setProducts(allProducts as unknown as Product[]);

      setEditingProductId(null);
      setFormData({});
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleCancelClick = () => {
    setEditingProductId(null);
    setFormData({});
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNewProductClick = () => {
    const mockProduct = generateMockProducts(1)[0];
    setFormData(mockProduct);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData({});
  };

  const handleNewProductSave = async () => {
    try {
      const data = {
        company: pb.authStore.record?.company,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        tax: formData.tax,
      };
      const newProduct = await pb.collection("products").create(data);
      const allProducts = await getAllProducts();
      setProducts(allProducts as unknown as Product[]);
      setIsModalOpen(false);
      setFormData({});
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  return (
    <Protected>
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex justify-end w-full mb-4">
          <button className="btn btn-primary" onClick={handleNewProductClick}>
            New
          </button>
        </div>
        <div className={`modal ${isModalOpen ? "modal-open" : ""}`}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">New Product</h3>
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
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered"
                  rows={3}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Price</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || 0}
                  onChange={handleInputChange}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tax</span>
                </label>
                <input
                  type="number"
                  name="tax"
                  value={formData.tax || 0}
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
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            {/* head */}
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Tax</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id}>
                  <th>{index + 1}</th>
                  <td>
                    {editingProductId === product.id ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleInputChange}
                        className="input input-bordered w-full m-0 p-1"
                        style={{ whiteSpace: "pre-wrap" }}
                      />
                    ) : (
                      product.name
                    )}
                  </td>
                  <td>
                    {editingProductId === product.id ? (
                      <textarea
                        name="description"
                        value={formData.description || ""}
                        onChange={handleInputChange}
                        className="textarea textarea-bordered w-full m-0 p-1"
                        rows={3}
                        style={{ whiteSpace: "pre-wrap" }}
                      />
                    ) : (
                      product.description
                    )}
                  </td>
                  <td>
                    {editingProductId === product.id ? (
                      <input
                        type="number"
                        name="price"
                        value={formData.price || 0}
                        onChange={handleInputChange}
                        className="input input-bordered w-full m-0 p-1"
                        style={{ whiteSpace: "pre-wrap" }}
                      />
                    ) : (
                      product.price
                    )}
                  </td>
                  <td>
                    {editingProductId === product.id ? (
                      <input
                        type="number"
                        name="tax"
                        value={formData.tax || 0}
                        onChange={handleInputChange}
                        className="input input-bordered w-full m-0 p-1"
                        style={{ whiteSpace: "pre-wrap" }}
                      />
                    ) : (
                      product.tax
                    )}
                  </td>
                  <td>
                    {editingProductId === product.id ? (
                      <div className="flex justify-center flex-col gap-1 items-center">
                        <button
                          className="btn btn-accent"
                          onClick={handleSaveClick}
                        >
                          Save
                        </button>
                        <button className="btn" onClick={handleCancelClick}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleEditClick(product)}
                      >
                        Edit
                      </button>
                    )}
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
