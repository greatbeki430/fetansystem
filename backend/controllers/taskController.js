const Task = require("../models/Task");

exports.createTask = async (req, res) => {
  const { name } = req.body;

  // Add validation
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Task name is required" });
  }

  try {
    const task = new Task({
      name: name.trim(),
      user: req.user._id,
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getTasks = async (req, res) => {
  const { page = 1, limit = 3, search = "", status } = req.query; // Added status
  const query = {
    user: req.user._id, // Use _id from auth middleware
  };
  if (search) query.name = { $regex: search, $options: "i" };
  if (status) query.status = status.split(",");

  try {
    const tasks = await Task.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 }); // Sort by newest first
    const total = await Task.countDocuments(query);
    res.json({ tasks, total });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: req.body.status },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: err.message });
  }
};