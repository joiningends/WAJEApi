import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Hidden,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { Link, Outlet, useNavigate } from "react-router-dom";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";

const drawerWidth = 200;

const styles = {
  root: {
    flexGrow: 1,
  },
  appBar: {
    backgroundColor: "#2196F3",
  },
  title: {
    flexGrow: 1,
    fontSize: "1.5rem",
  },
  navButton: {
    fontSize: "1rem",
    marginLeft: 15,
  },
  menuButton: {
    marginRight: 15,
  },
  list: {
    width: drawerWidth,
    backgroundColor: "#f5f5f5",
  },
};

function NavigationBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve the userRole from localStorage
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  const drawer = (
    <div style={styles.list}>
      <List>
        {userRole === "admin" && (
          <ListItem button>
            <ListItemText primary={<Link to="/home">Home</Link>} />
          </ListItem>
        )}
        {userRole === "user" && (
          <>
            <ListItem button>
              <ListItemText primary={<Link to="/Contacts">Contacts</Link>} />
            </ListItem>
            <ListItem button>
              <ListItemText
                primary={
                  <Button
                    color="inherit"
                    style={styles.navButton}
                    onClick={handleLogout}
                  >
                    <ExitToAppIcon />
                    Logout
                  </Button>
                }
              />
            </ListItem>
          </>
        )}
      </List>
    </div>
  );

  return (
    <div style={styles.root}>
      <AppBar position="static" style={styles.appBar}>
        <Toolbar>
          <Hidden mdUp>
            <IconButton
              edge="start"
              style={styles.menuButton}
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          </Hidden>
          <Hidden smDown>
            {userRole === "admin" && (
              <Button color="inherit" style={styles.navButton}>
                <Link to="/home">Home</Link>
              </Button>
            )}
            {userRole === "user" && (
              <>
                <Button color="inherit" style={styles.navButton}>
                  <Link to="/Contacts">Contacts</Link>
                </Button>
                <Button
                  color="inherit"
                  style={styles.navButton}
                  onClick={handleLogout}
                >
                  <ExitToAppIcon />
                  Logout
                </Button>
              </>
            )}
          </Hidden>
        </Toolbar>
      </AppBar>
      <Hidden mdUp>
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {drawer}
        </Drawer>
      </Hidden>
      <Outlet />
    </div>
  );
}

export default NavigationBar;
