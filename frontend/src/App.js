import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Landing Page Component
const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState({});
  const observerRef = useRef();

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
        }
      });
    });

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observerRef.current.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  const features = [
    {
      icon: "🤖",
      title: "AI-Powered Generation",
      description: "Transform natural language descriptions into complete n8n workflows instantly using advanced AI technology."
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Generate complex automation workflows in seconds, not hours. Our AI understands your requirements immediately."
    },
    {
      icon: "🎯",
      title: "n8n Compatible",
      description: "Export ready-to-use n8n workflow JSON files that can be imported directly into your n8n instance."
    },
    {
      icon: "🔧",
      title: "No-Code Solution",
      description: "Build sophisticated automations without writing a single line of code. Just describe what you need."
    },
    {
      icon: "📊",
      title: "Smart Optimization",
      description: "Our AI optimizes workflows for performance, suggesting better integrations and efficient data flow."
    },
    {
      icon: "🌐",
      title: "500+ Integrations",
      description: "Connect to all your favorite services including Gmail, Slack, Google Drive, AWS, and hundreds more."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "DevOps Engineer",
      company: "TechFlow Inc.",
      text: "This platform saved me countless hours. I can now create complex workflows just by describing them in plain English!"
    },
    {
      name: "Marcus Rodriguez",
      role: "Automation Specialist",
      company: "DataCorp",
      text: "The AI-generated workflows are incredibly accurate. It's like having an automation expert on your team 24/7."
    },
    {
      name: "Emma Thompson",
      role: "Product Manager",
      company: "StartupX",
      text: "Finally, a tool that makes n8n accessible to non-technical team members. Game-changer for our productivity!"
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="floating-element floating-1"></div>
          <div className="floating-element floating-2"></div>
          <div className="floating-element floating-3"></div>
        </div>
        
        <div className="hero-content">
          <div className="logo-container">
            <div className="logo">
              <span className="logo-icon">🤖</span>
              <span className="logo-text">n8n workflow.ai</span>
            </div>
          </div>
          
          <h1 className="hero-title animate-on-scroll" id="hero-title">
            Transform Ideas into 
            <span className="gradient-text"> AI-Powered Workflows</span>
          </h1>
          
          <p className="hero-subtitle animate-on-scroll" id="hero-subtitle">
            The world's first AI-powered n8n workflow builder. Describe your automation needs in plain English 
            and get production-ready workflows in seconds.
          </p>
          
          <div className="hero-cta animate-on-scroll" id="hero-cta">
            <button 
              className="cta-primary"
              onClick={() => navigate('/app')}
            >
              Start Building Free
              <span className="cta-icon">→</span>
            </button>
            <button className="cta-secondary">
              Watch Demo
              <span className="cta-icon">▶</span>
            </button>
          </div>
          
          <div className="hero-stats animate-on-scroll" id="hero-stats">
            <div className="stat">
              <span className="stat-number">10,000+</span>
              <span className="stat-label">Workflows Generated</span>
            </div>
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Integrations</span>
            </div>
            <div className="stat">
              <span className="stat-number">99%</span>
              <span className="stat-label">Success Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title animate-on-scroll" id="features-title">
            Why Choose n8n workflow.ai?
          </h2>
          <p className="section-subtitle animate-on-scroll" id="features-subtitle">
            Experience the future of workflow automation with our cutting-edge AI technology
          </p>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`feature-card animate-on-scroll ${isVisible[`feature-${index}`] ? 'visible' : ''}`}
                id={`feature-${index}`}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title animate-on-scroll" id="how-title">
            How It Works
          </h2>
          
          <div className="steps-container">
            <div className="step animate-on-scroll" id="step-1">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Describe Your Workflow</h3>
                <p>Simply tell our AI what automation you need in plain English</p>
              </div>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step animate-on-scroll" id="step-2">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>AI Generates Workflow</h3>
                <p>Our advanced AI creates a complete n8n workflow with all necessary nodes</p>
              </div>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step animate-on-scroll" id="step-3">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Export & Deploy</h3>
                <p>Download your workflow JSON and import directly into n8n</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title animate-on-scroll" id="testimonials-title">
            Loved by Automation Experts
          </h2>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className={`testimonial-card animate-on-scroll ${isVisible[`testimonial-${index}`] ? 'visible' : ''}`}
                id={`testimonial-${index}`}
              >
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta-section">
        <div className="container">
          <div className="cta-content animate-on-scroll" id="final-cta">
            <h2>Ready to Revolutionize Your Workflows?</h2>
            <p>Join thousands of automation experts who trust n8n workflow.ai</p>
            <button 
              className="cta-primary large"
              onClick={() => navigate('/app')}
            >
              Get Started for Free
              <span className="cta-icon">🚀</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <span className="logo-icon">🤖</span>
                <span className="logo-text">n8n workflow.ai</span>
              </div>
              <p>AI-powered workflow automation for everyone</p>
            </div>
            
            <div className="footer-links">
              <div className="link-group">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#integrations">Integrations</a>
              </div>
              
              <div className="link-group">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#careers">Careers</a>
                <a href="#contact">Contact</a>
              </div>
              
              <div className="link-group">
                <h4>Resources</h4>
                <a href="#docs">Documentation</a>
                <a href="#blog">Blog</a>
                <a href="#support">Support</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 n8n workflow.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Main App Component (existing functionality)
const WorkflowApp = () => {
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [currentView, setCurrentView] = useState("chat");
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
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<WorkflowApp />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;