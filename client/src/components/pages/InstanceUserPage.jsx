import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Grid,
  Container,
  Typography,
  Snackbar,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
} from "@material-ui/core";
import axios from "axios";
import { useParams } from "react-router-dom";

function InstanceUserPage() {
  const { userId } = useParams();

  const [formData, setFormData] = useState({
    instance_id: "",
    sectionId: "",
    message: "",
    minIntervalMs: "",
    mediaFile: null, // New field for media file
  });

  const [sections, setSections] = useState([]);
  const [open, setOpen] = useState(false);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:4000/api/v1/sections/users/${userId}`)
      .then(response => {
        setSections(response.data);
      })
      .catch(error => {
        console.error("Failed to fetch sections:", error);
      });
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name !== "minIntervalMs" && value.length > 0) {
      setWarning(`Warning: You entered ${value} in the ${name} field.`);
    } else {
      setWarning("");
    }

    if (name === "minIntervalMs") {
      setWarning("");
    }
  };

  const handleMediaFileChange = e => {
    setFormData({
      ...formData,
      mediaFile: e.target.files[0], // Store the selected media file
    });
  };

  const handleMinIntervalKeyPress = e => {
    if (e.key === "Enter") {
      if (formData.minIntervalMs < 30000) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSuccess = () => {
    setOpen(true);
    setWarning("");
  };

  const handleFailure = () => {
    setOpen(true);
    setWarning("Unable to process your request. Please try again later.");
  };

  const handleSectionChange = e => {
    setFormData({
      ...formData,
      sectionId: e.target.value,
    });
  };

  const handleSubmit = () => {
    console.log("Form Data:", formData);
  
    if (!validateNumber(formData.minIntervalMs)) {
      setWarning("Min Interval (ms) should be a numeric value.");
    } else if (formData.minIntervalMs < 30000) {
      handleFailure();
    } else {
      const data = new FormData();
      data.append("instance_id", formData.instance_id);
      data.append("sectionId", formData.sectionId);
      data.append("message", formData.message);
      data.append("minIntervalMs", formData.minIntervalMs);
      data.append("file", formData.mediaFile);
  
      axios
        .post("http://localhost:4000/api/v1/wa/media", data)
        .then(() => {
          console.log("Request Success");
          setFormData({
            instance_id: "",
            sectionId: "",
            message: "",
            minIntervalMs: "",
            mediaFile: null,
          });
          handleSuccess();
        })
        .catch((error) => {
          console.log("Request Error:", error);
          handleFailure();
        });
    }
  };
  

  const validateNumber = value => {
    return /^[0-9]*$/.test(value);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Instance User Page
      </Typography>
      <Paper elevation={3} style={{ padding: "16px" }}>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instance ID"
                name="instance_id"
                value={formData.instance_id}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Min Interval (ms)"
                name="minIntervalMs"
                value={formData.minIntervalMs}
                onChange={handleChange}
                onKeyPress={handleMinIntervalKeyPress}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel htmlFor="sectionId">Section</InputLabel>
                <Select
                  fullWidth
                  label="Section"
                  name="sectionId"
                  value={formData.sectionId}
                  onChange={handleSectionChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {sections.map(section => (
                    <MenuItem key={section._id} value={section._id}>
                      {section.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <input
                type="file"
                accept=".jpg, .jpeg, .png, .gif, .pdf, .doc, .docx, .xls, .xlsx" // Define accepted file types
                onChange={handleMediaFileChange}
              />
            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            style={{ marginTop: "1vh" }}
          >
            Submit
          </Button>
        </form>
      </Paper>
      <Snackbar open={open} autoHideDuration={4000} onClose={handleClose}>
        <div
          style={{
            backgroundColor: "#f44336",
            color: "white",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          {warning || "Unable to process your request. Please try again later."}
        </div>
      </Snackbar>
    </Container>
  );
}

export default InstanceUserPage;
