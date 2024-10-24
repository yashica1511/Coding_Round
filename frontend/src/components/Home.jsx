import QuestionPanel from "./QuestionPanel";
import CodeCompiler from "./CodeCompiler";

function Home() {
  return (
    <div className="min-h-screen bg-blue-600 text-white flex flex-col">
      <div className="flex-grow flex flex-col lg:flex-row">
        <div className="lg:w-1/2 w-full p-6 border-r border-blue-300 bg-white text-black rounded-xl shadow-lg mb-6 lg:mb-0">
          <QuestionPanel />
        </div>
        <div className="lg:w-1/2 w-full p-6 bg-white text-black rounded-xl shadow-lg">
          <CodeCompiler />
        </div>
      </div>
    </div>
  );
}

export default Home;
