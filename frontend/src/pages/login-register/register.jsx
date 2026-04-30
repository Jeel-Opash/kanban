import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/users/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-5">
      <div className="w-full max-w-[400px] bg-white p-10 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl grid place-items-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1.5">Join thousands of teams managing projects better.</p>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-semibold">{error}</div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-900">Full Name</label>
            <input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required
              className="h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-900">Email Address</label>
            <input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-900">Password</label>
            <input type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
          </div>
          <button type="submit" className="h-11 mt-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 border-none text-sm">
            Get Started
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-bold no-underline hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
