/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useState } from "react";
import { MetaFunction } from "@remix-run/node";
import { Client, generateMockClients } from "@/utils/schemas";
import Protected from "@/components/Protected";
import { pb } from "@/lib/pocketbase";
import { ClientResponseError } from "pocketbase";
import ErrorAlert from "@/components/ErrorAlert";
import { useTranslation } from "react-i18next";
export const meta: MetaFunction = () => {
  return [
    { title: "Clients" },
    { name: "description", content: "Clients page" },
  ];
};

// const mockClients: Client[] = generateMockClients(10);

async function getAllClients() {
  const records = await pb.collection("clients").getFullList({
    sort: "-name",
  });

  return records;
}

export default function Clients() {
  const { t } = useTranslation(["clients", "common"]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      const allClients = await getAllClients();

      setClients(allClients as unknown as Client[]);
    };

    fetchClients();
  }, []);

  const handleEditClick = (client: Client) => {
    setEditingClientId(client.id);
    setFormData(client);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async () => {
    try {
      const data = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        postal_code: formData.postal_code,
        ice: formData.ice,
        tax: formData.tax,
      };
      const updatedClient = await pb
        .collection("clients")
        .update(editingClientId!, data);

      setClients((prevClients) =>
        prevClients.map((client) =>
          client.id === editingClientId ? { ...client, ...formData } : client
        )
      );
      setEditingClientId(null);
      setFormData({});
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  const handleCancelClick = () => {
    setEditingClientId(null);
    setFormData({});
  };
  const handleNewClientClick = () => {
    const mockClient = generateMockClients(1)[0];
    setFormData(mockClient);
    // setFormData({});
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData({});
  };

  const handleNewClientSave = async () => {
    try {
      // formData.tax ||= 0;
      const company = pb.authStore.record?.company;
      if (!company) {
        throw new Error(t("errors.noCompany", { ns: "clients" }));
      }
      const data = {
        company: company,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        postal_code: formData.postal_code,
        ice: formData.ice,
        tax: formData.tax,
      };
      const newClient = await pb.collection("clients").create(data);

      setIsModalOpen(false);
      setFormData({});
      const allClients = await getAllClients();
      setClients(allClients);
    } catch (error) {
      console.error("Error creating client:", error);
    }
  };

  return (
    <Protected>
      {errorMessage && <ErrorAlert message={errorMessage} />}
      <div className="flex flex-col items-center justify-between">
        <div className="flex justify-between w-full items-center my-8 px-4">
          <h1 className="text-3xl font-bold">
            {t("title", { ns: "clients" })}
          </h1>

          <button className="btn btn-secondary" onClick={handleNewClientClick}>
            {t("new", { ns: "clients" })}
          </button>
        </div>
        <div className={`modal ${isModalOpen ? "modal-open" : ""}`}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              {t("newClient", { ns: "clients" })}
            </h3>
            <form>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    {t("form.name", { ns: "clients" })}
                  </span>
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
                  <span className="label-text">{t("clients.form.email")}</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t("clients.form.phone")}</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    {t("clients.form.address")}
                  </span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t("clients.form.city")}</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ""}
                  onChange={handleInputChange}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    {t("clients.form.country")}
                  </span>
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country || ""}
                  onChange={handleInputChange}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    {t("clients.form.postalCode")}
                  </span>
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code || ""}
                  onChange={handleInputChange}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t("clients.form.ice")}</span>
                </label>
                <input
                  type="text"
                  name="ice"
                  value={formData.ice || ""}
                  onChange={handleInputChange}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t("clients.form.tax")}</span>
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
              <button className="btn btn-primary" onClick={handleNewClientSave}>
                {t("actions.save", { ns: "clients" })}
              </button>
              <button className="btn" onClick={handleModalClose}>
                {t("actions.cancel", { ns: "clients" })}
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th style={{ width: "1.5rem" }}></th>
                <th>{t("form.name", { ns: "clients" })}</th>
                <th>{t("form.email", { ns: "clients" })}</th>
                <th>{t("form.phone", { ns: "clients" })}</th>
                <th>{t("form.address", { ns: "clients" })}</th>
                <th>{t("form.city", { ns: "clients" })}</th>
                <th>{t("form.country", { ns: "clients" })}</th>
                <th>{t("form.postalCode", { ns: "clients" })}</th>
                <th>{t("form.ice", { ns: "clients" })}</th>
                <th>{t("form.tax", { ns: "clients" })}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients
                .filter((client) => client)
                .map((client, index) => (
                  <tr key={client.id}>
                    <th>{index + 1}</th>
                    <td>
                      {editingClientId === client.id ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name || ""}
                          onChange={handleInputChange}
                          className="input input-bordered w-full m-0 p-1"
                          style={{ whiteSpace: "pre-wrap" }}
                        />
                      ) : (
                        client.name
                      )}
                    </td>
                    <td>
                      {editingClientId === client.id ? (
                        <input
                          type="email"
                          name="email"
                          value={formData.email || ""}
                          onChange={handleInputChange}
                          className="input input-bordered w-full m-0 p-1 input-wrap"
                          style={{ whiteSpace: "pre-wrap" }}
                        />
                      ) : (
                        client.email
                      )}
                    </td>
                    <td>
                      {editingClientId === client.id ? (
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone || ""}
                          onChange={handleInputChange}
                          className="input input-bordered w-full m-0 p-1 input-wrap"
                          style={{ whiteSpace: "pre-wrap" }}
                        />
                      ) : (
                        client.phone
                      )}
                    </td>
                    <td>
                      {editingClientId === client.id ? (
                        <input
                          type="text"
                          name="address"
                          value={formData.address || ""}
                          onChange={handleInputChange}
                          className="input input-bordered w-full m-0 p-1 input-wrap"
                          style={{ whiteSpace: "pre-wrap" }}
                        />
                      ) : (
                        client.address
                      )}
                    </td>
                    <td>
                      {editingClientId === client.id ? (
                        <input
                          type="text"
                          name="city"
                          value={formData.city || ""}
                          onChange={handleInputChange}
                          className="input input-bordered w-full p-1 input-wrap"
                          style={{ whiteSpace: "pre-wrap" }}
                        />
                      ) : (
                        client.city
                      )}
                    </td>
                    <td>
                      {editingClientId === client.id ? (
                        <input
                          type="text"
                          name="country"
                          value={formData.country || ""}
                          onChange={handleInputChange}
                          className="input input-bordered p-1 input-wrap"
                          style={{ whiteSpace: "pre-wrap" }}
                        />
                      ) : (
                        client.country
                      )}
                    </td>
                    <td>
                      {editingClientId === client.id ? (
                        <input
                          type="text"
                          name="postal_code"
                          value={formData.postal_code || ""}
                          onChange={handleInputChange}
                          className="input input-bordered m-0 p-1 input-wrap"
                          style={{ whiteSpace: "pre-wrap" }}
                        />
                      ) : (
                        client.postal_code
                      )}
                    </td>
                    <td>
                      {editingClientId === client.id ? (
                        <input
                          type="text"
                          name="ice"
                          value={formData.ice || ""}
                          onChange={handleInputChange}
                          className="input input-bordered m-0 p-1 input-wrap"
                          style={{ whiteSpace: "pre-wrap" }}
                        />
                      ) : (
                        client.ice
                      )}
                    </td>
                    <td>
                      {editingClientId === client.id ? (
                        <input
                          type="number"
                          name="tax"
                          value={formData.tax || 0}
                          onChange={handleInputChange}
                          className="input input-bordered m-0 p-1 input-wrap"
                          style={{ whiteSpace: "pre-wrap" }}
                        />
                      ) : (
                        client.tax
                      )}
                    </td>
                    <td>
                      {editingClientId === client.id ? (
                        <div className="flex justify-center flex-col gap-1 items-center">
                          <button
                            className="btn btn-accent"
                            onClick={handleSaveClick}
                          >
                            {t("actions.save", { ns: "clients" })}
                          </button>
                          <button className="btn" onClick={handleCancelClick}>
                            {t("clients.actions.cancel")}
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-accent"
                          onClick={() => handleEditClick(client)}
                        >
                          {t("actions.edit", { ns: "clients" })}
                        </button>
                      )}
                    </td>

                    <td>
                      <button
                        className="btn btn-error"
                        onClick={async () => {
                          try {
                            await pb.collection("clients").delete(client.id);
                          } catch (error) {
                            if (error instanceof ClientResponseError) {
                              setErrorMessage(
                                "Product can't be deleted because it's referenced in an invoice"
                              );
                              setTimeout(() => setErrorMessage(null), 3000);
                            } else if (error instanceof Error) {
                              setErrorMessage(error.message);
                            }
                          }
                        }}
                      >
                        {t("actions.delete", { ns: "clients" })}
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
