import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setError('');
      // Parse the string input into a JSON object for the API
      const jsonData = JSON.parse(input); 
      const res = await axios.post('http://localhost:3000/bfhl', jsonData);
      setResponse(res.data);
    } catch (err) {
      setError('Invalid JSON format or API error');
    }
  };

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>SRM Full Stack Challenge</h1>
      
      <textarea 
        rows="10" 
        cols="50" 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='{"data": ["A->B", "B->C"]}'
      />
      <br />
      <button onClick={handleSubmit}>Submit</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {response && (
  <div style={{ marginTop: '20px', borderTop: '1px solid #444', paddingTop: '20px' }}>
    <h2>User Information</h2>
    <p><strong>User ID:</strong> {response.user_id}</p>
    <p><strong>Email:</strong> {response.email_id}</p>
    <p><strong>Roll Number:</strong> {response.college_roll_number}</p>
    
    <h2>Response Summary</h2>
    <p>Total Trees: {response.summary.total_trees}</p>
    <p>Total Cycles: {response.summary.total_cycles}</p>
    <p>Deepest Root: {response.summary.largest_tree_root}</p>
    
    <h3>Hierarchies (JSON View)</h3>
    <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '5px' }}>
      {JSON.stringify(response.hierarchies, null, 2)}
    </pre>
  </div>
)}
    </div>
  );
}

export default App;