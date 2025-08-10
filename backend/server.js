require("dotenv").config();
console.log("Loaded MONGO_URI:", process.env.MONGO_URI); // Add this line
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();
connectDB();

const corsOptions = {
  origin: "*", // allow all origins
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// app.use(cors({ origin: '*' })); // Enable CORS for all origins

// app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Update CORS configuration if needed
// app.use(
//   cors({
//     origin: "http://localhost:3000", // or your frontend URL
//     credentials: true,
//   })
// );

app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.path}`);
  console.log("Headers:", req.headers);
  // console.log("Body:", req.body);
  next();
});
// Serve static files from React build folder
app.use(express.static(path.join(__dirname, "../client/build")));

// Handle client-side routing - return index.html for all routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
// app.use("/api", require("./routes/taskRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes")); // Explicitly map /api/tasks

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
