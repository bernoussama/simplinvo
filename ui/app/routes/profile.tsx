import React, { useState, useEffect } from "react";
import { pb } from "@/lib/pocketbase"; // Assuming you are using PocketBase for data fetching

interface Company {
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
}

export const Profile: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<Partial<Company>>({});

  useEffect(() => {
    const fetchCompany = async () => {
      const companyData = await pb
        .collection("companies")
        .getOne(pb.authStore.record?.company);
      setCompany(companyData as unknown as Company);
      setFormData(companyData);
    };

    fetchCompany();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (company) {
      await pb.collection("companies").update(company.id, formData);
      const updatedCompany = await pb
        .collection("companies")
        .getOne(company.id);
      setCompany(updatedCompany);
    }
  };

  if (!company) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Company Profile</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>
        <div className="form-control">
          <label className="label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>
        <div className="form-control">
          <label className="label">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone || ""}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>
        <div className="form-control">
          <label className="label">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address || ""}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>
        <div className="form-control">
          <label className="label">City</label>
          <input
            type="text"
            name="city"
            value={formData.city || ""}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>
        <div className="form-control">
          <label className="label">Country</label>
          <input
            type="text"
            name="country"
            value={formData.country || ""}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>
        <div className="form-control">
          <label className="label">Postal Code</label>
          <input
            type="text"
            name="postal_code"
            value={formData.postal_code || ""}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>
        <div className="form-control">
          <label className="label">ICE</label>
          <input
            type="text"
            name="ice"
            value={formData.ice || ""}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>
        <div className="form-control">
          <label className="label">Tax</label>
          <input
            type="number"
            name="tax"
            value={formData.tax || ""}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>
        <div className="col-span-2">
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
