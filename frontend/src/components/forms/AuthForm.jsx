import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../api/api";
import useForm from "../../hooks/useForm";
import FormField from "./FormField";

const AuthForm = ({title,subtitle,fields,initialValues,endpoint,
  submitText,loadingText,errorText,switchText,switchLink,switchLinkText
}) => {
  const navigate = useNavigate();
  const [form, handleChange] = useForm(initialValues);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post(endpoint, form);
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (error) {
      setMessage(error.response?.data?.message || errorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>

          {fields.map((field) => (
            <FormField key={field.name} {...field}
              value={form[field.name]} onChange={handleChange} required/>
          ))}

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? loadingText : submitText}
          </button>

          <p className="auth-switch">
            {switchText} <Link to={switchLink}>{switchLinkText}</Link>
          </p>

          {message && <p className="auth-message">{message}</p>}
        </form>
      </section>
    </main>
  );
};

export default AuthForm;
