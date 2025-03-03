import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  TablePagination,
  Button,
} from "@mui/material";

const Ticket = () => {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchPriority, setSearchPriority] = useState("");
  const [searchEmployee, setSearchEmployee] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // setLoad\ing(true);
        // setSnacbarOpen(true);
        const adminEmail = localStorage.getItem("email"); // Fetch from localStorage
        const token = localStorage.getItem("token"); // Fetch from localStorage
        const response = await axios.get(
          "https://work-sync-gbf0h9d5amcxhwcr.canadacentral-01.azurewebsites.net/admin/api/tickets/",
          {
            params: { adminEmail },
            headers: { Authorization: token },
          }
        );
        setTickets(response.data);
      } catch (err) {
        setError("Failed to fetch tickets. Please try again.");
      } finally {
        // setLoading(false);
        // setSnackbarOpen(false);
      }
    };

    fetchTickets();
  }, []);
  // Filter tickets based on search criteria
  const filteredTickets = tickets.filter((ticket) => {
    const matchesIssue = ticket.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = searchStatus ? ticket.status === searchStatus : true;
    const matchesPriority = searchPriority
      ? ticket.priority === searchPriority
      : true;
    const matchesEmployee = ticket.email
      .toLowerCase()
      .includes(searchEmployee.toLowerCase());
    return matchesIssue && matchesStatus && matchesPriority && matchesEmployee;
  });

  // Handle change in page number
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle change in rows per page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle status change from dropdown
  // Handle status change from dropdown
  const handleStatusChange = async (ticketId, status) => {
    const adminEmail = localStorage.getItem("email");
    const authToken = localStorage.getItem("token");

    if (!adminEmail || !authToken) {
      return alert("Email or Auth Token not found.");
    }

    if (!["OPEN", "IN_PROGRESS", "RESOLVED"].includes(status)) {
      return alert("Invalid status. Choose OPEN, IN_PROGRESS, or RESOLVED.");
    }

    try {
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status } : ticket
        )
      );

      await axios.patch(
        `https://work-sync-gbf0h9d5amcxhwcr.canadacentral-01.azurewebsites.net/admin/api/tickets/status?adminEmail=${adminEmail}&ticketId=${ticketId}&status=${status}`,
        {},
        {
          headers: {
            Authorization: authToken,
          },
        }
      );

      console.log(`Status for ticket ${ticketId} updated to ${status}.`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert(
        `Failed to update status. ${
          error.response?.data?.message || error.message
        }`
      );
      console.log();
    }
  };

  return (
    <div className="p-6">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={2}
      >
        <h2 className="text-xl font-bold mb-4">Employee Tickets</h2>
        <Box
          display="flex"
          gap={2}
          sx={{ width: "800px", justifyContent: "flex-end" }}
        >
          <TextField
            label="Search by Issue"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: "400px" }}
          />
          <TextField
            label="Search by Employee"
            variant="outlined"
            value={searchEmployee}
            onChange={(e) => setSearchEmployee(e.target.value)}
            sx={{ width: "400px" }}
          />
          <FormControl variant="outlined" sx={{ width: "200px" }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="OPEN">Open</MenuItem>
              <MenuItem value="RESOLVED">Resolved</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" sx={{ width: "200px" }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={searchPriority}
              onChange={(e) => setSearchPriority(e.target.value)}
              label="Priority"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      <Paper elevation={3} className="mt-4">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow style={{ backgroundColor: "#f0f0f0" }}>
                <TableCell style={{ fontWeight: "bold" }}>ID</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Email</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Title</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>
                  Description
                </TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Priority</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets.length > 0 ? (
                filteredTickets
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{ticket.id}</TableCell>
                      <TableCell>{ticket.email}</TableCell>
                      <TableCell>{ticket.title}</TableCell>
                      <TableCell>{ticket.description}</TableCell>
                      <TableCell>
                        <span
                          style={{
                            fontWeight: "bold",
                            color:
                              ticket.status === "OPEN"
                                ? "red"
                                : ticket.status === "RESOLVED"
                                ? "green"
                                : "orange",
                          }}
                        >
                          {ticket.status}
                        </span>
                      </TableCell>
                      <TableCell>{ticket.priority}</TableCell>
                      <TableCell>
                        <FormControl
                          variant="outlined"
                          size="small"
                          sx={{ width: "150px" }}
                        >
                          <Select
                            value={ticket.status}
                            onChange={(e) =>
                              handleStatusChange(ticket.id, e.target.value)
                            }
                            label="Status"
                          >
                            <MenuItem value="OPEN">Open</MenuItem>
                            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                            <MenuItem value="RESOLVED">Resolved</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No tickets match the search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={filteredTickets.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default Ticket;
