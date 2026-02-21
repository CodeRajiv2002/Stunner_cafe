import express from "express";

const admimRouter = express.Router();

// Example route
admimRouter.post("/login", (req, res) => {
  res.json({ status: "API is running" });
});

export default admimRouter;
