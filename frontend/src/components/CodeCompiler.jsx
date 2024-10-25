// CodeCompiler.jsx
import React, { useState } from 'react';
import CodeEditor from './CodeEditor';

function CodeCompiler({ questionId }) {
  const [language, setLanguage] = useState('python'); // Default language
  const [code, setCode] = useState('');
  const [results, setResults] = useState([]);
  const [output, setOutput] = useState('');
  const [showTestCases, setShowTestCases] = useState(false); // Toggle for test cases view

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleRunCode = async () => {
    setShowTestCases(false); // Hide test cases on run
    try {
      const response = await fetch('http://localhost:5000/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language, code, questionId }), // Use questionId
      });

      const result = await response.json();
      console.log('Run code response:', result);

      // Show only actual output, input, and expected output
      if (result.testResults) {
        const test = result.testResults[0]; // Use first test result for Run
        setOutput(
          `Input: ${test.input}\nExpected Output: ${test.expectedOutput}\nActual Output: ${test.actualOutput || 'Error'}`
        );
      } else {
        setOutput('Error: Unable to fetch results');
      }
    } catch (error) {
      console.error('Error running code:', error);
      setOutput('Error running code.');
    }
  };

  const handleSubmit = async () => {
    setShowTestCases(true); // Show test cases on submit
    try {
      const response = await fetch('http://localhost:5000/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language, code, questionId }), // Use questionId
      });

      const result = await response.json();
      console.log('Submit response:', result);
      alert(`Code submission status: ${result.message}`);

      // Display test case results with color coding
      if (result.testResults) {
        setResults(result.testResults);
        setOutput(''); // Clear output when displaying test cases
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      setOutput('Error submitting code.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center relative">
      <div className="mb-4 w-full flex justify-end">
        <select
          id="language"
          value={language}
          onChange={handleLanguageChange}
          className="p-2 bg-gray-700 text-white rounded"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
      </div>

      <CodeEditor language={language} code={code} setCode={setCode} />

      <div className="mt-4 flex justify-end w-full">
        <button
          onClick={handleRunCode}
          className="p-3 bg-blue-500 text-lg font-semibold rounded-lg hover:bg-blue-600 mr-4"
        >
          Run Code
        </button>
        <button
          onClick={handleSubmit}
          className="p-3 bg-green-500 text-lg font-semibold rounded-lg hover:bg-green-600"
        >
          Submit Code
        </button>
      </div>

      {output && (
        <div className="mt-4 w-full">
          <h3>Output:</h3>
          <pre className="text-white">{output}</pre>
        </div>
      )}

      {showTestCases && results.length > 0 && (
        <div className="mt-4 w-full">
          <h3>Test Results:</h3>
          <ul>
            {results.map((testCase, index) => (
              <li key={index} className={testCase.status === 'Passed' ? 'text-green-500' : 'text-red-500'}>
                Test Case {index + 1}: {testCase.status} - Expected: {testCase.expectedOutput}, Got: {testCase.actualOutput}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CodeCompiler;
