import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import {
	N8NPropertiesBuilder,
	N8NPropertiesBuilderConfig,
} from '@devlikeapro/n8n-openapi-node';
import * as doc from './openapi.json';

const config: N8NPropertiesBuilderConfig = {};
const parser = new N8NPropertiesBuilder(doc, config);
const properties = parser.build();

// Function to convert operation names to user-friendly names
function makeOperationNameFriendly(name: string): string {
	// First, extract the meaningful parts
	const match = name.match(/^(GET|POST|PUT|PATCH|DELETE)\s+(.+)$/);
	if (!match) return name;

	const [, method, path] = match;

	// Common patterns
	const patterns: Array<[RegExp, (() => string) | string]> = [
		// Objects
		[/^\/v2\/objects$/, () => method === 'GET' ? 'List Objects' : 'Create Object'],
		[/^\/v2\/objects\/\{object\}$/, () => {
			switch (method) {
				case 'GET': return 'Get Object';
				case 'PATCH': return 'Update Object';
				case 'DELETE': return 'Delete Object';
				default: return `${method} Object`;
			}
		}],

		// Records
		[/^\/v2\/objects\/\{object\}\/records\/query$/, () => 'List Records'],
		[/^\/v2\/objects\/\{object\}\/records$/, () => {
			switch (method) {
				case 'POST': return 'Create Record';
				case 'PUT': return 'Assert Record';
				default: return `${method} Records`;
			}
		}],
		[/^\/v2\/objects\/\{object\}\/records\/\{record_id\}$/, () => {
			switch (method) {
				case 'GET': return 'Get Record';
				case 'PUT': return 'Update Record (Overwrite)';
				case 'PATCH': return 'Update Record (Append)';
				case 'DELETE': return 'Delete Record';
				default: return `${method} Record`;
			}
		}],
		[/^\/v2\/objects\/\{object\}\/records\/\{record_id\}\/attributes$/, () => 'List Record Attributes'],
		[/^\/v2\/objects\/\{object\}\/records\/\{record_id\}\/entries$/, () => 'List Record Entries'],

		// Attributes
		[/^\/v2\/\{target\}\/\{identifier\}\/attributes$/, () => method === 'GET' ? 'List Attributes' : 'Create Attribute'],
		[/^\/v2\/\{target\}\/\{identifier\}\/attributes\/\{attribute\}$/, () => {
			switch (method) {
				case 'GET': return 'Get Attribute';
				case 'PATCH': return 'Update Attribute';
				case 'DELETE': return 'Delete Attribute';
				default: return `${method} Attribute`;
			}
		}],

		// Lists
		[/^\/v2\/lists$/, () => method === 'GET' ? 'List Lists' : 'Create List'],
		[/^\/v2\/lists\/\{list\}$/, () => {
			switch (method) {
				case 'GET': return 'Get List';
				case 'DELETE': return 'Delete List';
				default: return `${method} List`;
			}
		}],

		// Entries
		[/^\/v2\/lists\/\{list\}\/entries\/query$/, () => 'List Entries'],
		[/^\/v2\/lists\/\{list\}\/entries$/, () => 'Create Entry'],
		[/^\/v2\/lists\/\{list\}\/entries\/\{entry_id\}$/, () => {
			switch (method) {
				case 'GET': return 'Get Entry';
				case 'PUT': return 'Update Entry (Overwrite)';
				case 'PATCH': return 'Update Entry (Append)';
				case 'DELETE': return 'Delete Entry';
				default: return `${method} Entry`;
			}
		}],
		[/^\/v2\/lists\/\{list\}\/entries\/\{entry_id\}\/attributes$/, () => 'List Entry Attributes'],

		// Workspace members
		[/^\/v2\/workspace_members$/, () => 'List Workspace Members'],
		[/^\/v2\/workspace_members\/\{workspace_member_id\}$/, () => 'Get Workspace Member'],

		// Notes
		[/^\/v2\/notes$/, () => method === 'GET' ? 'List Notes' : 'Create Note'],
		[/^\/v2\/notes\/\{note_id\}$/, () => {
			switch (method) {
				case 'GET': return 'Get Note';
				case 'DELETE': return 'Delete Note';
				default: return `${method} Note`;
			}
		}],

		// Tasks
		[/^\/v2\/tasks$/, () => method === 'GET' ? 'List Tasks' : 'Create Task'],
		[/^\/v2\/tasks\/\{task_id\}$/, () => {
			switch (method) {
				case 'GET': return 'Get Task';
				case 'PATCH': return 'Update Task';
				case 'DELETE': return 'Delete Task';
				default: return `${method} Task`;
			}
		}],

		// Comments
		[/^\/v2\/threads\/\{thread_id\}\/comments$/, () => method === 'GET' ? 'List Comments' : 'Create Comment'],
		[/^\/v2\/comments\/\{comment_id\}$/, () => {
			switch (method) {
				case 'GET': return 'Get Comment';
				case 'DELETE': return 'Delete Comment';
				default: return `${method} Comment`;
			}
		}],

		// Webhooks
		[/^\/v2\/webhooks$/, () => method === 'GET' ? 'List Webhooks' : 'Create Webhook'],
		[/^\/v2\/webhooks\/\{webhook_id\}$/, () => {
			switch (method) {
				case 'GET': return 'Get Webhook';
				case 'PATCH': return 'Update Webhook';
				case 'DELETE': return 'Delete Webhook';
				default: return `${method} Webhook`;
			}
		}],

		// Self
		[/^\/v2\/self$/, () => 'Get Current User'],
	];

	// Find matching pattern
	for (const [pattern, getName] of patterns) {
		if (pattern.test(path)) {
			return typeof getName === 'function' ? getName() : getName;
		}
	}

	// Fallback: just use the method and a cleaned path
	return `${method} ${path.replace(/^\/v2\//, '').replace(/[{}]/g, '')}`;
}

// Transform operation names and fix displayOptions
const operationMapping: { [key: string]: string } = {};
const friendlyNameMapping: { [key: string]: string } = {};

// First pass: Transform operation names to be user-friendly
const transformedProperties = properties.map((prop: any) => {
	if (prop.name === 'operation' && prop.options) {
		// Transform each operation option
		const transformedOptions = prop.options.map((opt: any) => {
			const friendlyName = makeOperationNameFriendly(opt.name);
			operationMapping[opt.name] = opt.value;
			friendlyNameMapping[opt.value] = friendlyName;

			return {
				...opt,
				name: friendlyName,
				// Keep original name for reference if needed
				originalName: opt.name,
			};
		});

		return {
			...prop,
			options: transformedOptions,
		};
	}
	return prop;
});

// Second pass: Fix displayOptions to use operation values instead of names
const fixedProperties = transformedProperties.map((prop: any) => {
	if (prop.displayOptions?.show?.operation) {
		return {
			...prop,
			displayOptions: {
				...prop.displayOptions,
				show: {
					...prop.displayOptions.show,
					operation: prop.displayOptions.show.operation.map((opName: string) =>
						operationMapping[opName] || opName
					),
				},
			},
		};
	}
	return prop;
});

export class Attio implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Attio',
		name: 'attio',
		icon: 'file:attio.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"]}}',
		description: 'Interact with Attio API',
		defaults: {
			name: 'Attio',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'attioApi',
				required: true,
			},
		],
		requestDefaults: {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: fixedProperties, // Use the fixed properties
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('attioApi');

		for (let i = 0; i < items.length; i++) {
						try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				// Find the operation configuration
				const operationProperty: any = properties.find(
					(prop: any) => prop.name === 'operation' &&
					prop.displayOptions?.show?.resource?.[0] === resource &&
					prop.options?.find((opt: any) => opt.value === operation)
				);

				if (!operationProperty || !operationProperty.options) {
					throw new NodeOperationError(this.getNode(), `Operation ${operation} not found for resource ${resource}`);
				}

				const operationConfig = operationProperty.options.find((opt: any) => opt.value === operation);
				if (!operationConfig || !operationConfig.routing?.request) {
					throw new NodeOperationError(this.getNode(), `Operation configuration not found for ${operation}`);
				}

				let { method, url } = operationConfig.routing.request;

				// Fix: Remove leading '=' from URLs generated by n8n-openapi-node
				if (url && url.startsWith('=')) {
					url = url.substring(1);
				}

				// Build the request
				const requestOptions: any = {
					method,
					url,
					headers: {
						'Authorization': `Bearer ${credentials.accessToken}`,
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					json: true,
					// Don't initialize qs here - only add it if we have actual query parameters
				};

				// Process parameters based on their routing configuration
				const allProperties = properties.filter((prop: any) => {
					return prop.displayOptions?.show?.operation?.[0] === operation &&
						prop.displayOptions?.show?.resource?.[0] === resource;
				});

				for (const prop of allProperties) {
					const propAny = prop as any;
					if (propAny.name === 'operation' || propAny.type === 'notice') continue;

					try {
						const value = this.getNodeParameter(propAny.name, i, propAny.default);

						if (value !== undefined && value !== null && value !== '') {
							// Handle routing based on property configuration
							if (propAny.routing?.send) {
								const { type, property, value: valueExpression } = propAny.routing.send;

								// Evaluate the value expression if present
								let processedValue = value;
								if (valueExpression && typeof value === 'string') {
									try {
										// For JSON fields, parse them
										if (propAny.type === 'json') {
											processedValue = JSON.parse(value);
										}
									} catch (e) {
										// If parsing fails, use the raw value
									}
								}

								switch (type) {
									case 'body':
										if (!requestOptions.body) requestOptions.body = {};
										requestOptions.body[property] = processedValue;
										break;
									case 'query':
										// Only add query parameters if they have actual values
										if (processedValue !== undefined && processedValue !== null && processedValue !== '') {
											if (!requestOptions.qs) requestOptions.qs = {};
											requestOptions.qs[property] = processedValue;
										}
										break;
								}
							}
						}
					} catch (error) {
						// Parameter is optional and not set
					}
				}

				// Replace path parameters in URL
				// Handle both {param} and {{$parameter["param"]}} formats
				let finalUrl = requestOptions.url;

				// First handle {{$parameter["paramName"]}} format (generated by n8n-openapi-node)
				const n8nParamMatches = finalUrl.match(/\{\{\$parameter\["([^"]+)"\]\}\}/g);
				if (n8nParamMatches) {
					for (const match of n8nParamMatches) {
						const paramName = match.match(/\{\{\$parameter\["([^"]+)"\]\}\}/)?.[1];
						if (paramName) {
							try {
								const paramValue = this.getNodeParameter(paramName, i);
								if (paramValue !== undefined && paramValue !== null) {
									finalUrl = finalUrl.replace(match, String(paramValue));
								}
							} catch (error) {
								// Parameter might not exist or is optional
							}
						}
					}
				}

				// Also handle simple {param} format just in case
				const simpleParamMatches = finalUrl.match(/\{([^}]+)\}/g);
				if (simpleParamMatches) {
					for (const match of simpleParamMatches) {
						const paramName = match.replace(/[{}]/g, '');
						try {
							const paramValue = this.getNodeParameter(paramName, i);
							if (paramValue !== undefined && paramValue !== null) {
								finalUrl = finalUrl.replace(match, String(paramValue));
							}
						} catch (error) {
							// Parameter might not exist or is optional
						}
					}
				}

				// Ensure the URL is absolute
				if (!finalUrl.startsWith('http')) {
					finalUrl = 'https://api.attio.com' + finalUrl;
				}

				requestOptions.url = finalUrl;

				// Clean up empty query string object to prevent trailing =
				if (requestOptions.qs && Object.keys(requestOptions.qs).length === 0) {
					delete requestOptions.qs;
				}

				// Ensure we're not passing undefined values that might cause issues
				const cleanRequestOptions: any = {
					method: requestOptions.method,
					url: requestOptions.url,
					headers: requestOptions.headers,
					json: requestOptions.json,
				};

				// Only add body if it exists and has content
				if (requestOptions.body && Object.keys(requestOptions.body).length > 0) {
					cleanRequestOptions.body = requestOptions.body;
				}

				// Only add qs if it exists and has content
				if (requestOptions.qs && Object.keys(requestOptions.qs).length > 0) {
					cleanRequestOptions.qs = requestOptions.qs;
				}

				// Make the API request
				const response = await this.helpers.request(cleanRequestOptions);

				returnData.push({
					json: response,
					pairedItem: { item: i },
				});

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
