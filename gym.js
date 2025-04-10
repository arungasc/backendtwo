import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.URL);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};
connectToDatabase();

// Schema & Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  pwd: { type: String, required: true },
  pno: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

// Create Account Route
app.post("/post", async (req, res) => {
  const { name, email, pwd, pno } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { pno }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or phone already registered" });
    }

    const newUser = new User({ name, email, pwd, pno });
    await newUser.save();
    res.status(200).json({ message: "Create account success" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
// Login route
app.post('/login', async (req, res) => {
  const { userInput, pwd } = req.body;
  const user = await User.findOne({ 
    $or: [{ email: userInput }, { pno: userInput }], 
    pwd 
  });

  if (user) {
    res.json({ message: "Login success", name: user.name });  // name send pannunga
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});


const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
