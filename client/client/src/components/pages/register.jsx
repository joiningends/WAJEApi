import React, { useState, useCallback } from "react";
import {
  Button,
  Container,
  CssBaseline,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import {
  AccountCircle,
  Email,
  Visibility,
  VisibilityOff,
  LockOutlined,
} from "@mui/icons-material";
import "./Register.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
};

const formStyle = {
  width: "100%",
  marginTop: "8px",
};

const submitButtonStyle = {
  margin: "16px 0 8px",
};

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reenterPassword, setReenterPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showReenterPassword, setShowReenterPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleValidation = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    if (!name) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    if (password !== reenterPassword) {
      newErrors.reenterPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [name, email, password, reenterPassword]);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleReenterPasswordVisibility = () => {
    setShowReenterPassword(!showReenterPassword);
  };

  const handleRegister = () => {
    if (handleValidation()) {
      const userData = {
        name: name,
        email: email,
        password: password,
      };

      fetch("http://localhost:4000/api/v1/users", {
        method: "POST",
        body: JSON.stringify(userData),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(response => {
          if (response.ok) {
            // Registration was successful
            toast.success("Registration successful!");
            // You can navigate to another page or show a success message here.
            setName("");
            setEmail("");
            setPassword("");
            setReenterPassword("");
          } else {
            // Registration failed
            toast.error("Registration failed");
            // You can handle error cases here.
          }
        })
        .catch(error => {
          toast.error("Error: " + error.message);
          // Handle network errors here
        });
    }
  };

  return (
    <>
      <ToastContainer />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div style={containerStyle} className="registration-container">
          <div className="registration-card">
            <Typography
              component="h1"
              variant="h4"
              className="registration-title"
            >
              Register
            </Typography>
            <form style={formStyle} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    id="name"
                    label="Name"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    InputProps={{
                      startAdornment: <AccountCircle />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: <Email />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                      startAdornment: <LockOutlined />,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    name="reenterPassword"
                    label="Re-enter Password"
                    type={showReenterPassword ? "text" : "password"}
                    id="reenterPassword"
                    value={reenterPassword}
                    onChange={e => setReenterPassword(e.target.value)}
                    error={!!errors.reenterPassword}
                    helperText={errors.reenterPassword}
                    InputProps={{
                      startAdornment: <LockOutlined />,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleToggleReenterPasswordVisibility}
                            edge="end"
                          >
                            {showReenterPassword ? (
                              <Visibility />
                            ) : (
                              <VisibilityOff />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
              <Button
                type="button"
                fullWidth
                variant="contained"
                color="primary"
                style={submitButtonStyle}
                onClick={handleRegister}
                className="registration-button"
              >
                Register
              </Button>
            </form>
            <Button
              type="button"
              fullWidth
              variant="outlined"
              color="primary"
              style={submitButtonStyle}
              onClick={() => navigate("/")}
            >
              Back to Login
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}

export default Register;
