import { useState } from "react";
import { MetaFunction } from "@remix-run/node";
import { generateMockProducts, Product } from "@/utils/schemas";

export const meta: MetaFunction = () => {
  return [
    { title: "Products" },
    { name: "description", content: "Products page" },
  ];
};

const mockProducts: Product[] = generateMockProducts(10);

export default function Products() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});

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

  const handleSaveClick = () => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === editingProductId ? { ...product, ...formData } : product
      )
    );
    setEditingProductId(null);
    setFormData({});
  };

  const handleCancelClick = () => {
    setEditingProductId(null);
    setFormData({});
  };
  return (
    <>
      <h1 className="text-3xl font-bold">Products</h1>

      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">Products</h1>
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
    </>
  );
}
