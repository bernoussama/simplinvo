/* eslint-disable jsx-a11y/label-has-associated-control */
import { MetaFunction } from "@remix-run/node";
import { pb } from "@/lib/pocketbase";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [{ title: "Join" }, { name: "description", content: "Join page" }];
};

export default function Join() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const data = {
      password: password,
      passwordConfirm: passwordConfirm,
      email: email,
      emailVisibility: true,
      verified: false,
      name: name,
      // company: "RELATION_RECORD_ID",
    };

    try {
      const record = await pb.collection("users").create(data);
      // await pb.collection("users").requestVerification(email);
      console.log("User created successfully:", record);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <>
      <h2 className="card-title text-center text-2xl">Join</h2>
      <div className="flex justify-center items-center min-h-screen">
        <div className="card w-96 shadow-xl">
          <div className="card-body">
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
                  <span className="label-text">Email</span>
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email"
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm Password</span>
                </label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="confirm password"
                  className="input input-bordered"
                />
              </div>
              <div className="form-control mt-6">
                <button className="btn btn-primary">Sign Up</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
