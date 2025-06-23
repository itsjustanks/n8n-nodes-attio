# n8n-nodes-attio

This is an n8n community node that allows you to integrate [Attio](https://attio.com) CRM with your n8n workflows.

[Attio](https://attio.com) is a modern CRM built for the future of work, offering powerful data models, flexible workflows, and real-time collaboration features.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

This node supports all Attio API operations as defined in their [OpenAPI specification](https://api.attio.com/openapi.json), including:

- **Objects**: List, Create, Get, Update objects
- **Records**: List, Create, Get, Update, Delete records  
- **Attributes**: List, Create, Get, Update attributes
- **Lists**: List, Create, Get, Update lists
- **Entries**: List, Create, Get, Update, Delete list entries
- **Notes**: Create, Get, Update notes
- **Tasks**: List, Create, Get, Update tasks
- **Comments**: List, Create comments on threads
- **Workspace Members**: List workspace members
- **Webhooks**: Create and manage webhooks
- And more...

## Credentials

To use this node, you'll need an Attio API access token:

1. Log in to your [Attio account](https://app.attio.com)
2. Go to Workspace Settings → Developer → API
3. Create a new API token
4. Copy the token and add it to the Attio credentials in n8n

## AI Agent Tool Compatibility

This node can be used as a tool in n8n's AI Agent workflows. To enable this functionality:

1. Set the environment variable when running n8n:
   ```bash
   N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
   ```

2. In your AI Agent workflow:
   - Add an AI Agent node (e.g., OpenAI Functions Agent)
   - Add the Attio node
   - Connect the Attio node to the AI Agent as a tool

The AI agent will be able to use Attio operations to search, create, and update CRM data based on natural language instructions.

## MCP (Model Context Protocol) Integration

This node is compatible with n8n's MCP Server, allowing AI agents and MCP clients to interact with Attio CRM:

- **AI Agent Tool**: Use Attio operations directly in AI agent workflows
- **MCP Server**: Expose Attio workflows to external MCP clients like Claude Desktop
- **Intelligent CRM**: Build AI-powered workflows that can query and update customer data

See the [MCP Integration Guide](MCP_INTEGRATION_GUIDE.md) for detailed setup instructions and examples.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Attio API documentation](https://docs.attio.com/rest-api)
- [Attio OpenAPI specification](https://api.attio.com/openapi.json)
- [MCP Integration Guide](MCP_INTEGRATION_GUIDE.md)

## Credits

- **Created by**: [@itsjustanks](https://x.com/itsjustanks) | [ankit.com.au](https://ankit.com.au)
- **OpenAPI Integration**: Built using [@devlikeapro/n8n-openapi-node](https://www.npmjs.com/package/@devlikeapro/n8n-openapi-node) - Special thanks to the n8n-openapi-node project for making it easy to convert OpenAPI specs to n8n nodes

## License

[MIT](https://github.com/n8n-io/n8n-nodes-starter/blob/master/LICENSE.md)
