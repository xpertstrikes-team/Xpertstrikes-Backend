router.post("/login", async (req, res) => {
  const { password } = req.body;

  const admin = await Admin.findOne();  // get the only admin
  if (!admin) return res.status(400).json({ msg: "Admin not found" });

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(400).json({ msg: "Incorrect password" });

  res.json({ msg: "Login successful" });
});
