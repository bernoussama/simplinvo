/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from "react";
import { fetchStampImage, pb } from "@/lib/pocketbase"; // Assuming you are using PocketBase for data fetching
import { useTranslation } from "react-i18next";
import SuccessAlert from "@/components/SuccessAlert";
import ErrorAlert from "@/components/ErrorAlert";

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
  header: File | null;
  stamp: File | null;
}

const Profile: React.FC = () => {
  const { t } = useTranslation("profile");
  const [company, setCompany] = useState<Company | null>(null);
  const [header_url, setHeaderUrl] = useState<string>("");
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [stampUrl, setStampUrl] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCompany = async () => {
    const companyData = await pb
      .collection("companies")
      .getOne(pb.authStore.record?.company);
    setCompany(companyData as unknown as Company);
    setFormData(companyData);
  };

  useEffect(() => {
    fetchCompany();
    (async () => {
      const url = await fetchHeaderImage(company);
      const stamp = await fetchStampImage(company!.id);
      setHeaderUrl(url);
      setStampUrl(stamp);
    })();
  }, [company]);

  const fetchHeaderImage = async (company: Company | null) => {
    const record = await pb.collection("companies").getOne(company!.id);
    const headerFilename = record.header;
    const url = pb.files.getURL(record, headerFilename, {
      thumb: "100x250",
    });
    return url;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const name = e.target.name;

      setFormData({ ...formData, [name]: e.target.files[0] });
    }
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 3000); // Hide alert after 3 seconds
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (company) {
      try {
        const update = await pb
          .collection("companies")
          .update(company.id, formData);
        if (!update.code) {
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000); // Hide alert after 3 seconds
        }
      } catch (e) {
        showError(e.message);
      }
      fetchCompany();
    }
  };

  if (!company) {
    return <div>{t("loading")}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {showAlert && <SuccessAlert />}
      {errorMessage && <ErrorAlert message={errorMessage} />}
      <div className="flex w-full justify-between items-center">
        <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>

        <div className="form-control">
          <button
            type="submit"
            className="btn btn-primary"
            onClick={handleSubmit}
          >
            {t("saveChanges")}
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">{t("name")}</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>
        <div className="form-control">
          <label className="label">{t("email")}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>
        <div className="form-control">
          <label className="label">{t("phone")}</label>
          <input
            type="text"
            name="phone"
            value={formData.phone || ""}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>
        <div className="form-control">
          <label className="label">{t("address")}</label>
          <input
            type="text"
            name="address"
            value={formData.address || ""}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>
        <div className="form-control">
          <label className="label">{t("city")}</label>
          <input
            type="text"
            name="city"
            value={formData.city || ""}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>
        <div className="form-control">
          <label className="label">{t("country")}</label>
          <input
            type="text"
            name="country"
            value={formData.country || ""}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>
        <div className="form-control">
          <label className="label">{t("postalCode")}</label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode || ""}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>
        <div className="form-control">
          <label className="label">{t("ice")}</label>
          <input
            type="text"
            name="ice"
            value={formData.ice || ""}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>
        <div className="form-control">
          <label className="label">{t("tax")}</label>
          <input
            type="number"
            name="tax"
            value={formData.tax || ""}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>
        <div>
          <div className="form-control">
            <label className="label">{t("companyHeader")}</label>
            <input
              type="file"
              name="header"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input input-bordered"
            />
          </div>
        </div>
        <div>
          <div className="form-control">
            <label className="label">{t("stamp")}</label>
            <input
              type="file"
              name="stamp"
              accept="image/png"
              onChange={handleFileChange}
              className="file-input input-bordered"
            />
          </div>
        </div>
      </form>

      <div className="flex justify-center items-center mt-4">
        <div className="card w-96 shadow-xl bordered">
          <div className="card-body py-4 px-4">
            <h2 className="card-title">{t("companyHeaderPreview")}</h2>
          </div>
          <figure className="w-full m-0">
            <img src={header_url} alt="Company Header" className="w-full" />
          </figure>
        </div>
      </div>
    </div>
  );
};

export default Profile;
