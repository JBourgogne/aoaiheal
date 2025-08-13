import copy
import json
import os
import logging
import uuid
import httpx
from quart import (
    Blueprint,
    Quart,
    jsonify,
    make_response,
    request,
    send_from_directory,
)
from quart_cors import cors
from openai import AsyncAzureOpenAI
from azure.identity.aio import DefaultAzureCredential, get_bearer_token_provider
from backend.auth.auth_utils import get_authenticated_user_details
from backend.history.cosmosdbservice import CosmosConversationClient
from backend.utils import format_as_ndjson, format_stream_response, generateFilterString, parse_multi_columns, format_non_streaming_response
import jwt
from jwt.exceptions import InvalidTokenError
from azure.cosmos import CosmosClient, exceptions
from azure.cosmos.exceptions import CosmosHttpResponseError

# Current minimum Azure OpenAI version supported
MINIMUM_SUPPORTED_AZURE_OPENAI_PREVIEW_API_VERSION = "2024-02-15-preview"

# UI configuration
UI_TITLE = os.environ.get("UI_TITLE") or "HEALio"
UI_LOGO = os.environ.get("UI_LOGO")
UI_CHAT_LOGO = os.environ.get("UI_CHAT_LOGO")
UI_CHAT_TITLE = os.environ.get("UI_CHAT_TITLE") or "Start chatting with HEAL"
UI_CHAT_DESCRIPTION = os.environ.get("UI_CHAT_DESCRIPTION") or "This chatbot is configured to guide you on your health journey"
UI_FAVICON = os.environ.get("UI_FAVICON") or "/favicon.ico"
UI_SHOW_SHARE_BUTTON = os.environ.get("UI_SHOW_SHARE_BUTTON", "true").lower() == "true"

# CosmosDB Configuration
USER_DETAILS_CONTAINER_NAME = 'UserDetails'
AZURE_COSMOSDB_DATABASE = os.environ.get("AZURE_COSMOSDB_DATABASE")
AZURE_COSMOSDB_ACCOUNT = os.environ.get("AZURE_COSMOSDB_ACCOUNT")
AZURE_COSMOSDB_CONVERSATIONS_CONTAINER = os.environ.get("AZURE_COSMOSDB_CONVERSATIONS_CONTAINER")
AZURE_COSMOSDB_ACCOUNT_KEY = os.environ.get("AZURE_COSMOSDB_ACCOUNT_KEY")
AZURE_COSMOSDB_ACCOUNT_URI = os.environ.get("AZURE_COSMOSDB_ACCOUNT_URI")
AZURE_COSMOSDB_ENABLE_FEEDBACK = os.environ.get("AZURE_COSMOSDB_ENABLE_FEEDBACK", "true").lower() == "true"
AZURE_COSMOSDB_USER_DETAILS_CONTAINER = 'userdetails'
AZURE_COSMOSDB_USER_DETAILS_DATABASE = 'userdetails'

# Global cosmos client holders
cosmos_clients = None

def init_cosmos_clients():
    """Initialize CosmosDB clients safely"""
    global cosmos_clients
    try:
        url = AZURE_COSMOSDB_ACCOUNT_URI
        if not url:
            logging.warning("Cosmos DB URL not configured")
            return None
        
        key = AZURE_COSMOSDB_ACCOUNT_KEY
        if not key:
            logging.warning("Cosmos DB key not configured")
            return None
            
        client = CosmosClient(url, credential=key)
        
        # User details containers
        database = client.get_database_client(AZURE_COSMOSDB_USER_DETAILS_DATABASE)
        container = database.get_container_client(AZURE_COSMOSDB_USER_DETAILS_CONTAINER)
        user_details_container = database.get_container_client(USER_DETAILS_CONTAINER_NAME)
        
        cosmos_clients = {
            'client': client,
            'database': database,
            'container': container,
            'user_details_container': user_details_container
        }
        
        logging.info("CosmosDB clients initialized successfully")
        return cosmos_clients
    except Exception as e:
        logging.error(f"Failed to initialize CosmosDB: {e}")
        return None

# Debug settings
DEBUG = os.environ.get("DEBUG", "false")
if DEBUG.lower() == "true":
    logging.basicConfig(level=logging.DEBUG)

USER_AGENT = "GitHubSampleWebApp/AsyncAzureOpenAI/1.0.0"

# On Your Data Settings
DATASOURCE_TYPE = os.environ.get("DATASOURCE_TYPE", "AzureCognitiveSearch")
SEARCH_TOP_K = os.environ.get("SEARCH_TOP_K", 5)
SEARCH_STRICTNESS = os.environ.get("SEARCH_STRICTNESS", 3)
SEARCH_ENABLE_IN_DOMAIN = os.environ.get("SEARCH_ENABLE_IN_DOMAIN", "true")

# ACS Integration Settings
AZURE_SEARCH_SERVICE = os.environ.get("AZURE_SEARCH_SERVICE")
AZURE_SEARCH_INDEX = os.environ.get("AZURE_SEARCH_INDEX")
AZURE_SEARCH_KEY = os.environ.get("AZURE_SEARCH_KEY", None)
AZURE_SEARCH_USE_SEMANTIC_SEARCH = os.environ.get("AZURE_SEARCH_USE_SEMANTIC_SEARCH", "false")
AZURE_SEARCH_SEMANTIC_SEARCH_CONFIG = os.environ.get("AZURE_SEARCH_SEMANTIC_SEARCH_CONFIG", "default")
AZURE_SEARCH_TOP_K = os.environ.get("AZURE_SEARCH_TOP_K", SEARCH_TOP_K)
AZURE_SEARCH_ENABLE_IN_DOMAIN = os.environ.get("AZURE_SEARCH_ENABLE_IN_DOMAIN", SEARCH_ENABLE_IN_DOMAIN)
AZURE_SEARCH_CONTENT_COLUMNS = os.environ.get("AZURE_SEARCH_CONTENT_COLUMNS")
AZURE_SEARCH_FILENAME_COLUMN = os.environ.get("AZURE_SEARCH_FILENAME_COLUMN")
AZURE_SEARCH_TITLE_COLUMN = os.environ.get("AZURE_SEARCH_TITLE_COLUMN")
AZURE_SEARCH_URL_COLUMN = os.environ.get("AZURE_SEARCH_URL_COLUMN")
AZURE_SEARCH_VECTOR_COLUMNS = os.environ.get("AZURE_SEARCH_VECTOR_COLUMNS")
AZURE_SEARCH_QUERY_TYPE = os.environ.get("AZURE_SEARCH_QUERY_TYPE")
AZURE_SEARCH_PERMITTED_GROUPS_COLUMN = os.environ.get("AZURE_SEARCH_PERMITTED_GROUPS_COLUMN")
AZURE_SEARCH_STRICTNESS = os.environ.get("AZURE_SEARCH_STRICTNESS", SEARCH_STRICTNESS)

# AOAI Integration Settings
AZURE_OPENAI_RESOURCE = os.environ.get("AZURE_OPENAI_RESOURCE")
AZURE_OPENAI_MODEL = os.environ.get("AZURE_OPENAI_MODEL")
AZURE_OPENAI_ENDPOINT = os.environ.get("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_KEY = os.environ.get("AZURE_OPENAI_KEY")
AZURE_OPENAI_TEMPERATURE = os.environ.get("AZURE_OPENAI_TEMPERATURE", 0)
AZURE_OPENAI_TOP_P = os.environ.get("AZURE_OPENAI_TOP_P", 1.0)
AZURE_OPENAI_MAX_TOKENS = os.environ.get("AZURE_OPENAI_MAX_TOKENS", 1000)
AZURE_OPENAI_STOP_SEQUENCE = os.environ.get("AZURE_OPENAI_STOP_SEQUENCE")
AZURE_OPENAI_SYSTEM_MESSAGE = os.environ.get(
    "AZURE_OPENAI_SYSTEM_MESSAGE",
    "You are an AI assistant that helps people find information.",
)
AZURE_OPENAI_PREVIEW_API_VERSION = os.environ.get(
    "AZURE_OPENAI_PREVIEW_API_VERSION",
    MINIMUM_SUPPORTED_AZURE_OPENAI_PREVIEW_API_VERSION,
)
AZURE_OPENAI_STREAM = os.environ.get("AZURE_OPENAI_STREAM", "true")
AZURE_OPENAI_MODEL_NAME = os.environ.get("AZURE_OPENAI_MODEL_NAME", "gpt-35-turbo-16k")
AZURE_OPENAI_EMBEDDING_ENDPOINT = os.environ.get("AZURE_OPENAI_EMBEDDING_ENDPOINT")
AZURE_OPENAI_EMBEDDING_KEY = os.environ.get("AZURE_OPENAI_EMBEDDING_KEY")
AZURE_OPENAI_EMBEDDING_NAME = os.environ.get("AZURE_OPENAI_EMBEDDING_NAME", "")

SHOULD_STREAM = True if AZURE_OPENAI_STREAM.lower() == "true" else False

# Chat History CosmosDB Integration Settings
CHAT_HISTORY_ENABLED = AZURE_COSMOSDB_ACCOUNT and AZURE_COSMOSDB_DATABASE and AZURE_COSMOSDB_CONVERSATIONS_CONTAINER

# Frontend Settings via Environment Variables
SANITIZE_ANSWER = os.environ.get("SANITIZE_ANSWER", "false").lower() == "true"
AUTH_ENABLED = os.environ.get("AUTH_ENABLED", "true").lower() == "true"

frontend_settings = { 
    "auth_enabled": AUTH_ENABLED, 
    "feedback_enabled": AZURE_COSMOSDB_ENABLE_FEEDBACK and CHAT_HISTORY_ENABLED,
    "ui": {
        "title": UI_TITLE,
        "logo": UI_LOGO,
        "chat_logo": UI_CHAT_LOGO or UI_LOGO,
        "chat_title": UI_CHAT_TITLE,
        "chat_description": UI_CHAT_DESCRIPTION,
        "show_share_button": UI_SHOW_SHARE_BUTTON,
    },
    "sanitize_answer": SANITIZE_ANSWER,
}

# JWT Configuration
JWT_SECRET = os.environ.get("JWT_SECRET")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")

def decode_jwt(token):
    if not JWT_SECRET:
        logging.warning("JWT_SECRET not set, using placeholder")
        JWT_SECRET_LOCAL = "dev-secret-key"
    else:
        JWT_SECRET_LOCAL = JWT_SECRET
        
    try:
        return jwt.decode(token, JWT_SECRET_LOCAL, algorithms=[JWT_ALGORITHM])
    except InvalidTokenError:
        from quart import abort
        abort(401, description="Invalid token")

# Check if data source is configured
def should_use_data():
    global DATASOURCE_TYPE
    if AZURE_SEARCH_SERVICE and AZURE_SEARCH_INDEX:
        DATASOURCE_TYPE = "AzureCognitiveSearch"
        logging.debug("Using Azure Cognitive Search")
        return True
    return False

SHOULD_USE_DATA = should_use_data()

# Initialize Azure OpenAI Client
def init_openai_client():
    try:
        if (
            AZURE_OPENAI_PREVIEW_API_VERSION
            < MINIMUM_SUPPORTED_AZURE_OPENAI_PREVIEW_API_VERSION
        ):
            raise Exception(
                f"The minimum supported Azure OpenAI preview API version is '{MINIMUM_SUPPORTED_AZURE_OPENAI_PREVIEW_API_VERSION}'"
            )

        if not AZURE_OPENAI_ENDPOINT and not AZURE_OPENAI_RESOURCE:
            raise Exception(
                "AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_RESOURCE is required"
            )

        endpoint = (
            AZURE_OPENAI_ENDPOINT
            if AZURE_OPENAI_ENDPOINT
            else f"https://{AZURE_OPENAI_RESOURCE}.openai.azure.com/"
        )

        aoai_api_key = AZURE_OPENAI_KEY
        ad_token_provider = None
        if not aoai_api_key:
            logging.debug("No AZURE_OPENAI_KEY found, using Azure AD auth")
            ad_token_provider = get_bearer_token_provider(
                DefaultAzureCredential(), "https://cognitiveservices.azure.com/.default"
            )

        deployment = AZURE_OPENAI_MODEL
        if not deployment:
            raise Exception("AZURE_OPENAI_MODEL is required")

        default_headers = {"x-ms-useragent": USER_AGENT}

        azure_openai_client = AsyncAzureOpenAI(
            api_version=AZURE_OPENAI_PREVIEW_API_VERSION,
            api_key=aoai_api_key,
            azure_ad_token_provider=ad_token_provider,
            default_headers=default_headers,
            azure_endpoint=endpoint,
        )

        return azure_openai_client
    except Exception as e:
        logging.exception("Exception in Azure OpenAI initialization")
        raise e

# Initialize CosmosDB Client for Chat History
def init_cosmosdb_client():
    cosmos_conversation_client = None
    if CHAT_HISTORY_ENABLED:
        try:
            cosmos_endpoint = f'https://{AZURE_COSMOSDB_ACCOUNT}.documents.azure.com:443/'

            if not AZURE_COSMOSDB_ACCOUNT_KEY:
                credential = DefaultAzureCredential()
            else:
                credential = AZURE_COSMOSDB_ACCOUNT_KEY

            cosmos_conversation_client = CosmosConversationClient(
                cosmosdb_endpoint=cosmos_endpoint, 
                credential=credential, 
                database_name=AZURE_COSMOSDB_DATABASE,
                container_name=AZURE_COSMOSDB_CONVERSATIONS_CONTAINER,
                enable_message_feedback=AZURE_COSMOSDB_ENABLE_FEEDBACK,
            )
        except Exception as e:
            logging.exception("Exception in CosmosDB initialization")
            cosmos_conversation_client = None
            raise e
    else:
        logging.debug("CosmosDB not configured")

    return cosmos_conversation_client

# Prepare model args for OpenAI
def prepare_model_args(request_body):
    request_messages = request_body.get("messages", [])
    messages = [{"role": "system", "content": AZURE_OPENAI_SYSTEM_MESSAGE}]

    for message in request_messages:
        if message:
            messages.append({"role": message["role"], "content": message["content"]})

    model_args = {
        "messages": messages,
        "temperature": float(AZURE_OPENAI_TEMPERATURE),
        "max_tokens": int(AZURE_OPENAI_MAX_TOKENS),
        "top_p": float(AZURE_OPENAI_TOP_P),
        "stream": SHOULD_STREAM,
        "model": AZURE_OPENAI_MODEL,
    }

    return model_args

# Chat Request Handler
async def send_chat_request(request):
    filtered_messages = [message for message in request['messages'] if message['role'] != 'tool']
    request['messages'] = filtered_messages
    model_args = prepare_model_args(request)

    try:
        azure_openai_client = init_openai_client()
        response = await azure_openai_client.chat.completions.create(**model_args)
    except Exception as e:
        logging.exception("Exception in send_chat_request")
        raise e

    return response

async def complete_chat_request(request_body):
    response = await send_chat_request(request_body)
    history_metadata = request_body.get("history_metadata", {})
    return format_non_streaming_response(response, history_metadata)

async def stream_chat_request(request_body):
    response = await send_chat_request(request_body)
    history_metadata = request_body.get("history_metadata", {})

    async def generate():
        async for completionChunk in response:
            yield format_stream_response(completionChunk, history_metadata)

    return generate()

async def conversation_internal(request_body):
    try:
        if SHOULD_STREAM:
            result = await stream_chat_request(request_body)
            response = await make_response(format_as_ndjson(result))
            response.timeout = None
            response.mimetype = "application/json-lines"
            return response
        else:
            result = await complete_chat_request(request_body)
            return jsonify(result)

    except Exception as ex:
        logging.exception(ex)
        if hasattr(ex, "status_code"):
            return jsonify({"error": str(ex)}), ex.status_code
        else:
            return jsonify({"error": str(ex)}), 500

# Generate a title for the conversation
async def generate_title(conversation_messages):
    title_prompt = 'Summarize the conversation so far into a 4-word or less title. Do not use any quotation marks or punctuation. Respond with a json object in the format {{"title": string}}. Do not include any other commentary or description.'

    messages = [
        {"role": msg["role"], "content": msg["content"]}
        for msg in conversation_messages
    ]
    messages.append({"role": "user", "content": title_prompt})

    try:
        azure_openai_client = init_openai_client()
        response = await azure_openai_client.chat.completions.create(
            model=AZURE_OPENAI_MODEL, messages=messages, temperature=1, max_tokens=64
        )

        title = json.loads(response.choices[0].message.content)["title"]
        return title
    except Exception as e:
        return messages[-2]['content']

# Create app function
def create_app():
    app = Quart(__name__)
    
    # Initialize CosmosDB on app startup
    init_cosmos_clients()
    
    # Create main blueprint
    main_bp = Blueprint("main", __name__, static_folder="static", template_folder="static")
    
    # Create user blueprint  
    user_bp = Blueprint('user', __name__, url_prefix='/api/user')
    user_bp = cors(user_bp, allow_origin="*")  # Configure appropriately for production
    
    @main_bp.route("/")
    async def index():
        return await send_from_directory(app.static_folder, "index.html")

    @main_bp.route("/favicon.ico")
    async def favicon():
        return await send_from_directory("static", "favicon.ico")

    @main_bp.route("/assets/<path:path>")
    async def assets(path):
        return await send_from_directory("static/assets", path)

    @main_bp.route("/frontend_settings", methods=["GET"])
    def get_frontend_settings():
        try:
            return jsonify(frontend_settings), 200
        except Exception as e:
            logging.exception("Exception in /frontend_settings")
            return jsonify({"error": str(e)}), 500

    @main_bp.route("/conversation", methods=["POST"])
    async def conversation():
        if not request.is_json:
            return jsonify({"error": "request must be json"}), 415
        request_json = await request.get_json()
        return await conversation_internal(request_json)

    # User Details Routes
    @user_bp.route('/details/<user_id>', methods=['GET'])
    async def get_user_details(user_id):
        try:
            if not cosmos_clients or not cosmos_clients['container']:
                return jsonify({"error": "Database not configured"}), 500
                
            container = cosmos_clients['container']
            query = "SELECT * FROM c WHERE c.userId = @userId"
            items = list(container.query_items(
                query=query,
                parameters=[{"name": "@userId", "value": user_id}],
                enable_cross_partition_query=True
            ))
            
            if items:
                return jsonify(items[0]), 200
            else:
                # Create new user profile
                new_user_profile = {
                    "id": str(uuid.uuid4()),
                    "userId": user_id,
                    "answers": []
                }
                container.upsert_item(new_user_profile)
                return jsonify(new_user_profile), 201
                
        except CosmosHttpResponseError as e:
            return jsonify({"error": str(e)}), 500

    @user_bp.route('/details/<user_id>', methods=['POST'])
    async def update_user_details(user_id):
        data = await request.get_json()
        try:
            if not cosmos_clients or not cosmos_clients['container']:
                return jsonify({"error": "Database not configured"}), 500
                
            container = cosmos_clients['container']
            
            # Fetch existing or create new
            existing_items = list(container.query_items(
                query="SELECT * FROM c WHERE c.userId = @userId",
                parameters=[{"name": "@userId", "value": user_id}],
                enable_cross_partition_query=True
            ))
            
            if existing_items:
                user_doc = existing_items[0]
                # Update with new data
                for key, value in data.items():
                    user_doc[key] = value
            else:
                user_doc = {
                    "id": str(uuid.uuid4()),
                    "userId": user_id,
                    **data
                }
            
            container.upsert_item(user_doc)
            return jsonify({"message": "User details updated successfully"}), 200
            
        except CosmosHttpResponseError as e:
            return jsonify({"error": str(e)}), 500

    ## Conversation History API ##
    @main_bp.route("/history/generate", methods=["POST"])
    async def add_conversation():
        authenticated_user = get_authenticated_user_details(request_headers=request.headers)
        user_id = authenticated_user["user_principal_id"]

        request_json = await request.get_json()
        conversation_id = request_json.get("conversation_id", None)

        try:
            cosmos_conversation_client = init_cosmosdb_client()
            if not cosmos_conversation_client:
                raise Exception("CosmosDB is not configured or not working")

            history_metadata = {}
            if not conversation_id:
                title = await generate_title(request_json["messages"])
                conversation_dict = await cosmos_conversation_client.create_conversation(
                    user_id=user_id, title=title
                )
                conversation_id = conversation_dict["id"]
                history_metadata["title"] = title
                history_metadata["date"] = conversation_dict["createdAt"]

            messages = request_json["messages"]
            if len(messages) > 0 and messages[-1]["role"] == "user":
                createdMessageValue = await cosmos_conversation_client.create_message(
                    uuid=str(uuid.uuid4()),
                    conversation_id=conversation_id,
                    user_id=user_id,
                    input_message=messages[-1],
                )
                if createdMessageValue == "Conversation not found":
                    raise Exception(
                        "Conversation not found for the given conversation ID: "
                        + conversation_id
                        + "."
                    )
            else:
                raise Exception("No user message found")

            await cosmos_conversation_client.cosmosdb_client.close()

            request_body = await request.get_json()
            history_metadata["conversation_id"] = conversation_id
            request_body["history_metadata"] = history_metadata
            return await conversation_internal(request_body)

        except Exception as e:
            logging.exception("Exception in /history/generate")
            return jsonify({"error": str(e)}), 500

    # Register blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(user_bp)
    
    app.config["TEMPLATES_AUTO_RELOAD"] = True
    
    return app

# Required environment variables check
REQUIRED_ENV_VARS = [
    "AZURE_OPENAI_ENDPOINT",
    "AZURE_OPENAI_KEY", 
    "AZURE_OPENAI_MODEL"
]

def check_environment():
    """Check if all required environment variables are set"""
    missing = [var for var in REQUIRED_ENV_VARS if not os.environ.get(var)]
    if missing:
        logging.warning(f"Missing environment variables: {missing}")

# Application startup
if __name__ == "__main__":
    check_environment()
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=DEBUG.lower() == "true", host="0.0.0.0", port=port)
