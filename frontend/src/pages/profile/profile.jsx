import { useState, useEffect } from "react";
import api from "../../api/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users/me").then((r) => { setUser(r.data); setName(r.data.name); setEmail(r.data.email); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const r = await api.patch("/users/me", { name });
      setUser(r.data.user);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) { setMessage(err.response?.data?.message || "Failed to update profile"); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api.patch("/users/me/password", { currentPassword, newPassword });
      setMessage("Password changed successfully!");
      setCurrentPassword(""); setNewPassword("");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) { setMessage(err.response?.data?.message || "Failed to change password"); }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading profile...</div>;

  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase() : "U";

  const inputCls = "h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 bg-white w-full";
  const labelCls = "text-[13px] font-semibold text-slate-900";
  const sectionCls = "bg-white border border-slate-200 rounded-2xl p-8 shadow-sm";

  return (
    <div className="max-w-3xl mx-auto p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your public profile and security preferences.</p>
      </header>

      {message && <div className="mb-5 px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">{message}</div>}

      <div className="flex flex-col gap-6">
        <section className={sectionCls}>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Personal Information</h2>
            <p className="text-sm text-slate-500">This information will be displayed to your teammates.</p>
          </div>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full grid place-items-center text-white text-3xl font-extrabold bg-blue-600 shadow-md shrink-0">
              {initials}
            </div>
            <div className="flex flex-col gap-2.5">
              <button className="h-9 px-4 bg-transparent text-blue-600 border border-blue-200 rounded-lg text-sm font-semibold hover:bg-blue-50">Upload new photo</button>
              <button className="h-9 px-4 bg-transparent text-red-500 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-50">Remove</button>
            </div>
          </div>
          <form onSubmit={updateProfile}>
            <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Display Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Email Address</label>
                <input value={email} disabled className={`${inputCls} bg-slate-50 cursor-not-allowed`} />
              </div>
            </div>
            <div className="flex justify-end mt-6 pt-5 border-t border-slate-100">
              <button type="submit" className="h-9 px-5 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 border-none">Save Changes</button>
            </div>
          </form>
        </section>

        <section className={sectionCls}>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Security</h2>
            <p className="text-sm text-slate-500">Update your password to keep your account secure.</p>
          </div>
          <form onSubmit={changePassword}>
            <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" className={inputCls} />
              </div>
            </div>
            <div className="flex justify-end mt-6 pt-5 border-t border-slate-100">
              <button type="submit" className="h-9 px-5 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 border-none">Update Password</button>
            </div>
          </form>
        </section>

        <section className="bg-[#fffafb] border border-red-200 rounded-2xl p-8 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-red-600 mb-1">Delete Account</h2>
            <p className="text-sm text-slate-500">Permanently remove your account and all associated data.</p>
          </div>
          <button className="h-9 px-5 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 border-none">Delete My Account</button>
        </section>
      </div>
    </div>
  );
};

export default Profile;
