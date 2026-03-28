import { getAllHospitals, createHospital, updateHospital, deleteHospital } from '../../models/coordinatorModel/hospitalModel.js';
// شرحت فكرتها بالمودل

// يجيب  كل المستشفيات
const getHospitals = async (_req, res) => {
    try {
        const hospitals = await getAllHospitals();
        res.status(200).json(hospitals);
    } catch (error) {
        console.error('getHospitals error:', error);
        res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


// يضيف مستشفى جديد
const addHospital = async (req, res) => {
    try {
        const { name, location } = req.body;

        if (!name || !location) {
            return res.status(400).json({ message: "Hospital name and location are required" });
        }

        const hospital = await createHospital({ name, location });

        res.status(201).json({
            message: "Hospital added successfully",
            hospital
        });
    } catch (error) {
        console.error('addHospital error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "A hospital with this name already exists" });
        }

        res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


// يعديل مستشفى
const editHospital = async (req, res) => {
    try {
        const { hospitalID } = req.params;
        const { name, location } = req.body;

        if (!name || !location) {
            return res.status(400).json({ message: "Hospital name and location are required" });
        }

        const result = await updateHospital(hospitalID, { name, location });

        if (!result.exists) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        if (!result.changed) {
            return res.status(200).json({ message: "NO_CHANGES" });
        }

        res.status(200).json({ message: "Hospital updated successfully" });
    } catch (error) {
        console.error('editHospital error:', error);
        res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


// يحذف مستشفى
const removeHospital = async (req, res) => {
    try {
        const { hospitalID } = req.params;

        const deleted = await deleteHospital(hospitalID);

        if (!deleted) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        res.status(200).json({ message: "Hospital deleted successfully" });
    } catch (error) {
        console.error('removeHospital error:', error);

        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: "Cannot delete hospital, it is linked to a training period" });
        }

        res.status(500).json({ message: "Something went wrong, please try again" });
    }
};


export { getHospitals, addHospital, editHospital, removeHospital };
