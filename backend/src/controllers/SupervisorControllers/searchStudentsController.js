import { searchStudent } from "../../models/supervisorModel.js";
// كلاس يخلي المشرف يبحث عن الطالب بادخال الاسم


const searchStudentsByName = async (req, res) => {
  try {
    const supervisorID = req.user.userID;
    const { name } = req.query;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const results = await searchStudent(supervisorID, name);
    return res.json({ name: name.trim(), results });
  } catch (err) {
    return res.status(500).json({ message: "Error searching students", error: err.message || err });
  }
};

export {searchStudentsByName}