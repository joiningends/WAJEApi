import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Container,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  withStyles,
} from "@material-ui/core";

const tableStyle = {
  marginTop: 20,
  border: "1px solid #ccc",
  borderRadius: 8,
};

const styles = theme => ({
  tableContainer: {
    borderRadius: 8,
    boxShadow: "0 0 10px 0 rgba(0,0,0,0.1)",
  },
  tableHeadCell: {
    fontWeight: "bold",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  tableRow: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  uploadButton: {
    marginRight: theme.spacing(1),
  },
  viewButton: {
    marginLeft: theme.spacing(1),
  },
  sendTextButton: {
    marginLeft: theme.spacing(1),
  },
  dialogTable: {
    marginTop: theme.spacing(2),
  },
});

function Contacts({ classes }) {
  const [groupName, setGroupName] = useState("");
  const [userId, setUserId] = useState("");
  const [sections, setSections] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [viewData, setViewData] = useState({
    sectionId: null,
    recipientNumbers: [],
  });
  const [openViewDialog, setOpenViewDialog] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:4000/api/v1/sections/users/${userId}`)
      .then(response => {
        setSections(response.data);
      })
      .catch(error => {
        console.error("GET sections request error", error);
      });

    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
  }, [userId]);

  const handleGroupNameChange = e => {
    setGroupName(e.target.value);
  };

  const handleCreateGroup = () => {
    if (groupName.trim() === "") {
      alert("Group name cannot be empty.");
      return;
    }
    axios
      .post(`http://localhost:4000/api/v1/sections/${userId}`, {
        name: groupName,
      })
      .then(response => {
        console.log("POST request successful", response.data);
        setGroupName("");
        window.location.reload();
      })
      .catch(error => {
        console.error("POST request error", error);
      });
  };

  const handleFileChange = (event, sectionId) => {
    const file = event.target.files[0];
    setSelectedFiles({ ...selectedFiles, [sectionId]: file });
  };

  const handleFileUpload = sectionId => {
    const file = selectedFiles[sectionId];

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    axios
      .post(`http://localhost:4000/api/v1/numbers/${sectionId}`, formData)
      .then(response => {
        console.log("File upload successful", response.data);
        setSelectedFiles({ ...selectedFiles, [sectionId]: null });
      })
      .catch(error => {
        console.error("File upload error", error);
      });
  };

  const handleViewRecipientNumbers = async sectionId => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/v1/numbers/sections/${sectionId}`
      );
      setViewData({
        sectionId,
        recipientNumbers: response.data.recipientNumbers,
      });
      setOpenViewDialog(true);
    } catch (error) {
      console.error("View request error", error);
    }
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
  };

  const handleSendText = sectionId => {
    // Replace the URL with the actual URL you want to open
    const textMessageUrl = `/textMessage/${userId}`;

    // Use window.open to open the URL in a new tab/window
    window.open(textMessageUrl, "_blank");
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4">Contacts</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Create a group"
            variant="outlined"
            fullWidth
            value={groupName}
            onChange={handleGroupNameChange}
            style={{ marginTop: "1.5rem" }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateGroup}
            style={{ marginBottom: "2rem", marginTop: "1rem" }}
          >
            Create Group
          </Button>
        </Grid>
      </Grid>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className={classes.tableHeadCell}>SNO</TableCell>
              <TableCell className={classes.tableHeadCell}>
                Group Name
              </TableCell>
              <TableCell className={classes.tableHeadCell}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sections?.map((section, index) => (
              <TableRow key={section._id} className={classes.tableRow}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{section.name}</TableCell>
                <TableCell>
                  <label>
                    <input
                      type="file"
                      hidden
                      onChange={e => handleFileChange(e, section._id)}
                      accept=".xlsx, .xls"
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      component="span"
                      onClick={() => handleFileUpload(section._id)}
                      className={classes.uploadButton}
                    >
                      Upload Excel
                    </Button>
                  </label>
                  {selectedFiles[section._id] && (
                    <div>Selected File: {selectedFiles[section._id].name}</div>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.viewButton}
                    onClick={() => handleViewRecipientNumbers(section._id)}
                    style={{ width: "10vw" }}
                  >
                    View
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.sendTextButton}
                    onClick={() => handleSendText(section._id)}
                    style={{ width: "10vw" }}
                  >
                    Send Text
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog}>
        <DialogTitle>Recipient Numbers</DialogTitle>
        <DialogContent className={classes.dialogTable}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.tableHeadCell}>SNO</TableCell>
                  <TableCell className={classes.tableHeadCell}>
                    Phone Number
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {viewData.recipientNumbers.map((phoneNumber, index) => (
                  <TableRow key={index} className={classes.tableRow}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{phoneNumber}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default withStyles(styles)(Contacts);
