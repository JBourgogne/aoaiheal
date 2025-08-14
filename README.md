# [HEAL] # HEALio - AI-Powered Health Assistant

A comprehensive Azure OpenAI-powered chat application designed to guide users on their health journey. Built with modern cloud-native architecture and enterprise-grade Azure services.

## 🌟 Features

- **Intelligent Health Conversations** - AI-powered chat using Azure OpenAI
- **User Profile Management** - Personalized health tracking and goal setting
- **Conversation History** - Persistent chat history with CosmosDB
- **Document Processing** - PDF and document analysis with Form Recognizer
- **Vector Search** - Advanced search capabilities with Azure Cognitive Search
- **Multi-Data Source Support** - Azure Search, CosmosDB, Elasticsearch, Pinecone
- **Enterprise Authentication** - Azure AD integration with EasyAuth
- **Responsive Frontend** - React-based user interface
- **Cloud-Native Deployment** - Complete Azure infrastructure automation

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend│    │   Quart Backend  │    │  Azure Services │
│                 │    │                  │    │                 │
│ • Chat Interface│◄──►│ • API Routes     │◄──►│ • Azure OpenAI  │
│ • User Profiles │    │ • Authentication │    │ • CosmosDB      │
│ • History       │    │ • Data Processing│    │ • Cognitive     │
│                 │    │                  │    │   Search        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 16+
- Azure CLI
- Azure Developer CLI (azd)
- Azure subscription with OpenAI access

### Option 1: Azure Developer CLI (Recommended)

1. **Clone and initialize**
   ```bash
   git clone <repository>
   cd healio
   azd auth login
   ```

2. **Deploy to Azure**
   ```bash
   azd up
   ```
   This will:
   - Provision all Azure resources
   - Deploy the application
   - Set up authentication
   - Configure environment variables

3. **Access your application**
   ```bash
   # URL will be displayed after deployment
   https://your-app-name.azurewebsites.net
   ```

### Option 2: Local Development

1. **Set environment variables**
   ```bash
   export AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
   export AZURE_OPENAI_KEY="your-openai-key"
   export AZURE_OPENAI_MODEL="your-deployment-name"
   
   # Optional: For full functionality
   export AZURE_COSMOSDB_ACCOUNT_URI="https://your-cosmosdb.documents.azure.com:443/"
   export AZURE_COSMOSDB_ACCOUNT_KEY="your-cosmosdb-key"
   export JWT_SECRET="your-secure-secret"
   ```

2. **Install dependencies and run**
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Install and build frontend
   cd frontend
   npm install
   npm run build
   cd ..
   
   # Start the application
   ./start.sh  # or start.cmd on Windows
   ```

3. **Access locally**
   ```
   http://127.0.0.1:5000
   ```

### Option 3: Manual Azure Deployment

1. **Create Azure resources**
   ```bash
   az deployment group create \
     --resource-group your-rg \
     --template-file infrastructure/deployment.json \
     --parameters @infrastructure/parameters.json
   ```

2. **Deploy application code**
   ```bash
   az webapp up --name your-app-name --resource-group your-rg
   ```

## 📁 Project Structure

```
healio/
├── 📄 app.py                    # Main Quart application
├── 📁 backend/                  # Backend modules
│   ├── 📁 auth/                 # Authentication utilities
│   │   ├── auth_utils.py        # Azure EasyAuth integration
│   │   └── sample_user.py       # Development user data
│   ├── 📁 history/              # Conversation management
│   │   └── cosmosdbservice.py   # CosmosDB service layer
│   └── utils.py                 # Response formatting & utilities
├── 📁 frontend/                 # React frontend (not shown)
├── 📁 infra/                    # Infrastructure as Code
│   ├── main.bicep              # Main deployment template
│   ├── 📁 core/                # Reusable Bicep modules
│   └── abbreviations.json      # Azure naming conventions
├── 📁 scripts/                  # Automation & data processing
│   ├── data_preparation.py     # Document processing
│   ├── prepdocs.py             # Search index preparation
│   └── auth_*.py               # Authentication setup
├── 📁 static/                   # Built frontend assets
├── requirements.txt             # Python dependencies
├── start.sh / start.cmd        # Development startup scripts
└── azure.yaml                  # Azure Developer CLI config
```

## 🔧 Configuration

### Environment Variables

#### Required (Minimum functionality)
```bash
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_KEY=your-openai-key
AZURE_OPENAI_MODEL=your-deployment-name
```

#### Optional (Enhanced functionality)
```bash
# Database
AZURE_COSMOSDB_ACCOUNT_URI=https://your-cosmosdb.documents.azure.com:443/
AZURE_COSMOSDB_ACCOUNT_KEY=your-cosmosdb-key
AZURE_COSMOSDB_DATABASE=conversations
AZURE_COSMOSDB_CONVERSATIONS_CONTAINER=conversations

# Search
AZURE_SEARCH_SERVICE=your-search-service
AZURE_SEARCH_INDEX=your-index
AZURE_SEARCH_KEY=your-search-key

# Security
JWT_SECRET=your-secure-secret-key
AUTH_ENABLED=true

# UI Customization
UI_TITLE=HEALio
UI_CHAT_TITLE=Start chatting with HEAL
UI_CHAT_DESCRIPTION=This chatbot is configured to guide you on your health journey
```

### Azure Resources Required

| Service | Purpose | SKU |
|---------|---------|-----|
| Azure OpenAI | AI chat functionality | Standard |
| App Service | Web application hosting | B1+ |
| CosmosDB | Conversation & user data | Serverless |
| Cognitive Search | Document search | Standard |
| Form Recognizer | Document processing | S0 |
| Application Insights | Monitoring | Free |

## 🔐 Authentication

The application supports Azure AD authentication via EasyAuth:

1. **Development Mode**: Uses sample user data
2. **Production Mode**: Requires Azure AD app registration
3. **API Access**: JWT token validation for API endpoints

To disable authentication for testing:
```bash
export AUTH_ENABLED=false
```

## 📊 Data Management

### Document Processing

Process and index documents for search:

```bash
# Prepare documents for search indexing
python scripts/data_preparation.py \
  --config scripts/config.json \
  --form-rec-resource your-form-recognizer \
  --form-rec-key your-key \
  --embedding-model-endpoint your-embedding-endpoint \
  --embedding-model-key your-embedding-key
```

### Conversation History

Conversations are automatically stored in CosmosDB when configured:
- User conversations with full message history
- Message feedback and ratings
- Conversation titles and metadata

### User Profiles

User data management includes:
- Health questionnaire responses
- Personal health goals
- Conversation preferences
- Progress tracking

## 🎨 Customization

### UI Theming

Customize the interface via environment variables:

```bash
UI_TITLE="Your Health Assistant"
UI_LOGO="https://your-domain.com/logo.png"
UI_CHAT_TITLE="Welcome to your health journey"
UI_CHAT_DESCRIPTION="Ask me anything about your health"
UI_SHOW_SHARE_BUTTON=true
```

### AI Behavior

Adjust AI responses:

```bash
AZURE_OPENAI_TEMPERATURE=0.7     # Creativity (0-2)
AZURE_OPENAI_MAX_TOKENS=1000     # Response length
AZURE_OPENAI_SYSTEM_MESSAGE="You are a helpful health assistant..."
```

## 🚀 Deployment

### Production Deployment

1. **Using Azure Developer CLI**
   ```bash
   azd up --environment production
   ```

2. **Configure custom domain**
   ```bash
   az webapp config hostname add \
     --webapp-name your-app \
     --resource-group your-rg \
     --hostname your-domain.com
   ```

3. **Enable SSL**
   ```bash
   az webapp config ssl bind \
     --certificate-thumbprint your-cert \
     --ssl-type SNI \
     --name your-app \
     --resource-group your-rg
   ```

### Scaling Configuration

Update `gunicorn.conf.py` for production workloads:

```python
bind = "0.0.0.0:8000"
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 120
```

## 🔍 Monitoring

### Application Insights

Monitor application performance:
- Request/response times
- Error rates and exceptions
- User engagement metrics
- Custom health metrics

### Health Checks

Built-in health endpoints:
- `/frontend_settings` - Configuration status
- `/history/ensure` - Database connectivity

## 🧪 Testing

### API Testing

Test chat functionality:
```bash
# Health check
curl http://localhost:5000/frontend_settings

# Chat test
curl -X POST http://localhost:5000/conversation \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello, can you help me with my health?"}]}'
```

### Load Testing

Use Azure Load Testing or tools like Artillery:
```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery quick --count 10 --num 5 http://your-app.azurewebsites.net
```

## 🛠️ Development

### Local Development Setup

1. **Backend development**
   ```bash
   python -m uvicorn app:app --reload --port 5000
   ```

2. **Frontend development**
   ```bash
   cd frontend
   npm start  # Runs on port 3000
   ```

3. **Database development**
   ```bash
   # Use Cosmos DB Emulator for local development
   docker run -p 8081:8081 -p 10251:10251 -p 10252:10252 -p 10253:10253 -p 10254:10254 \
     mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator
   ```

### Adding New Features

1. **New API endpoints**: Add to `app.py` with proper blueprints
2. **Database models**: Extend CosmosDB service in `backend/history/`
3. **UI components**: Add to React frontend
4. **Infrastructure**: Update Bicep templates in `infra/`

## 🐛 Troubleshooting

### Common Issues

**Application won't start**
- Check required environment variables are set
- Verify Azure OpenAI credentials
- Review application logs

**CosmosDB connection errors**
- Verify account URI and key
- Check firewall settings
- Ensure containers exist

**Authentication issues**
- Verify Azure AD app registration
- Check redirect URIs
- Review EasyAuth configuration

**Search not working**
- Verify search service credentials
- Check index exists and has data
- Review search configuration

### Debug Mode

Enable detailed logging:
```bash
export DEBUG=true
python app.py
```

### Logs

View application logs:
```bash
# Azure App Service
az webapp log tail --name your-app --resource-group your-rg

# Local development
tail -f app.log
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the `/scripts/readme.md` for detailed setup instructions
- **Issues**: Create an issue in the repository
- **Azure Support**: Contact Azure support for service-related issues

## 🙏 Acknowledgments

- Built on Microsoft's Azure OpenAI sample architecture
- Uses Azure Developer CLI for seamless deployment
- Inspired by modern healthcare AI applications

---

**Ready to transform healthcare with AI? Get started with HEALio today!** 🏥✨


### Best Practices
We recommend keeping these best practices in mind:

- Reset the chat session (clear chat) if the user changes any settings. Notify the user that their chat history will be lost.
- Clearly communicate to the user what impact each setting will have on their experience.
- When you rotate API keys for your AOAI or ACS resource, be sure to update the app settings for each of your deployed apps to use the new key.
- Pull in changes from `main` frequently to ensure you have the latest bug fixes and improvements, especially when using Azure OpenAI on your data.

**A note on Azure OpenAI API versions**: The application code in this repo will implement the request and response contracts for the most recent preview API version supported for Azure OpenAI.  To keep your application up-to-date as the Azure OpenAI API evolves with time, be sure to merge the latest API version update into your own application code and redeploy using the methods described in this document.

## Environment variables

Note: settings starting with `AZURE_SEARCH` are only needed when using Azure OpenAI on your data with Azure AI Search. If not connecting to your data, you only need to specify `AZURE_OPENAI` settings.

| App Setting | Value | Note |
| --- | --- | ------------- |
|AZURE_SEARCH_SERVICE||The name of your Azure AI Search resource|
|AZURE_SEARCH_INDEX||The name of your Azure AI Search Index|
|AZURE_SEARCH_KEY||An **admin key** for your Azure AI Search resource|
|AZURE_SEARCH_USE_SEMANTIC_SEARCH|False|Whether or not to use semantic search|
|AZURE_SEARCH_QUERY_TYPE|simple|Query type: simple, semantic, vector, vectorSimpleHybrid, or vectorSemanticHybrid. Takes precedence over AZURE_SEARCH_USE_SEMANTIC_SEARCH|
|AZURE_SEARCH_SEMANTIC_SEARCH_CONFIG||The name of the semantic search configuration to use if using semantic search.|
|AZURE_SEARCH_TOP_K|5|The number of documents to retrieve from Azure AI Search.|
|AZURE_SEARCH_ENABLE_IN_DOMAIN|True|Limits responses to only queries relating to your data.|
|AZURE_SEARCH_CONTENT_COLUMNS||List of fields in your Azure AI Search index that contains the text content of your documents to use when formulating a bot response. Represent these as a string joined with "|", e.g. `"product_description|product_manual"`|
|AZURE_SEARCH_FILENAME_COLUMN|| Field from your Azure AI Search index that gives a unique idenitfier of the source of your data to display in the UI.|
|AZURE_SEARCH_TITLE_COLUMN||Field from your Azure AI Search index that gives a relevant title or header for your data content to display in the UI.|
|AZURE_SEARCH_URL_COLUMN||Field from your Azure AI Search index that contains a URL for the document, e.g. an Azure Blob Storage URI. This value is not currently used.|
|AZURE_SEARCH_VECTOR_COLUMNS||List of fields in your Azure AI Search index that contain vector embeddings of your documents to use when formulating a bot response. Represent these as a string joined with "|", e.g. `"product_description|product_manual"`|
|AZURE_SEARCH_PERMITTED_GROUPS_COLUMN||Field from your Azure AI Search index that contains AAD group IDs that determine document-level access control.|
|AZURE_SEARCH_STRICTNESS|3|Integer from 1 to 5 specifying the strictness for the model limiting responses to your data.|
|AZURE_OPENAI_RESOURCE||the name of your Azure OpenAI resource|
|AZURE_OPENAI_MODEL||The name of your model deployment|
|AZURE_OPENAI_ENDPOINT||The endpoint of your Azure OpenAI resource.|
|AZURE_OPENAI_MODEL_NAME|gpt-35-turbo-16k|The name of the model|
|AZURE_OPENAI_KEY||One of the API keys of your Azure OpenAI resource|
|AZURE_OPENAI_TEMPERATURE|0|What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. A value of 0 is recommended when using your data.|
|AZURE_OPENAI_TOP_P|1.0|An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. We recommend setting this to 1.0 when using your data.|
|AZURE_OPENAI_MAX_TOKENS|1000|The maximum number of tokens allowed for the generated answer.|
|AZURE_OPENAI_STOP_SEQUENCE||Up to 4 sequences where the API will stop generating further tokens. Represent these as a string joined with "|", e.g. `"stop1|stop2|stop3"`|
|AZURE_OPENAI_SYSTEM_MESSAGE|You are an AI assistant that helps people find information.|A brief description of the role and tone the model should use|
|AZURE_OPENAI_PREVIEW_API_VERSION|2024-02-15-preview|API version when using Azure OpenAI on your data|
|AZURE_OPENAI_STREAM|True|Whether or not to use streaming for the response|
|AZURE_OPENAI_EMBEDDING_NAME||The name of your embedding model deployment if using vector search.
|UI_TITLE|Contoso| Chat title (left-top) and page title (HTML)
|UI_LOGO|| Logo (left-top). Defaults to Contoso logo. Configure the URL to your logo image to modify.
|UI_CHAT_LOGO|| Logo (chat window). Defaults to Contoso logo. Configure the URL to your logo image to modify.
|UI_CHAT_TITLE|Start chatting| Title (chat window)
|UI_CHAT_DESCRIPTION|This chatbot is configured to answer your questions| Description (chat window)
|UI_FAVICON|| Defaults to Contoso favicon. Configure the URL to your favicon to modify.
|UI_SHOW_SHARE_BUTTON|True|Share button (right-top)
|SANITIZE_ANSWER|False|Whether to sanitize the answer from Azure OpenAI. Set to True to remove any HTML tags from the response.|
|USE_PROMPTFLOW|False|Use existing Promptflow deployed endpoint. If set to `True` then both `PROMPTFLOW_ENDPOINT` and `PROMPTFLOW_API_KEY` also need to be set.|
|PROMPTFLOW_ENDPOINT||URL of the deployed Promptflow endpoint e.g. https://pf-deployment-name.region.inference.ml.azure.com/score|
|PROMPTFLOW_API_KEY||Auth key for deployed Promptflow endpoint. Note: only Key-based authentication is supported.|
|PROMPTFLOW_RESPONSE_TIMEOUT|120|Timeout value in seconds for the Promptflow endpoint to respond.|
|PROMPTFLOW_REQUEST_FIELD_NAME|question|Default field name to construct Promptflow request. Note: chat_history is auto constucted based on the interaction, if your API expects other mandatory field you will need to change the request parameters under `promptflow_request` function.|
|PROMPTFLOW_RESPONSE_FIELD_NAME|answer|Default field name to process the response from Promptflow request.|

{
  "clientId": "your-app-client-id-here",
  "clientSecret": "your-new-secret-value-here",
  "subscriptionId": "your-subscription-id-here",
  "tenantId": "your-tenant-id-here"
}
