import AuthForm from "../../components/forms/AuthForm";
import "./auth.css";

const Register = () => (
  <AuthForm
    title="Register"
    subtitle="Create your kanban account"
    endpoint="/users/register"
    initialValues={{ name: "", email: "", password: "" }}
    fields={[
      { id: "register-name", label: "Name", type: "text", name: "name", placeholder: "Enter Name" },
      { id: "register-email", label: "Email", type: "email", name: "email", placeholder: "Enter Email" },
      { id: "register-password", label: "Password", type: "password", name: "password", placeholder: "Enter Password" }
    ]}
    submitText="Register"
    loadingText="Registering..."
    errorText="Register failed"
    switchText="Already have an account?"
    switchLink="/login"
    switchLinkText="Login"/>
);

export default Register;
