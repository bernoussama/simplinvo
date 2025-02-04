/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState, useEffect } from "react";
import { pb } from "@/lib/pocketbase";
import { MetaFunction } from "@remix-run/node";
import { generateMockProducts, Product } from "@/utils/schemas";
import Protected from "@/components/Protected";
import { currency } from "@/lib/utils";
import ErrorAlert from "@/components/ErrorAlert";
import { ClientResponseError } from "pocketbase";
import { useTranslation } from "react-i18next";

export const meta: MetaFunction = () => {
  return [
    { title: "Products" },
    { name: "description", content: "Products page" },
  ];
};

async function getAllProducts() {
  return await pb.collection("products").getFullList({
    sort: "-name",
  });
}

export default function Products() {
  const { t } = useTranslation("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const allProducts = await getAllProducts();
      setProducts(allProducts as unknown as Product[]);
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
      await pb.collection("products").update(editingProductId!, data);

      const allProducts = await getAllProducts();
      setProducts(allProducts as unknown as Product[]);

      setEditingProductId(null);
      setFormData({});
      setIsModalOpen(false);
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
      await pb.collection("products").create(data);
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
      {errorMessage && <ErrorAlert message={errorMessage} />}
      <div className="flex flex-col items-center gap-2 justify-center">
        <div className="flex flex-row justify-between w-full mb-4 mt-4 p-4">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <div className="flex justify-end w-full mb-4">
            <button
              className="btn btn-secondary"
              onClick={handleNewProductClick}
            >
              {t("new")}
            </button>
          </div>
        </div>
        <div className={`modal ${isModalOpen ? "modal-open" : ""}`}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">{t("title")}</h3>
            <form>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t("form.name")}</span>
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
                  <span className="label-text">{t("form.description")}</span>
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
                  <span className="label-text">{t("form.price")}</span>
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
                  <span className="label-text">{t("form.tax")}</span>
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
                {t("actions.save")}
              </button>
              <button className="btn" onClick={handleModalClose}>
                {t("actions.cancel")}
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th style={{ width: "1.5rem" }}></th>
                <th>{t("form.name")}</th>
                <th>{t("form.description")}</th>
                <th>{t("form.price")}</th>
                <th>{t("form.tax")}</th>
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
                      currency.format(product.price)
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
                      <div className="flex justify-center flex-row gap-1 items-center">
                        <button
                          className="btn btn-accent"
                          onClick={handleSaveClick}
                        >
                          {t("actions.save")}
                        </button>
                        <button className="btn" onClick={handleCancelClick}>
                          {t("actions.cancel")}
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-accent"
                        onClick={() => handleEditClick(product)}
                      >
                        {t("actions.edit")}
                      </button>
                    )}
                  </td>

                  <td>
                    <button
                      className="btn btn-error"
                      onClick={async () => {
                        try {
                          await pb.collection("products").delete(product.id);
                        } catch (error) {
                          if (error instanceof ClientResponseError) {
                            setErrorMessage(t("errors.deleteError"));
                            setTimeout(() => setErrorMessage(null), 3000);
                          } else if (error instanceof Error) {
                            setErrorMessage(error.message);
                          }
                        }
                      }}
                    >
                      {t("actions.delete")}
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
