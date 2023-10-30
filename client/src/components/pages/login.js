import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
} from "@material-ui/core";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const [token, setToken] = useState("");
  const navigate = useNavigate();

  const handleEmailChange = e => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = e => {
    setPassword(e.target.value);
  };

  const handleLogin = async () => {
    const data = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch("http://localhost:4000/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setToken(result.token);

        localStorage.setItem("token", result.token);
        localStorage.setItem("role", result.role);

        if (result.role === "admin") {
          window.location.href = "/home";
        } else {
          localStorage.setItem("userId", result.userId);
          window.location.href = "/Contacts";
        }
      } else {
        setError("Invalid email or password");
      }
    } catch (error) {
      console.error("Error occurred during login:", error);
      setError("Failed to log in. Please try again later.");
    }
  };

  useEffect(() => {
    setError(null);

    if (token) {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        setToken("");
        navigate("/");
      }
    }
  }, [token, navigate]);

  return (
    <Container
      component="main"
      maxWidth="xs"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Typography
        component="h1"
        variant="h2"
        style={{ color: "#FF0000", fontSize: "2rem", animation: "fadeIn 2s" }}
      >
        JoiningEnds
      </Typography>
      <Paper elevation={3} style={{ padding: "24px", width: "100%" }}>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <form>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={handleEmailChange}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
          <Button
            type="button"
            fullWidth
            variant="contained"
            color="primary"
            style={{ margin: "16px 0" }}
            onClick={handleLogin}
          >
            Login
          </Button>
        </form>
        <Typography>
          Don't have an account?{" "}
          <Link
            component={Button}
            variant="outlined"
            color="primary"
            onClick={() => navigate("/register")}
          >
            Register
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}

export default Login;
