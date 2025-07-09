from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import json
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_message: str
    ai_response: str
    workflow_json: Optional[dict] = None
    ai_model: str = "gemini-2.0-flash"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    message: str
    session_id: str

class WorkflowRequest(BaseModel):
    description: str
    session_id: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    subscription_tier: str = "free"
    api_credits: int = 100
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Workflow(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_id: str
    name: str
    description: str
    workflow_json: dict
    ai_model_used: str
    status: str = "draft"
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Initialize Gemini AI
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

async def get_gemini_chat(session_id: str, system_message: str = None):
    """Create a new Gemini chat instance"""
    if not system_message:
        system_message = """You are an expert n8n workflow builder assistant. Your job is to convert natural language descriptions into complete n8n workflow JSON configurations.

When a user describes an automation workflow, you should:
1. Analyze the user's requirements
2. Generate a complete n8n workflow JSON structure
3. Include all necessary nodes (triggers, actions, conditions)
4. Provide proper node connections and configurations
5. Use realistic service integrations

Always respond with:
1. A brief explanation of what the workflow does
2. The complete n8n workflow JSON structure
3. Setup instructions for the user

Focus on creating practical, working n8n workflows that can be imported directly into n8n."""
    
    chat = LlmChat(
        api_key=GEMINI_API_KEY,
        session_id=session_id,
        system_message=system_message
    ).with_model("gemini", "gemini-2.0-flash").with_max_tokens(4096)
    
    return chat

def parse_workflow_json(ai_response: str) -> dict:
    """Extract JSON from AI response"""
    try:
        # Look for JSON code blocks
        import re
        json_pattern = r'```json\s*(.*?)\s*```'
        matches = re.findall(json_pattern, ai_response, re.DOTALL)
        
        if matches:
            return json.loads(matches[0])
        
        # Try to find JSON in the response
        json_start = ai_response.find('{')
        json_end = ai_response.rfind('}') + 1
        
        if json_start != -1 and json_end != -1:
            json_str = ai_response[json_start:json_end]
            return json.loads(json_str)
        
        return {}
    except:
        return {}

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "n8n Workflow Builder API - Ready to generate workflows!"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """Chat with AI for workflow generation"""
    try:
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="Gemini API key not configured")
        
        # Create AI chat instance
        chat = await get_gemini_chat(request.session_id)
        
        # Send message to AI
        user_message = UserMessage(text=request.message)
        ai_response = await chat.send_message(user_message)
        
        # Try to extract workflow JSON
        workflow_json = parse_workflow_json(ai_response)
        
        # Save chat message to database
        chat_message = ChatMessage(
            session_id=request.session_id,
            user_message=request.message,
            ai_response=ai_response,
            workflow_json=workflow_json if workflow_json else None,
            ai_model="gemini-2.0-flash"
        )
        
        await db.chat_messages.insert_one(chat_message.dict())
        
        return {
            "response": ai_response,
            "workflow_json": workflow_json,
            "session_id": request.session_id,
            "has_workflow": bool(workflow_json)
        }
        
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@api_router.post("/generate-workflow")
async def generate_workflow(request: WorkflowRequest):
    """Generate a complete n8n workflow from natural language description"""
    try:
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="Gemini API key not configured")
        
        # Enhanced system message for workflow generation
        system_message = """You are an expert n8n workflow automation specialist. Generate complete, functional n8n workflow JSON configurations from natural language descriptions.

IMPORTANT: Always return a valid JSON structure that can be imported directly into n8n. Include:

1. Complete workflow structure with nodes and connections
2. Proper node configurations with realistic parameters
3. Trigger nodes (webhook, schedule, email, etc.)
4. Action nodes (HTTP requests, database operations, etc.)
5. Proper node positioning for visual layout

Example n8n workflow structure:
{
  "name": "Workflow Name",
  "nodes": [
    {
      "parameters": {},
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "httpMethod": "GET",
        "path": "webhook-path",
        "responseMode": "onReceived"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [460, 300]
    }
  ],
  "connections": {
    "Start": {
      "main": [
        [
          {
            "node": "Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {},
  "id": "workflow-id"
}

Always wrap your JSON response in ```json code blocks."""
        
        # Create AI chat instance
        chat = await get_gemini_chat(request.session_id, system_message)
        
        # Enhanced prompt for workflow generation
        prompt = f"""Generate a complete n8n workflow for: {request.description}

Please provide:
1. A brief explanation of what this workflow does
2. The complete n8n workflow JSON structure (wrapped in ```json code blocks)
3. Setup instructions for the user

Make sure the workflow is practical and can be imported directly into n8n."""
        
        # Send message to AI
        user_message = UserMessage(text=prompt)
        ai_response = await chat.send_message(user_message)
        
        # Extract workflow JSON
        workflow_json = parse_workflow_json(ai_response)
        
        if not workflow_json:
            raise HTTPException(status_code=500, detail="Could not generate valid workflow JSON")
        
        # Save workflow to database
        workflow = Workflow(
            user_id="demo-user",  # For now, using demo user
            session_id=request.session_id,
            name=workflow_json.get("name", "Generated Workflow"),
            description=request.description,
            workflow_json=workflow_json,
            ai_model_used="gemini-2.0-flash",
            status="generated"
        )
        
        await db.workflows.insert_one(workflow.dict())
        
        return {
            "workflow_json": workflow_json,
            "explanation": ai_response,
            "workflow_id": workflow.id,
            "session_id": request.session_id
        }
        
    except Exception as e:
        logging.error(f"Workflow generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Workflow generation error: {str(e)}")

@api_router.get("/workflows/{session_id}")
async def get_workflows(session_id: str):
    """Get all workflows for a session"""
    try:
        workflows = await db.workflows.find({"session_id": session_id}).to_list(1000)
        return [Workflow(**workflow) for workflow in workflows]
    except Exception as e:
        logging.error(f"Get workflows error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Get workflows error: {str(e)}")

@api_router.get("/chat-history/{session_id}")
async def get_chat_history(session_id: str):
    """Get chat history for a session"""
    try:
        messages = await db.chat_messages.find({"session_id": session_id}).sort("timestamp", 1).to_list(1000)
        return [ChatMessage(**message) for message in messages]
    except Exception as e:
        logging.error(f"Get chat history error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Get chat history error: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()