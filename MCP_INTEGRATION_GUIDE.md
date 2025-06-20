# Attio Node MCP Integration Guide

This guide explains how to make your n8n-nodes-attio work with n8n's Model Context Protocol (MCP) Server, allowing AI agents and MCP clients to interact with Attio CRM.

## Prerequisites

1. n8n-nodes-attio installed and working
2. n8n-nodes-mcp installed
3. Environment variable set: `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true`

## What is MCP?

Model Context Protocol (MCP) is an open protocol by Anthropic that enables AI models to interact with external tools and data sources. By exposing your Attio node through MCP, you can:

- Allow AI agents (like Claude) to query and update Attio CRM
- Create intelligent workflows that combine AI decision-making with CRM operations
- Build chatbots that can access customer data from Attio

## Setup Methods

### Method 1: Using Attio as an AI Agent Tool

1. **Create an AI Agent workflow**:
   - Add an AI Agent node (e.g., OpenAI Functions Agent)
   - Add your Attio node as a tool
   - The AI agent can now use Attio operations

2. **Example workflow**:
   ```
   Manual Trigger → AI Agent → Attio Node
   ```

### Method 2: MCP Server with Custom Workflow Tools

1. **Create sub-workflows for each Attio operation**:
   - Search Records workflow
   - Create Record workflow
   - Update Record workflow

2. **Create an MCP Server workflow**:
   - Add MCP Server Trigger node
   - Add Custom n8n Workflow Tool nodes for each operation
   - Connect them to expose as MCP tools

### Method 3: Direct MCP Client Integration

Use the MCP Client Tool node in AI workflows to connect to external MCP servers that might need Attio data.

## Example: Attio Search Tool Workflow

```json
{
  "nodes": [
    {
      "name": "Execute Workflow Trigger",
      "type": "n8n-nodes-base.executeWorkflowTrigger",
      "position": [250, 300]
    },
    {
      "name": "Attio",
      "type": "n8n-nodes-attio.attio",
      "parameters": {
        "resource": "Records",
        "operation": "POST -v2-objects--object--records-query",
        "object": "={{ $json.object }}",
        "filter": "={{ $json.filter }}",
        "limit": "={{ $json.limit }}"
      }
    }
  ]
}
```

## Connecting to Claude Desktop

To use your Attio MCP server with Claude Desktop:

1. Get your MCP Server URL from the MCP Server Trigger node
2. Add to Claude Desktop config:

```json
{
  "mcpServers": {
    "attio-crm": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://your-n8n-instance.com/mcp/attio-crm",
        "--header",
        "Authorization: Bearer YOUR_TOKEN"
      ]
    }
  }
}
```

## Use Cases

1. **AI Sales Assistant**: An AI agent that can search for customer information, create new leads, and update deal statuses in Attio.

2. **Automated CRM Updates**: MCP clients can trigger workflows to sync data between systems and update Attio records.

3. **Intelligent Customer Support**: Chatbots that can look up customer history and create support tickets in Attio.

## Best Practices

1. **Security**: Always use authentication (Bearer tokens) for MCP endpoints
2. **Rate Limiting**: Be mindful of Attio's API rate limits when exposing via MCP
3. **Error Handling**: Add error nodes to handle API failures gracefully
4. **Logging**: Use n8n's execution logs to debug MCP interactions

## Troubleshooting

- **MCP tools not showing**: Ensure `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true` is set
- **Connection issues**: Check if using SSE transport (required for MCP Server Trigger)
- **Authentication errors**: Verify Bearer token in both n8n and MCP client config

## Next Steps

1. Import the example workflows into n8n
2. Configure your Attio API credentials
3. Test with a simple MCP client
4. Build more complex AI-powered CRM automations 
