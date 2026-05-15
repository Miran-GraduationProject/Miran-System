import db from '../../config/dbConnect.js';

export const createCase = async (req, res) => {
    const { caseName, description_text, notes, templateID, periodID, createdBy } = req.body;

    
    if (!caseName?.trim() || !description_text || !templateID || !periodID || !createdBy) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await db.promise().query(
            'INSERT INTO Mandatory_Cases (caseName, description_text, notes, templateID, periodID, createdBy, createdAt ) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [caseName, description_text, notes, templateID, periodID, createdBy]
        );

        return res.json({ message: 'Case created successfully' });
    } catch (error) {
        console.error('Error creating case:', error);
        return res.status(500).json({ error: 'Failed to create case' });
    }
};


export const updateCase = async (req, res) => {
    try {
    const { caseID } = req.params;
    const { caseName, description_text, notes} = req.body;

    await db.promise().query(
        'UPDATE Mandatory_Cases SET caseName = ?, description_text = ?, notes = ? WHERE caseID = ?',
        [caseName, description_text, notes, caseID]
    );

    return res.json({ message: 'Case updated successfully' });

    } catch (error) {
        console.error('Error updating case:', error);
        return res.status(500).json({ error: 'Failed to update case' });
    }
};

export const deleteCase = async (req, res) => {
    try {
    const { caseID } = req.params;

    await db.promise().query(
        'DELETE FROM Mandatory_Cases WHERE caseID = ?',
        [caseID]
    );

    return res.json({ message: 'Case deleted successfully' });

    } catch (error) {
        console.error('Error deleting case:', error);
        return res.status(500).json({ error: 'Failed to delete case' });
    }
};