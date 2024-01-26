const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const userModel = require("./model/userModel");
const bcrypt = require("bcrypt");
const cors = require("cors");
const taskModel = require("./model/taskModel");
const subtaskModel = require("./model/subtaskModel");
const app = express();
const PORT = 3000;

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://Sunny1234:Sunny1234@cluster0.efnjcsl.mongodb.net/sunnyDatabase?retryWrites=true&w=majority"
    );
    console.log("Database connected");
  } catch (err) {
    console.log(err);
  }
};

connectDB();

app.use(express.json());

// app.use(cors({
// 	origin: ["http://localhost:4000"],
// 	methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
// 	credentials: true,
// 	optionsSuccessStatus: 200,
// }));



//Middleware for JWT Authentication
const createAccessToken = (user) => {
  return jwt.sign(
    {
      UserInfo: {
        userId: user._id,
        email: user.email,
      },
    },
    "djhfgugfuiuhvkdbvfvifgifvlbvnfkfrnfrhfnrgn",
    { expiresIn: "3d" }
  );
};

const verifyjwt = (req, res, next) => {
  console.log(req.headers);
  const token = req.headers["accesstoken"];
  jwt.verify(
    token,
    "djhfgugfuiuhvkdbvfvifgifvlbvnfkfrnfrhfnrgn",
    (err, payload) => {
      if (err) {
        console.log(err);
        console.log("jwt token failed from function");
        return res
          .status(403)
          .send({ operation: "error", message: "Token expired or failed" });
      }
      console.log("token verified");
      next();
    }
  );
};


// //Register
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .send({ success: false, message: "All fields are required!" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(401).send({
        success: false,
        message: "User already exists with this email!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({ username, email, password: hashedPassword });
    await user.save();

    return res.status(201).send({
      success: true,
      message: "User registered successfully!",
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "Error in Registration", success: false, error });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password: reqPassword } = req.body;

    if (!email || !reqPassword) {
      return res
        .status(400)
        .send({ success: false, message: "All fields are required" });
    }

    const foundUser = await userModel.findOne({ email });

    if (!foundUser) {
      return res
        .status(401)
        .send({ success: false, message: "Email or password is incorrect!" });
    }

    const isMatch = await bcrypt.compare(reqPassword, foundUser.password);

    if (!isMatch) {
      return res
        .status(401)
        .send({ success: false, message: "Email or password is incorrect!" });
    }

    const accessToken = createAccessToken(foundUser);

    const { password: dbPassword, ...user } = foundUser._doc;

    // res.cookie("jwt", accessToken, {
    //   httpOnly: true,
    //   maxAge: 2 * 24 * 60 * 60 * 1000,
    //   sameSite: "None",
    //   secure: true,
    // });

    return res
      .status(200)
      .send({ success: true, message: "Login successfully", user,accessToken });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .send({ message: "Error in Login", success: false, error: error });
  }
});

// 1.Task
app.post("/tasks", verifyjwt , async (req, res) => {
  try {
    const { userId, title, description } = req.body;
    const newTask = new taskModel({
      title: title,
      user_id: userId,
      description: description,
    });
    await newTask.save();
    res.json(newTask);
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .send({ message: "Error in Login", success: false, error: error });
  }
});

//subtask
app.post("/subtasks/:userId", verifyjwt, async (req, res) => {
  try {
    const { userId, status } = req.body;
    const newTask = new subtaskModel({
      user_id: userId,
      status: status,
    });
    await newTask.save();
    res.json(newTask);
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .send({ message: "Error in Login", success: false, error: error });
  }
});


// 3. Get all user tasks
// app.get('/tasks', verifyjwt, async (req, res) => {
//   try {
//      const { priority, due_date, page, limit } = req.query;
//      const filter = { is_deleted: false, ...(priority && { priority }), ...(due_date && { due_date }) };
//      const tasks = await Task.find(filter).skip((page - 1) * limit).limit(limit);
//      res.json(tasks);
//   } catch (error) {
//     console.log(error.message);
//     return res
//       .status(500)
//       .send({ message: "Error in Login", success: false, error: error });
//   }
// });

// // 4. Get all user subtasks
// app.get('/subtasks', authenticateToken, async (req, res) => {
//   const { task_id } = req.query;
//   const filter = { is_deleted: false, ...(task_id && { task_id }) };
//   const subtasks = await SubTask.find(filter);
//   res.json(subtasks);
// });

// // 5. Update Task
// app.patch('/tasks/:userId', verifyjwt , async (req, res) => {
//   try {
//     const { userId } = req.params;
//   const { due_date, status } = req.body;
//   const updatedTask = await Task.findByIdAndUpdate(
//     userId,
//     { ...(due_date && { due_date }), ...(status && { status }) },
//     { new: true }
//   );
//   res.json(updatedTask);
//   } catch (error) {
//     console.log(error.message); 
//     return res
//       .status(500)
//       .send({ message: "Error in Login", success: false, error: error });
//   }
// });

// // 6. Update SubTask
// app.patch('/subtasks/:subtask_id', authenticateToken, async (req, res) => {
//   const { subtask_id } = req.params;
//   const { status } = req.body;
//   const updatedSubTask = await SubTask.findByIdAndUpdate(subtask_id, { status }, { new: true });
//   res.json(updatedSubTask);
// });

// // 7. Delete Task (Soft Deletion)
// app.delete('/tasks/:task_id', authenticateToken, async (req, res) => {
//   const { task_id } = req.params;
//   await Task.findByIdAndUpdate(task_id, { is_deleted: true });
//   res.send('Task deleted successfully.');
// });

// // 8. Delete SubTask (Soft Deletion)
// app.delete('/subtasks/:subtask_id', authenticateToken, async (req, res) => {
//   const { subtask_id } = req.params;
//   await SubTask.findByIdAndUpdate(subtask_id, { is_deleted: true });
//   res.send('SubTask deleted successfully.');
// });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
