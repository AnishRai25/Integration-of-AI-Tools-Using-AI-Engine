import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, FileText, Mic, Paperclip, X } from 'lucide-react';
import './QueryBar.css';

// Initialize SpeechRecognition if available
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const QueryBar = ({ onSubmit }) => {
  const [query, setQuery] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const generalInputRef = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        let finalTranscripts = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscripts += transcript + ' ';
          }
        }
        
        if (finalTranscripts) {
          setQuery(prev => (prev ? prev + ' ' : '') + finalTranscripts.trim());
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
          }
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const handleInput = (e) => {
    setQuery(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        name: file.name,
        type: file.type || 'unknown',
        id: Math.random().toString(36).substr(2, 9),
        rawFile: file
      }));
      setAttachments(prev => [...prev, ...newFiles]);
    }
    e.target.value = null;
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRecording) {
      recognitionRef.current?.stop();
    }
    if (query.trim() || attachments.length > 0) {
      onSubmit(query, attachments);
      setQuery('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <div className={`query-bar-container glass-panel ${isRecording ? 'recording-mode' : ''}`}>
      
      {attachments.length > 0 && (
        <div className="attachments-preview">
          {attachments.map(att => (
            <div key={att.id} className="attachment-chip">
              <span className="attachment-name" title={att.name}>{att.name}</span>
              <button 
                type="button" 
                className="remove-attachment-btn"
                onClick={() => removeAttachment(att.id)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="query-bar-form">
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          multiple
        />
        <input 
          type="file" 
          ref={imageInputRef} 
          style={{ display: 'none' }} 
          accept="image/*"
          onChange={handleFileChange}
          multiple
        />
        <input 
          type="file" 
          ref={generalInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
          multiple
        />

        <div className="query-actions-left">
          <button type="button" className="action-btn" title="Attach Document" onClick={() => fileInputRef.current.click()}>
            <FileText size={20} />
          </button>
          <button type="button" className="action-btn" title="Attach Image" onClick={() => imageInputRef.current.click()}>
            <ImageIcon size={20} />
          </button>
          <button 
            type="button" 
            className={`action-btn ${isRecording ? 'recording-active' : ''}`} 
            title={isRecording ? "Stop Recording" : "Voice Input (Real-time)"} 
            onClick={toggleRecording}
          >
            <Mic size={20} />
          </button>
          <button type="button" className="action-btn" title="General Attachment" onClick={() => generalInputRef.current.click()}>
            <Paperclip size={20} />
          </button>
        </div>
        
        <textarea
          ref={textareaRef}
          className="query-input"
          value={query}
          onChange={handleInput}
          placeholder={isRecording ? "Listening... Speak now" : "Ask VAAA AI..."}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        
        <button 
          type="submit" 
          className={`submit-btn ${(query.trim() || attachments.length > 0) ? 'active' : ''}`}
          disabled={!query.trim() && attachments.length === 0}
        >
          <Send size={20} className={(query.trim() || attachments.length > 0) ? 'glow-icon' : ''} />
        </button>
      </form>
    </div>
  );
};

export default QueryBar;
