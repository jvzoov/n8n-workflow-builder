import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [currentView, setCurrentView] = useState("chat"); // "chat" or "workflows"
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: input,
        session_id: sessionId
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: response.data.response,
        workflow_json: response.data.workflow_json,
        has_workflow: response.data.has_workflow,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);

      // If a workflow was generated, refresh workflows list
      if (response.data.has_workflow) {
        loadWorkflows();
      }

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "error",
        content: "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateWorkflow = async (description) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/generate-workflow`, {
        description,
        session_id: sessionId
      });

      const workflowMessage = {
        id: Date.now(),
        type: "workflow",
        content: response.data.explanation,
        workflow_json: response.data.workflow_json,
        workflow_id: response.data.workflow_id,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, workflowMessage]);
      loadWorkflows();

    } catch (error) {
      console.error("Error generating workflow:", error);
      const errorMessage = {
        id: Date.now(),
        type: "error",
        content: "Sorry, there was an error generating the workflow. Please try again.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkflows = async () => {
    try {
      const response = await axios.get(`${API}/workflows/${sessionId}`);
      setWorkflows(response.data);
    } catch (error) {
      console.error("Error loading workflows:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const exportWorkflow = (workflow) => {
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${workflow.name || 'workflow'}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const quickPrompts = [
    "Create a workflow that monitors Gmail for invoices and saves attachments to Google Drive",
    "Build a workflow that posts to Twitter when a new blog post is published",
    "Create a workflow that backs up database data to AWS S3 every night",
    "Build a workflow that sends Slack notifications for new GitHub issues",
    "Create a workflow that processes CSV files and sends email reports"
  ];

  return (
    <div className="app">
      <div className="header">
        <div className="header-content">
          <h1 className="title">🤖 n8n Workflow Builder</h1>
          <p className="subtitle">Generate n8n workflows from natural language using AI</p>
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${currentView === "chat" ? "active" : ""}`}
              onClick={() => setCurrentView("chat")}
            >
              💬 Chat
            </button>
            <button 
              className={`nav-tab ${currentView === "workflows" ? "active" : ""}`}
              onClick={() => {setCurrentView("workflows"); loadWorkflows();}}
            >
              ⚙️ Workflows ({workflows.length})
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        {currentView === "chat" ? (
          <div className="chat-container">
            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="welcome-message">
                  <h3>👋 Welcome to n8n Workflow Builder!</h3>
                  <p>Describe the automation workflow you'd like to create, and I'll generate a complete n8n workflow for you.</p>
                  <div className="quick-prompts">
                    <h4>Try these examples:</h4>
                    {quickPrompts.map((prompt, index) => (
                      <button 
                        key={index}
                        className="quick-prompt"
                        onClick={() => {
                          setInput(prompt);
                          setTimeout(() => sendMessage(), 100);
                        }}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-content">
                    {message.type === "user" && (
                      <div className="user-message">
                        <strong>You:</strong> {message.content}
                      </div>
                    )}
                    
                    {message.type === "ai" && (
                      <div className="ai-message">
                        <strong>🤖 AI Assistant:</strong>
                        <div className="ai-response">{message.content}</div>
                        {message.has_workflow && message.workflow_json && (
                          <div className="workflow-preview">
                            <h4>📋 Generated Workflow:</h4>
                            <div className="workflow-info">
                              <p><strong>Name:</strong> {message.workflow_json.name}</p>
                              <p><strong>Nodes:</strong> {message.workflow_json.nodes?.length || 0}</p>
                            </div>
                            <button 
                              className="export-btn"
                              onClick={() => exportWorkflow(message.workflow_json)}
                            >
                              📥 Export to n8n
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {message.type === "workflow" && (
                      <div className="workflow-message">
                        <strong>✅ Workflow Generated!</strong>
                        <div className="workflow-details">
                          <p><strong>Name:</strong> {message.workflow_json.name}</p>
                          <p><strong>Nodes:</strong> {message.workflow_json.nodes?.length || 0}</p>
                          <button 
                            className="export-btn"
                            onClick={() => exportWorkflow(message.workflow_json)}
                          >
                            📥 Export to n8n
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {message.type === "error" && (
                      <div className="error-message">
                        <strong>❌ Error:</strong> {message.content}
                      </div>
                    )}
                  </div>
                  <div className="timestamp">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="loading-message">
                  <div className="loading-spinner"></div>
                  <span>Generating workflow...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <div className="chat-input">
              <div className="input-container">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe the workflow you want to create..."
                  className="message-input"
                  rows="3"
                />
                <button 
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="send-btn"
                >
                  {isLoading ? "..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="workflows-container">
            <div className="workflows-header">
              <h2>Your Generated Workflows</h2>
              <p>All workflows generated in this session</p>
            </div>
            
            {workflows.length === 0 ? (
              <div className="empty-workflows">
                <p>No workflows generated yet. Go to the Chat tab to start creating workflows!</p>
              </div>
            ) : (
              <div className="workflows-grid">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="workflow-card">
                    <div className="workflow-header">
                      <h3>{workflow.name}</h3>
                      <span className="workflow-status">{workflow.status}</span>
                    </div>
                    <p className="workflow-description">{workflow.description}</p>
                    <div className="workflow-stats">
                      <span>📊 {workflow.workflow_json.nodes?.length || 0} nodes</span>
                      <span>🤖 {workflow.ai_model_used}</span>
                    </div>
                    <div className="workflow-actions">
                      <button 
                        className="export-btn"
                        onClick={() => exportWorkflow(workflow.workflow_json)}
                      >
                        📥 Export
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;