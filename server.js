// ===== IMPORTS =====
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

// ===== APP INIT =====
const app = express();
const PORT = 5000;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== MONGODB CONNECTION =====
mongoose.connect("mongodb://127.0.0.1:27017/interiorDB")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ===== USER MODEL =====
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = mongoose.model("User", UserSchema);

// ===== REGISTER ROUTE =====
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.send("User registered successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ===== LOGIN ROUTE =====
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ message: "Wrong password" });
    }

    res.json({ message: "Login successful" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== KNN DATASET =====
const dataset = [
  { features: [5.1, 3.5, 1.4, 0.2], label: "setosa" },
  { features: [7.0, 3.2, 4.7, 1.4], label: "versicolor" },
  { features: [6.3, 3.3, 6.0, 2.5], label: "virginica" }
];

// ===== DISTANCE FUNCTION =====
function euclideanDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

// ===== KNN FUNCTION =====
function knnPredict(input, k = 3) {
  const distances = dataset.map(item => ({
    label: item.label,
    distance: euclideanDistance(item.features, input)
  }));

  distances.sort((a, b) => a.distance - b.distance);

  const topK = distances.slice(0, k);

  const counts = {};
  topK.forEach(neighbor => {
    counts[neighbor.label] = (counts[neighbor.label] || 0) + 1;
  });

  return Object.keys(counts).reduce((a, b) =>
    counts[a] > counts[b] ? a : b
  );
}

// ===== KNN ROUTE =====
app.post("/predict", (req, res) => {
  const inputFeatures = req.body.features;

  if (!inputFeatures || !Array.isArray(inputFeatures)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const prediction = knnPredict(inputFeatures, 3);

  res.json({ prediction });
});

// ===== SERVER START =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});