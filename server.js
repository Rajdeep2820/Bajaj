const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

app.post('/bfhl', (req, res) => {
    const { data } = req.body;

    // Basic info about me
    let result = {
        user_id: "Rajdeep Singh Panwar",
        email_id: "rp1469@srmist.edu.in",
        college_roll_number: "RA2311003011722",
        hierarchies: [],
        invalid_entries: [],
        duplicate_edges: [],
        summary: {}
    };

    if (!data || !Array.isArray(data)) {
        return res.status(400).json({ error: "Please send an array in 'data'" });
    }

    let seen = new Set();
    let parent = {};   
    let children = {}; 
    let allNodes = new Set();

    for (let entry of data) {
        let edge = typeof entry === 'string' ? entry.trim() : "";

        // Must be like "A->B", both uppercase, no self-loops like "A->A"
        let isValid = /^[A-Z]->[A-Z]$/.test(edge) && edge[0] !== edge[3];
        if (!isValid) {
            result.invalid_entries.push(edge);
            continue;
        }

        // Skip duplicates
        if (seen.has(edge)) {
            if (!result.duplicate_edges.includes(edge)) {
                result.duplicate_edges.push(edge);
            }
            continue;
        }
        seen.add(edge);

        let [p, c] = edge.split('->');

        // A node can only have one parent — first one wins
        if (parent[c]) continue;

        parent[c] = p;
        allNodes.add(p);
        allNodes.add(c);

        if (!children[p]) children[p] = [];
        children[p].push(c);
    }

    
    let roots = [...allNodes].filter(n => !parent[n]).sort();

    let visited = new Set();

   
    function buildTree(node, ancestors) {
        if (ancestors.has(node)) return null; // cycle detected

        ancestors.add(node);
        visited.add(node);

        let subtree = {};
        let kids = (children[node] || []).sort();

        for (let kid of kids) {
            let kidTree = buildTree(kid, new Set(ancestors));
            if (kidTree === null) return null; // bubble up cycle
            subtree[kid] = kidTree;
        }

        return subtree;
    }

    // Count how many nodes deep the tree goes
    function getDepth(tree) {
        let keys = Object.keys(tree);
        if (keys.length === 0) return 1; // just a leaf
        return 1 + Math.max(...keys.map(k => getDepth(tree[k])));
    }

    // Process each root
    for (let root of roots) {
        let tree = buildTree(root, new Set());

        if (tree === null) {
            result.hierarchies.push({ root, tree: {}, has_cycle: true });
        } else {
            result.hierarchies.push({
                root,
                tree: { [root]: tree },
                depth: getDepth(tree)
            });
        }
    }

    // Handle any leftover nodes stuck in pure cycles (no root at all)
    let leftover = [...allNodes].filter(n => !visited.has(n)).sort();
    while (leftover.length > 0) {
        let root = leftover[0];
        result.hierarchies.push({ root, tree: {}, has_cycle: true });

        // Mark everyone in this cycle as visited
        let queue = [root];
        while (queue.length > 0) {
            let curr = queue.shift();
            if (visited.has(curr)) continue;
            visited.add(curr);
            leftover.splice(leftover.indexOf(curr), 1);
            (children[curr] || []).forEach(c => queue.push(c));
        }
    }

    // Build the summary
    let trees = result.hierarchies.filter(h => !h.has_cycle);
    let cycles = result.hierarchies.filter(h => h.has_cycle);

    let biggestTree = trees.length > 0
        ? trees.sort((a, b) => b.depth - a.depth || a.root.localeCompare(b.root))[0].root
        : "";

    result.summary = {
        total_trees: trees.length,
        total_cycles: cycles.length,
        largest_tree_root: biggestTree
    };

    res.json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is up on port ${PORT}`));