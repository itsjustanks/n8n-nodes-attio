import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AttioApi implements ICredentialType {
	name = 'attioApi';
	displayName = 'Attio API';
	documentationUrl = 'https://attio.com/help/reference/authentication';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			default: '',
			required: true,
			typeOptions: {
				password: true,
			},
			description: 'Your Attio API access token',
		},
	];
	authenticate = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	} as const;
}
