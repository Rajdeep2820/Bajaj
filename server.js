const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors()); // Required: evaluator calls from a different origin [cite: 129]

app.post('/bfhl', (req, res) => {
    const { data } = req.body;
    
    // 1. Identity Fields [cite: 14, 33, 34, 35]
    const response = {
        "user_id": "rajdeep_singh_panwar_24042026", 
        "email_id": "rajdeep.panwar@college.edu", // Update with your actual college email
        "college_roll_number": "SRM12345",         // Update with your actual roll number
        "hierarchies": [],
        "invalid_entries": [],
        "duplicate_edges": [],
        "summary": {}
    };

    if (!data || !Array.isArray(data)) {
        return res.status(400).json({ error: "Invalid input format" });
    }

    const seenEdges = new Set();
    const childToParent = {}; 
    const adj = {};
    const allNodes = new Set();

    data.forEach(entry => {
        const trimmed = typeof entry === 'string' ? entry.trim() : ""; 
        
        // 2. Validation: Pattern X->Y, uppercase letters, no self-loops [cite: 37, 39]
        const regex = /^[A-Z]->[A-Z]$/;
        if (!regex.test(trimmed) || trimmed[0] === trimmed[3]) {
            response.invalid_entries.push(trimmed);
            return;
        }

        // 3. Duplicate Check [cite: 41, 42, 43]
        if (seenEdges.has(trimmed)) {
            if (!response.duplicate_edges.includes(trimmed)) {
                response.duplicate_edges.push(trimmed);
            }
            return;
        }
        seenEdges.add(trimmed);

        const [parent, child] = trimmed.split('->');

        // 4. Multi-parent rule: First parent wins 
        if (childToParent[child]) {
            return; 
        }

        childToParent[child] = parent;
        allNodes.add(parent);
        allNodes.add(child);

        if (!adj[parent]) adj[parent] = [];
        adj[parent].push(child);
    });

    // 5. Root Identification [cite: 47, 50]
    // A root never appears as a child. If a group is a pure cycle, use lexicographically smallest node.
    let roots = [...allNodes].filter(node => !childToParent[node]).sort();
    
    // Handle cases where every node has a parent (pure cycles)
    const processedNodes = new Set();
    
    // Helper to build nested tree and detect cycles [cite: 54, 57, 58]
    const buildHierarchy = (node, pathSet) => {
        if (pathSet.has(node)) return { cycle: true };
        
        pathSet.add(node);
        processedNodes.add(node);
        
        const tree = {};
        const children = adj[node] || [];
        children.sort(); // Consistent ordering

        for (const child of children) {
            const result = buildHierarchy(child, new Set(pathSet));
            if (result.cycle) return { cycle: true };
            tree[child] = result.tree;
        }

        return { tree, cycle: false };
    };

    // count nodes in the longest path
    const calculateDepth = (nodeTree) => {
        const keys = Object.keys(nodeTree);
        // Base case: if a node has no children, it's a leaf node (counts as 1 node)
        if (keys.length === 0) return 1; 
        
        // Return 1 (for the current node) + the depth of the deepest branch
        return 1 + Math.max(...keys.map(k => calculateDepth(nodeTree[k])));
    };

    // Process explicit roots
    roots.forEach(root => {
        const result = buildHierarchy(root, new Set());
        if (result.cycle) {
            response.hierarchies.push({ root, tree: {}, has_cycle: true }); 
        } else {
            const fullTree = { [root]: result.tree };
            // Pass the inner result.tree to the calculator to get the correct node count
            response.hierarchies.push({ 
                root, 
                tree: fullTree, 
                depth: calculateDepth(fullTree[root]) // This should now return 4 for A
            });
        }
    });

    // Process remaining nodes (pure cycles) [cite: 50]
    const remainingNodes = [...allNodes].filter(n => !processedNodes.has(n)).sort();
    while (remainingNodes.length > 0) {
        const root = remainingNodes[0];
        response.hierarchies.push({ root, tree: {}, has_cycle: true });
        
        // Mark all nodes in this cycle as processed
        const q = [root];
        while (q.length > 0) {
            const curr = q.shift();
            if (processedNodes.has(curr)) continue;
            processedNodes.add(curr);
            const idx = remainingNodes.indexOf(curr);
            if (idx > -1) remainingNodes.splice(idx, 1);
            (adj[curr] || []).forEach(child => q.push(child));
        }
    }

    // 6. Summary Rules [cite: 31, 62, 63]
    const validTrees = response.hierarchies.filter(h => !h.has_cycle);
    response.summary = {
        "total_trees": validTrees.length,
        "total_cycles": response.hierarchies.length - validTrees.length,
        "largest_tree_root": validTrees.length > 0 
            ? validTrees.sort((a, b) => b.depth - a.depth || a.root.localeCompare(b.root))[0].root 
            : ""
    };

    res.json(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));