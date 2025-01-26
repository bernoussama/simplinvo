/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState } from "react";
import { pb } from "@/lib/pocketbase";
import { useNavigate } from "react-router-dom";
import ErrorAlert from "@/components/ErrorAlert";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);
      console.log("User logged in successfully:", authData);
      //redirect to dashboard
      if (authData.record.company == "") {
        navigate("/new-company");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error logging in user:", error);
      setErrorMessage("Invalid email or password");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  return (
    <div>
      {errorMessage && <ErrorAlert message={errorMessage} />}
      <div className="flex justify-center items-center min-h-screen">
        <div className="card w-96 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-center">Login</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
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
              <div className="form-control mt-6">
                <button className="btn btn-primary">Login</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
