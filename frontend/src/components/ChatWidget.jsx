import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { aiAPI, predictionsAPI } from '../utils/api';
import { Bot, Send, Mic, Volume2, Loader, X, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

const ChatWidget = () => {
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const appLanguage = language ? language.toLowerCase() : 'en';

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [playingAudioIdx, setPlayingAudioIdx] = useState(null);

  const initialMessage = language === 'kn' 
    ? 'ನಮಸ್ಕಾರ! ನಾನು ಅಗ್ರಿಪ್ರೆಡಿಕ್ಟ್ AI. ಇಂದಿನ ಬೇಸಾಯ, ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿಗಳು ಅಥವಾ ನಿಮ್ಮ ಸಾಗಣೆಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?'
    : language === 'hi'
      ? 'नमस्ते! मैं एग्रीप्रिडिक्ट एआई हूं। आज खेती, बाज़ार के रुझान, या आपके शिपमेंट को ट्रैक करने में मैं आपकी कैसे मदद कर सकता हूं?'
      : 'Hello! I am AgriPredict AI. How can I help you with farming, market trends, or tracking your shipments today?';

  const [messages, setMessages] = useState([{ role: 'assistant', content: initialMessage }]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessages = [...messages, { role: 'user', content: inputMessage }];
    setMessages(newMessages);
    setInputMessage('');
    setLoadingChat(true);

    try {
      const res = await aiAPI.chat(newMessages, appLanguage);
      setMessages([...newMessages, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      toast.error('Failed to get AI response');
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const toggleListen = () => {
    if (isListening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Your browser does not support Voice Input. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = appLanguage === 'kn' ? 'kn-IN' : appLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      setIsListening(false);
      toast.error("Voice input failed. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const playTTS = async (text, idx) => {
    if (playingAudioIdx !== null) return;
    setPlayingAudioIdx(idx);
    toast.loading("Generating audio...", { id: "tts" });
    try {
      const res = await predictionsAPI.getAdvisoryAudio({ text, lang: appLanguage });
      const audioUrl = URL.createObjectURL(res.data);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setPlayingAudioIdx(null);
      };
      
      audio.play();
      toast.success("Playing audio", { id: "tts" });
      } catch (err) {
      console.error(err);
      toast.error("Failed to generate audio", { id: "tts" });
      setPlayingAudioIdx(null);
    }
  };

  if (user?.role !== 'farmer') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] max-h-[70vh] bg-[#e8f5e9] dark:bg-black/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-primary/30 origin-bottom-right animate-in slide-in-from-bottom-5">
          <div className="p-4 border-b border-primary/30 bg-primary/10 flex justify-between items-center">
            <h2 className="text-green-900 dark:text-green-100 font-bold flex items-center gap-2">
              <Bot className="text-green-900 dark:text-green-100" /> AgriPredict AI
            </h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-green-900/60 hover:text-green-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-green-900 rounded-tr-none' 
                      : 'bg-white dark:bg-black/50 border border-primary/20 rounded-tl-none group relative text-black dark:text-white'
                  }`}>
                    <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? '[&_*]:!text-green-900' : '[&_*]:!text-black dark:[&_*]:!text-white'}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  {msg.role === 'assistant' && (
                    <button 
                      onClick={() => playTTS(msg.content, idx)}
                      disabled={playingAudioIdx !== null}
                      className="absolute -right-8 top-1 p-1.5 rounded-full bg-black/10 text-black hover:bg-black/20 opacity-0 group-hover:opacity-100 transition-all"
                      title="Listen to this message"
                    >
                      {playingAudioIdx === idx ? <Loader className="animate-spin" size={12} /> : <Volume2 size={12} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loadingChat && (
              <div className="flex justify-start">
                <div className="bg-white border border-primary/20 rounded-xl rounded-tl-none p-4 flex gap-1 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="p-3 border-t border-primary/30 bg-white dark:bg-black/90">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleListen}
                className={`p-2 rounded-lg flex items-center justify-center transition-colors ${isListening ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 animate-pulse' : 'bg-[#e8f5e9] dark:bg-black/40 text-green-900 dark:text-green-100 hover:bg-primary/30 dark:hover:bg-primary/20'}`}
                title="Voice Dictation"
              >
                <Mic size={18} />
              </button>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask AI..."}
                className="flex-1 bg-[#e8f5e9] dark:bg-black/50 border border-primary/30 rounded-lg px-3 py-2 text-sm text-green-900 dark:text-white placeholder:text-green-800/60 dark:placeholder:text-green-100/50 focus:outline-none focus:border-primary"
                disabled={loadingChat}
              />
              <button 
                type="submit" 
                disabled={!inputMessage.trim() || loadingChat} 
                className="flex items-center justify-center p-2 rounded-lg bg-primary text-green-900 hover:bg-[#85b018] disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${isOpen ? 'bg-white text-primary border border-primary' : 'bg-primary text-green-900'}`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};

export default ChatWidget;
