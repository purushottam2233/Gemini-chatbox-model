import React, { useState, useEffect } from 'react'
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import './src/App.css' // Adjusted path to standard App.css

// 1. Initialize outside the component so it doesn't re-run on every render
// PRO TIP: Replace this key with a fresh one from AI Studio
const genAI = new GoogleGenerativeAI("AIzaSyDlNwmM-qZQ7-2ifdw3uVxIZ_S929G3WzY");
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

function Chatbord() {
  const [quation, setQuation] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state
  
  // 2. History Logic
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(history));
  }, [history]);

  // 3. Main Function
  const askQuation = async () => {
    if (!quation.trim()) return;

    setLoading(true); // Show user we are working
    try {
      const result = await model.generateContent(quation);
      const response = await result.response;
      const text = response.text();

      setAnswer(text);
      setHistory(prev => [quation, ...prev]);
      setQuation('');
    } catch (error) {
      console.error("API Error:", error);
      setAnswer("The model is busy or the key is invalid. Please check your connection.");
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <div className='grid grid-cols-5 h-screen bg-zinc-900'>
      
      {/* Sidebar - History */}
      <div className='col-span-1 bg-zinc-800 p-4 border-r border-zinc-700 flex flex-col'>
        <h2 className="text-white font-bold text-md mb-3">History</h2>
        <div className="flex-1 overflow-y-auto">
            {history.length === 0 ? (
                <div className="text-zinc-500 text-sm italic">No history yet. Ask something!</div>
            ) : (
                history.map((item, index) => (
                    <div key={index} className="text-zinc-300 text-sm p-2 bg-zinc-700 rounded mb-2 cursor-pointer hover:bg-zinc-600 transition-colors">
                        {item}
                    </div>
                ))
            )}
        </div>
      </div>    
      
 

      {/* Main Chat Content */}
      <div className='col-span-4 flex flex-col h-full'>
        
        {/* Answer Area */}
        <div className='flex-grow overflow-y-auto p-10 flex flex-col items-center justify-center border-b border-zinc-700'>
          {loading ? (
            <div className="text-blue-400 animate-pulse text-xl bg-zinc-800 text-white">Gemini is thinking...</div>
          ) : <ReactMarkdown
  components={{
    pre: ({ ...props }) => (
      <div className="my-4 rounded-lg overflow-hidden border border-zinc-700 shadow-xl">
        {/* Header bar jaise VS Code mein hota hai (Optional) */}
        <div className="bg-zinc-800 px-4 py-2 text-xs text-zinc-400 border-b border-zinc-700 flex justify-between">
          <span>Code Snippet</span>
          <span className="uppercase">Gemini</span>
        </div>
        <pre className="bg-black p-4 overflow-x-auto font-mono text-sm leading-relaxed" {...props} />
      </div>
    ),
    // Style headers
    h1: ({ ...props}) => <h1 className="text-2xl font-bold mb-4 text-blue-400 border-b border-zinc-600" {...props} />,
    h2: ({ ...props}) => <h2 className="text-xl font-bold mb-4 text-white" {...props} />,
    h3: ({ ...props}) => <h3 className="text-lg font-bold mb-4 text-white" {...props} />,
    h4: ({ ...props}) => <h4 className="text-md font-bold mb-4 text-white" {...props} />,
    h5: ({ ...props}) => <h5 className="text-sm font-bold mb-4 text-white" {...props} />,
    h6: ({ ...props}) => <h6 className="text-xs font-bold mb-4 text-white" {...props} />,

    // paragraph style
    p: ({ ...props}) => <p className="text-white text-lg mb-4" {...props} />,
    em: ({ ...props }) => <em className="text-zinc-400 italic" {...props} />,
    
    // Lists
    ul: ({ ...props }) => <ul className="list-disc ml-6 mb-4 space-y-2 text-zinc-300" {...props} />,
    ol: ({ ...props }) => <ol className="list-decimal ml-6 mb-4 space-y-2 text-zinc-300" {...props} />,
    
    
    // Links
    a: ({ ...props }) => <a className="text-blue-500 underline hover:text-blue-300 transition-colors" target="_blank" {...props} />,
    
    // Quotes
    blockquote: ({ ...props }) => (
      <blockquote className="border-l-4 border-zinc-600 pl-4 italic text-zinc-400 my-4 bg-zinc-800/50 py-2 rounded-r" {...props} />
    ),
    // Style bold text
    strong: ({ ...props}) => <strong className=" font-bold text-white text-lg" {...props} />,
    // Style lists
    li: ({...props}) => <li className="ml-4 list-disc mb-2 text-white text-lg" {...props} />,
    // Style code blocks
   
    // code: ({...props}) => <code className="text-white text-lg p-1 rounded" {...props} />
    code: ({ className, ...props }) => {
  const isBlock = /language-(\w+)/.exec(className || "");
  
  return isBlock ? (

    <code className="text-green-400 font-mono" {...props} />
  ) : (
    <code className="bg-zinc-700 text-white px-1 rounded" {...props} />
  );
}



  }}
>
  {answer}
</ReactMarkdown>
            }
         
                <div className="text-zinc-500 text-lg">Ask Gemini anything!</div>
          
        </div>

        {/* Input Area */}
        <div className='p-10'>
          <div className='max-w-3xl mx-auto bg-zinc-800 text-white border rounded-2xl border-zinc-600 flex items-center pr-4 focus-within:border-blue-500 transition-all shadow-xl'>
            <input
              type="text"
              className='w-full p-4 bg-transparent outline-none position-fixed'
              placeholder='Type your message here...'
              value={quation}
              onChange={(e) => setQuation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && askQuation()}
            />
            <button 
              onClick={askQuation}
              disabled={loading}
              className={`transition-colors ${loading ? 'text-zinc-600' : 'text-blue-500 hover:text-blue-300'}`}
            >
              <i className="fa-solid fa-arrow-up text-2xl"></i>
            </button>
          </div>
           <h1 className="text-center text-zinc-500 font-mono text-xl">Developed by @ <strong className="text-white">Purushottam Sharma</strong></h1>
        </div>
       

      </div>
    </div>
    
  )
}

export default Chatbord;