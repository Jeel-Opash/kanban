import AuthForm from "../../components/forms/AuthForm";
import "./auth.css";

const Login = () => (
  <AuthForm
    title="Login"
    subtitle="Enter your account details"
    endpoint="/users/login"
    initialValues={{ email: "", password: "" }}
    fields={[
      { id: "login-email", label: "Email", type: "email", name: "email", placeholder: "Enter Email" },
      { id: "login-password", label: "Password", type: "password", name: "password", placeholder: "Enter Password" }
    ]}
    submitText="Login"
    loadingText="Logging in..."
    errorText="Login failed"
    switchText="Don't have an account?"
    switchLink="/register"
    switchLinkText="Register"
  />
);

export default Login;
