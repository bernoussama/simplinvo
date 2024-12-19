import { useState } from "react";
import { MetaFunction } from "@remix-run/node";
import { generateMockClients, Client } from "@/utils/schemas";
import Protected from "@/components/Protected";
export const meta: MetaFunction = () => {
  return [
    { title: "Clients" },
    { name: "description", content: "Clients page" },
  ];
};
// import "./clients.css";

const mockClients: Client[] = generateMockClients(10);

export default function Clients() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({});

  const handleEditClick = (client: Client) => {
    setEditingClientId(client.id);
    setFormData(client);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = () => {
    console.log(clients);
    setClients((prevClients) =>
      prevClients.map((client) =>
        client.id === editingClientId ? { ...client, ...formData } : client
      )
    );
    setEditingClientId(null);
    setFormData({});
  };

  const handleCancelClick = () => {
    setEditingClientId(null);
    setFormData({});
  };
  return (
    <Protected>
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">Clients</h1>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            {/* head */}
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>City</th>
                <th>Country</th>
                <th>Postal Code</th>
                <th>ICE</th>
                <th>Tax</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => (
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
                        name="postalCode"
                        value={formData.postalCode || ""}
                        onChange={handleInputChange}
                        className="input input-bordered m-0 p-1 input-wrap"
                        style={{ whiteSpace: "pre-wrap" }}
                      />
                    ) : (
                      client.postalCode
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
                          Save
                        </button>
                        <button className="btn" onClick={handleCancelClick}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleEditClick(client)}
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
