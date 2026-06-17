import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Image as ImageIcon, Type, Mic, Volume2, Cpu } from 'lucide-react';
import { processImageToText, processAudioToText, fetchOllama } from '../services/api';
import QueryBar from './QueryBar';
import './FeaturePage.css';

const FeaturePage = ({ mode }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  
  // Isolated Session State
  const [sessionActive, setSessionActive] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [sessionProcessing, setSessionProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  // Automatically reset session state if the user navigates between different standalone models
  useEffect(() => {
     setSessionActive(false);
     setChatHistory([]);
     setSessionProcessing(false);
  }, [mode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSessionQuery = async (queryText, attachments = []) => {
     if (!queryText.trim() && attachments.length === 0) return;
     
     let finalQuery = queryText;
     
     if (attachments.length > 0) {
        for (const att of attachments) {
            if (att.name.endsWith('.txt') || att.name.endsWith('.md') || att.name.endsWith('.json') || att.name.endsWith('.csv')) {
                const text = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target.result);
                    reader.readAsText(att.rawFile);
                });
                finalQuery += `\n\n[Document Content from ${att.name}]:\n${text.substring(0, 3000)}`;
            } else if (att.name.endsWith('.pdf')) {
                finalQuery += `\n\n[System Note]: The user attached a PDF named ${att.name}. Currently, browser-side PDF binary parsing is constrained. Inform the user that for real-time document analysis, they must upload .txt files instead.`;
            }
        }
     }
     
     const userContent = attachments.length > 0 ? `${queryText}\n\n*(Attached: ${attachments.map(a => a.name).join(', ')})*` : queryText;
     const userMsg = { role: 'user', content: userContent, id: Date.now() - 1 };
     const aiMsg = { role: 'ai', content: '', id: Date.now(), isProcessing: true };
     
     setChatHistory(prev => [...prev, userMsg, aiMsg]);
     setSessionProcessing(true);
     
     try {
       const modelMap = {
         'Llama 3': 'llama3',
         'Mistral': 'mistral',
         'DeepSeek': 'deepseek-r1',
         'Qwen': 'qwen'
       };
       const targetModel = modelMap[mode] || mode.toLowerCase();
       
       const res = await fetchOllama(targetModel, finalQuery, new AbortController().signal);
       
       setChatHistory(prev => prev.map(msg => 
          msg.id === aiMsg.id ? { ...msg, content: res, isProcessing: false } : msg
       ));
     } catch (err) {
       setChatHistory(prev => prev.map(msg => 
          msg.id === aiMsg.id ? { ...msg, content: `*(Error)* The local cognitive core for ${mode} failed to process this request natively.`, isProcessing: false } : msg
       ));
     } finally {
       setSessionProcessing(false);
     }
  };

  const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0]) {
         const file = e.target.files[0];
         setSelectedFile(file);
         setFilePreview(URL.createObjectURL(file));
      }
  };

  const parseImageFile = async () => {
    if (!selectedFile) return;
    setProcessing(true);
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        try {
           const res = await processImageToText(reader.result);
           setResult(res);
        } catch (err) {
           setResult(`*(Error)* Failed API pipeline execution.`);
        } finally {
           setProcessing(false);
        }
      };
      reader.onerror = () => {
         setResult("*(Error)* FileReader unable to construct payload.");
         setProcessing(false);
      };
    } catch (e) {
       setResult("*(Error)* Critical initialization failure.");
       setProcessing(false);
    }
  };

  const parseAudioFile = async () => {
    if (!selectedFile) return;
    setProcessing(true);
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        try {
           const res = await processAudioToText(reader.result, null, (msg) => setProgressText(msg));
           setResult(res);
        } catch (err) {
           setResult(`*(Error)* Failed API pipeline execution.`);
        } finally {
           setProcessing(false);
           setProgressText('');
        }
      };
      reader.onerror = () => {
         setResult("*(Error)* FileReader unable to construct payload.");
         setProcessing(false);
      };
    } catch (e) {
       setResult("*(Error)* Critical initialization failure.");
       setProcessing(false);
    }
  };

  const getIcon = () => {
    switch (mode) {
      case 'Image to Text': return <ImageIcon size={64} className="feature-icon glow-icon" />;
      case 'Text to Image': return <Type size={64} className="feature-icon glow-icon" />;
      case 'Audio to Text': return <Mic size={64} className="feature-icon glow-icon" />;
      case 'Text to Audio': return <Volume2 size={64} className="feature-icon glow-icon" />;
      default: return <Cpu size={64} className="feature-icon glow-icon" />;
    }
  };

  const getDescription = () => {
    if (['Llama 3', 'Mistral', 'DeepSeek', 'Qwen'].includes(mode)) {
       return `Dedicated workspace for ${mode}. Focus queries strictly through this elite model's neural architecture for specialized outputs.`;
    }
    switch(mode) {
      case 'Image to Text': return "Upload an image to receive a detailed descriptive analysis of its contents via our advanced vision models.";
      case 'Text to Image': return "Generate stunning visual assets from text prompts using advanced diffusion models integrated directly into your workspace.";
      case 'Audio to Text': return "Transcribe and analyze complex audio logs in real-time with state-of-the-art sensory decoders.";
      case 'Text to Audio': return "Synthesize ultra-realistic speech from your text using next-generation neural voice engines.";
      default: return "Advanced AI feature initialization in progress.";
    }
  }

  return (
    <div className="feature-page-container">
      <div className="feature-glass-panel glass-panel">
         {getIcon()}
         <h1 className="vaaa-hero-glow feature-title">{mode}</h1>
         <p className="feature-description text-secondary">{getDescription()}</p>
         
         {['Llama 3', 'Mistral', 'DeepSeek', 'Qwen'].includes(mode) ? (
            sessionActive ? (
               <div className="standalone-chat-interface" style={{ width: '100%', minHeight: '400px', maxHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
                  <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(57, 255, 20, 0.1)', marginBottom: '15px' }}>
                     {chatHistory.length === 0 && <p className="text-secondary" style={{ textAlign: 'center', marginTop: '20px' }}>Session securely initialized. Awaiting your command.</p>}
                     {chatHistory.map(msg => (
                        <div key={msg.id} style={{ marginBottom: '15px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                           <div style={{ 
                              display: 'inline-block', 
                              padding: '10px 15px', 
                              borderRadius: '8px', 
                              backgroundColor: msg.role === 'user' ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                              border: msg.role === 'user' ? '1px solid var(--neon-green)' : '1px solid rgba(255,255,255,0.1)',
                              maxWidth: '80%',
                              wordBreak: 'break-word',
                              whiteSpace: 'pre-wrap',
                              textAlign: 'left'
                           }}>
                              {msg.isProcessing ? (
                                <span className="text-neon" style={{ animation: 'pulse 1.5s infinite' }}>Synthesizing Output...</span>
                              ) : msg.content}
                           </div>
                        </div>
                     ))}
                     <div ref={messagesEndRef} />
                  </div>
                  <div className="standalone-query-bar" style={{ pointerEvents: sessionProcessing ? 'none' : 'auto', opacity: sessionProcessing ? 0.6 : 1 }}>
                     <QueryBar onSubmit={handleSessionQuery} />
                  </div>
               </div>
            ) : (
               <div className="feature-dropzone" style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                  <Terminal size={48} className="feature-upload-icon" />
                  <p>Engage directly with the isolated cognitive core of <span>{mode}</span>.</p>
                  <button className="feature-btn" onClick={() => setSessionActive(true)} style={{ borderColor: 'var(--neon-green)' }}>Start Session</button>
               </div>
            )
         ) : mode === 'Image to Text' || mode === 'Audio to Text' ? (
            <div className="feature-interactive-zone" style={{ width: '100%' }}>
               {!result ? (
                  <div className="feature-dropzone" onClick={() => !processing && fileInputRef.current?.click()} style={{ cursor: processing ? 'wait' : 'pointer' }}>
                     <input type="file" accept={mode === 'Image to Text' ? "image/*" : "audio/*"} hidden ref={fileInputRef} onChange={handleFileChange} />
                     
                     {filePreview ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                          {mode === 'Image to Text' ? (
                            <img src={filePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', marginBottom: '15px', border: '1px solid var(--neon-green)' }} />
                          ) : (
                            <audio controls src={filePreview} style={{ width: '100%', marginBottom: '15px', borderRadius: '8px', outline: 'none' }} />
                          )}
                          <p className="text-neon" style={{ marginBottom: '5px' }}>{selectedFile.name}</p>
                          <button 
                             className="feature-btn" 
                             onClick={(e) => { e.stopPropagation(); mode === 'Image to Text' ? parseImageFile() : parseAudioFile(); }}
                             disabled={processing}
                             style={{ marginTop: '10px' }}
                          >
                             {processing ? (mode === 'Image to Text' ? 'Analyzing Image...' : (progressText || 'Transcribing...')) : (mode === 'Image to Text' ? 'Analyze Image' : 'Transcribe Audio')}
                          </button>
                        </div>
                     ) : (
                        <>
                          <div className="feature-upload-icon">+</div>
                          <p>Drop your {mode === 'Image to Text' ? 'image' : 'audio'} files here or <span>click to upload</span>.</p>
                        </>
                     )}
                  </div>
               ) : (
                  <div className="result-panel glass-panel" style={{ marginTop: '20px', padding: '25px', textAlign: 'left', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid rgba(57, 255, 20, 0.3)' }}>
                     <h3 style={{ color: 'var(--neon-green)', marginBottom: '15px', fontSize: '1.2rem' }}>{mode === 'Image to Text' ? 'Image Analysis Complete' : 'Transcription Complete'}</h3>
                     <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#e0e0e0' }}>{result}</div>
                     <button className="feature-btn" style={{ marginTop: '20px', width: '100%' }} onClick={() => {setResult(null); setSelectedFile(null); setFilePreview(null);}}>{mode === 'Image to Text' ? 'Analyze Another Image' : 'Transcribe Another Audio'}</button>
                  </div>
               )}
            </div>
         ) : (
            <div className="feature-dropzone">
                <div className="feature-upload-icon">+</div>
                <p>Drop your {mode.split(' ')[0].toLowerCase()} files here or <span>click to upload</span>.</p>
                <button className="feature-btn">Initialize {mode.split(' ')[0]}</button>
            </div>
         )}
      </div>
    </div>
  );
};

export default FeaturePage;
