import unittest
import requests
import json
import time
import os
import uuid
from dotenv import load_dotenv

# Load environment variables from frontend/.env
load_dotenv("frontend/.env")

# Get the backend URL from environment variables
BACKEND_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BACKEND_URL:
    raise ValueError("REACT_APP_BACKEND_URL environment variable not set")

# Ensure the URL ends with /api
API_URL = f"{BACKEND_URL}/api"

class TestN8nWorkflowBuilderAPI(unittest.TestCase):
    """Test suite for the n8n Workflow Builder backend API"""

    def setUp(self):
        """Set up test case - create a unique session ID for each test run"""
        timestamp = int(time.time())
        random_id = str(uuid.uuid4())[:8]
        self.session_id = f"session-{timestamp}-{random_id}"
        print(f"Using session ID: {self.session_id}")
        print(f"API URL: {API_URL}")

    def test_01_api_root(self):
        """Test the API root endpoint"""
        response = requests.get(f"{API_URL}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        print(f"API Root Response: {data}")

    def test_02_status_endpoint(self):
        """Test the status endpoint"""
        # Create a status check
        status_data = {"client_name": "test_client"}
        response = requests.post(f"{API_URL}/status", json=status_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertEqual(data["client_name"], "test_client")
        
        # Get status checks
        response = requests.get(f"{API_URL}/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        print(f"Status Checks: {len(data)} records found")

    def test_03_chat_with_gemini(self):
        """Test the chat endpoint with Gemini AI integration"""
        chat_data = {
            "message": "Create a workflow that monitors Gmail for invoices and saves attachments to Google Drive",
            "session_id": self.session_id
        }
        
        response = requests.post(f"{API_URL}/chat", json=chat_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify response structure
        self.assertIn("response", data)
        self.assertIn("session_id", data)
        self.assertIn("has_workflow", data)
        self.assertEqual(data["session_id"], self.session_id)
        
        # Check if workflow JSON was extracted (may or may not be present)
        if data["has_workflow"]:
            self.assertIn("workflow_json", data)
            self.assertIsInstance(data["workflow_json"], dict)
            print("Workflow JSON was successfully extracted from the chat response")
        
        print(f"Chat Response Length: {len(data['response'])} characters")
        print(f"Has Workflow: {data['has_workflow']}")
        
        return data

    def test_04_generate_workflow(self):
        """Test the generate-workflow endpoint"""
        workflow_data = {
            "description": "Build a workflow that posts to Twitter when a new blog post is published",
            "session_id": self.session_id
        }
        
        response = requests.post(f"{API_URL}/generate-workflow", json=workflow_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify response structure
        self.assertIn("workflow_json", data)
        self.assertIn("explanation", data)
        self.assertIn("workflow_id", data)
        self.assertIn("session_id", data)
        self.assertEqual(data["session_id"], self.session_id)
        
        # Verify workflow JSON structure
        workflow_json = data["workflow_json"]
        self.assertIsInstance(workflow_json, dict)
        self.assertIn("name", workflow_json)
        self.assertIn("nodes", workflow_json)
        self.assertIn("connections", workflow_json)
        
        print(f"Generated Workflow: {workflow_json.get('name')}")
        print(f"Number of Nodes: {len(workflow_json.get('nodes', []))}")
        
        return data

    def test_05_get_workflows(self):
        """Test retrieving workflows for a session"""
        # First generate a workflow to ensure there's data
        self.test_04_generate_workflow()
        
        # Now retrieve workflows for the session
        response = requests.get(f"{API_URL}/workflows/{self.session_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify response structure
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0, "No workflows found for the session")
        
        # Verify workflow structure
        workflow = data[0]
        self.assertIn("id", workflow)
        self.assertIn("user_id", workflow)
        self.assertIn("session_id", workflow)
        self.assertIn("name", workflow)
        self.assertIn("description", workflow)
        self.assertIn("workflow_json", workflow)
        self.assertEqual(workflow["session_id"], self.session_id)
        
        print(f"Retrieved {len(data)} workflows for session {self.session_id}")
        
        return data

    def test_06_get_chat_history(self):
        """Test retrieving chat history for a session"""
        # First send a chat message to ensure there's data
        self.test_03_chat_with_gemini()
        
        # Now retrieve chat history for the session
        response = requests.get(f"{API_URL}/chat-history/{self.session_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify response structure
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0, "No chat messages found for the session")
        
        # Verify chat message structure
        message = data[0]
        self.assertIn("id", message)
        self.assertIn("session_id", message)
        self.assertIn("user_message", message)
        self.assertIn("ai_response", message)
        self.assertEqual(message["session_id"], self.session_id)
        
        print(f"Retrieved {len(data)} chat messages for session {self.session_id}")
        
        return data

    def test_07_error_handling(self):
        """Test error handling for invalid requests"""
        # Test with completely invalid endpoint
        response = requests.post(f"{API_URL}/invalid-endpoint", json={"test": "data"})
        self.assertEqual(response.status_code, 404)
        
        # Test invalid workflow generation request
        invalid_data = {"description": "Test workflow", "invalid_field": "test"}  # Missing session_id
        response = requests.post(f"{API_URL}/generate-workflow", json=invalid_data)
        self.assertNotEqual(response.status_code, 200)
        
        print("Error handling tests completed")

    def test_08_session_management(self):
        """Test session management across multiple requests"""
        # Create a new unique session
        timestamp = int(time.time())
        random_id = str(uuid.uuid4())[:8]
        test_session_id = f"session-{timestamp}-{random_id}-multi"
        
        # Send multiple chat messages in the same session
        messages = [
            "Create a workflow that monitors Twitter for mentions and sends notifications",
            "Add a step to save the Twitter mentions to a database",
            "Can you add error handling to this workflow?"
        ]
        
        for message in messages:
            chat_data = {
                "message": message,
                "session_id": test_session_id
            }
            
            response = requests.post(f"{API_URL}/chat", json=chat_data)
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["session_id"], test_session_id)
        
        # Retrieve chat history for the session
        response = requests.get(f"{API_URL}/chat-history/{test_session_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify all messages are in the history
        self.assertEqual(len(data), len(messages))
        
        # Verify messages are in the correct order
        for i, message in enumerate(messages):
            self.assertEqual(data[i]["user_message"], message)
        
        print(f"Session management test completed with {len(messages)} messages")

if __name__ == "__main__":
    unittest.main(verbosity=2)