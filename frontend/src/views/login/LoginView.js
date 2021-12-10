import LoginComponent from "../../components/loginForm/LoginComponent";
import { Container } from "react-bootstrap";
import NavbarComponent from "../../components/navbar/NavbarComponent";

const LoginView = () => {
  return (
    <Container
      style={{
        marginTop: "200px",
        position: "relative",
        left: "50%",
        top: "33%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <LoginComponent />
    </Container>
  );
};

export default LoginView;
