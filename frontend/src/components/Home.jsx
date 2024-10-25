import React, { useState } from 'react';
import QuestionPanel from "./QuestionPanel";
import CodeCompiler from "./CodeCompiler";

function Home() {
  const [questionId, setQuestionId] = useState(''); // State to hold questionId

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-grow flex flex-col lg:flex-row">
        <div className="lg:w-1/2 w-full p-6 border-r border-black bg-white text-black rounded-xl shadow-lg mb-6 lg:mb-0">
          <QuestionPanel setQuestionId={setQuestionId} /> {/* Pass setQuestionId */}
        </div>
        <div className="lg:w-1/2 w-full p-6 bg-white text-black rounded-xl shadow-lg">
          <CodeCompiler questionId={questionId} /> {/* Pass questionId */}
        </div>
      </div>
    </div>
  );
}

export default Home;
