import React from 'react';
import AceEditor from 'react-ace';

// Importing Ace modes for supported languages
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-java';

// Importing Ace themes
import 'ace-builds/src-noconflict/theme-monokai';  // You can choose a theme

const CodeEditor = ({ language, code, setCode }) => {
  return (
    <AceEditor
      mode={language} // Pass the correct mode based on selected language
      theme="monokai"
      name="editor"
      onChange={(newCode) => setCode(newCode)} // Update code state
      fontSize={16}
      showPrintMargin={false}
      showGutter={true}
      highlightActiveLine={true}
      value={code}
      setOptions={{
        useWorker: false, // Disable web workers for code execution
      }}
      className="w-full h-[60vh]"
    />
  );
};

export default CodeEditor;
