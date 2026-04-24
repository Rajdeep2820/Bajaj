const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors()); // Required by evaluation notes [cite: 129]

app.post('/bfhl', (req, res) => {
    const { data } = req.body;
    
    // 1. Identity Fields [cite: 33, 34, 35]
    const response = {
        "user_id": "rajdeep_singh_panwar_24042026", // Format: fullname_ddmmyyyy
        "email": "your_college_email@srm.edu",
        "roll_number": "your_roll_number",
        "hierarchies": [],
        "invalid_entries": [],
        "duplicate_edges": [],
        "summary": {}
    };

    if (!data || !Array.isArray(data)) {
        return res.status(400).json({ error: "Invalid input format" });
    }

    const validEdges = [];
    const seenEdges = new Set();
    const childToParent = {}; // To enforce "first parent wins" 
    const adj = {};
    const allNodes = new Set();

    data.forEach(entry => {
        const trimmed = entry.trim(); // Rule: Trim whitespace [cite: 39]
        
        // 2. Validation [cite: 37, 38, 39]
        const regex = /^[A-Z]->[A-Z]$/;
        if (!regex.test(trimmed) || trimmed[0] === trimmed[3]) {
            response.invalid_entries.push(trimmed);
            return;
        }

        // 3. Duplicate Check [cite: 41, 42]
        if (seenEdges.has(trimmed)) {
            if (!response.duplicate_edges.includes(trimmed)) {
                response.duplicate_edges.push(trimmed);
            }
            return;
        }
        seenEdges.add(trimmed);

        const [parent, child] = trimmed.split('->');

        // 4. Multi-parent rule: First parent wins [cite: 51, 52]
        if (childToParent[child]) {
            return; // Silently discard subsequent parents
        }

        childToParent[child] = parent;
        validEdges.push({ parent, child });
        allNodes.add(parent);
        allNodes.add(child);

        if (!adj[parent]) adj[parent] = [];
        adj[parent].push(child);
    });

    // 5. Tree & Cycle Processing [cite: 47, 50, 54]
    // ... Logic to group nodes, find roots, and detect cycles ...

    res.json(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));