const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const { MongoClient, ObjectId } = require('mongodb');
const util = require('util');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const uri = 'mongodb://localhost:27017/';
const client = new MongoClient(uri);
const dbName = 'codingPlatform';
let db;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const execWithTimeout = util.promisify(exec);

client.connect()
  .then(() => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

app.get('/questions', async (req, res) => {
  console.log("GET /questions called");
  try {
    const questions = await db.collection('questions').find().toArray();
    console.log("Fetched questions:", questions);
    res.send(questions);
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).send({ error: 'Failed to fetch questions', details: err.message });
  }
});

app.post('/questions', async (req, res) => {
  const { question, testCases } = req.body;

  if (!Array.isArray(testCases) || !testCases.every(tc => tc.input && tc.output)) {
    return res.status(400).send({ error: 'Invalid test cases format' });
  }

  const newQuestion = {
    question,
    testCases,
    createdAt: new Date()
  };

  try {
    const result = await db.collection('questions').insertOne(newQuestion);
    res.send({ message: 'Question added successfully', questionId: result.insertedId });
  } catch (err) {
    res.status(500).send({ error: 'Failed to save question', details: err.message });
  }
});

const runCodeWithTestCases = async (language, code, testCases) => {
  let testResults = [];

  const tempFilePath = path.join(__dirname, `temp_script.${language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'cpp' ? 'cpp' : 'java'}`);
  fs.writeFileSync(tempFilePath, code);

  // Compile Java and C++ files if needed
  if (language === 'cpp') {
    await execWithTimeout(`g++ ${tempFilePath} -o temp_script`);
  } else if (language === 'java') {
    fs.writeFileSync(path.join(__dirname, 'Main.java'), code);
    await execWithTimeout('javac Main.java');
  }

  for (let testCase of testCases) {
    const input = testCase.input;
    const expectedOutput = testCase.output.trim();

    // Set command and arguments for each language
    let command;
    let args = [];
    switch (language) {
      case 'python':
        command = 'python';
        args = [tempFilePath];
        break;
      case 'javascript':
        command = 'node';
        args = [tempFilePath];
        break;
      case 'cpp':
        command = './temp_script';
        args = [];
        break;
      case 'java':
        command = 'java';
        args = ['Main'];
        break;
      default:
        return { correct: false, error: 'Unsupported language' };
    }

    // Execute the code using `spawn` and pass input via `stdin`
    const runProcess = spawn(command, args);
    let output = '';
    let error = '';

    runProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    runProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    runProcess.stdin.write(input);
    runProcess.stdin.end();

    await new Promise((resolve) => runProcess.on('close', resolve)); 

    const actualOutput = output.trim();
    testResults.push({
      input,
      expectedOutput,
      actualOutput,
      status: actualOutput === expectedOutput ? 'Passed' : 'Failed',
      error: error ? error : null
    });
  }

  // Clean up files
  fs.unlinkSync(tempFilePath);
  if (language === 'cpp' || language === 'java') {
    fs.unlinkSync(path.join(__dirname, 'temp_script'));
    if (language === 'java') fs.unlinkSync(path.join(__dirname, 'Main.class'));
  }

  const allPassed = testResults.every(result => result.status === 'Passed');
  return { correct: allPassed, testResults };
};

app.post('/submit', async (req, res) => {
  const { language, code, questionId } = req.body;

  if (!['python', 'javascript', 'cpp', 'java'].includes(language)) {
    return res.status(400).send({ error: 'Unsupported language' });
  }

  let question;
  try {
    question = await db.collection('questions').findOne({ _id: new ObjectId(questionId) });
  } catch (err) {
    return res.status(500).send({ error: 'Error fetching question from the database', details: err.message });
  }

  if (!question) {
    return res.status(404).send({ error: 'Question not found' });
  }

  const testCases = question.testCases;
  const result = await runCodeWithTestCases(language, code, testCases);

  const testResults = result.testResults || [];

  const submission = {
    language,
    code,
    submittedAt: new Date(),
    status: result.correct ? "Correct" : "Incorrect",
    result: result.correct ? "Passed all test cases" : "Failed some test cases",
    testResults 
  };

  try {
    await db.collection('submissions').insertOne(submission);
    res.send({
      message: result.correct ? 'Code is correct' : 'Code is incorrect',
      testResults: testResults.map(({ input, expectedOutput, actualOutput, status }) => ({
        input,
        expectedOutput,
        actualOutput,
        status
      }))
    });
  } catch (err) {
    res.status(500).send({ error: 'Failed to save submission', details: err.message });
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
