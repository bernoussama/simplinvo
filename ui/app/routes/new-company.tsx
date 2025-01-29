/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, pb } from "@/lib/pocketbase";
import Protected from "@/components/Protected";

export default function NewCompany() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [ice, setIce] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const user = getCurrentUser();

    const data = {
      users: [user?.id],
      name: name,
      country: country,
      city: city,
      ice: ice,
      admin: user?.id,
    };

    try {
      const record = await pb.collection("Companies").create(data);
        
      // Update the user's company field
      if (user) {
        await pb.collection("users").update(user.id, { company: record.id });
      } else {
        console.error("User is null, cannot update company field");
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating company:", error);
    }
  };

  return (
    <Protected>
      <div className="flex justify-center items-center min-h-screen">
        <div className="card w-96 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-center">Create Company</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="name"
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Country</span>
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="country"
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">City</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="city"
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">ICE</span>
                </label>
                <input
                  type="text"
                  value={ice}
                  onChange={(e) => setIce(e.target.value)}
                  placeholder="ice"
                  className="input input-bordered"
                />
              </div>
              <div className="form-control mt-6">
                <button className="btn btn-primary">Create Company</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Protected>
  );
}
