import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class QuickJiraApi implements ICredentialType {
	name = 'quickJiraApi';

	displayName = 'Quick Jira API';

	documentationUrl = 'https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/';

	icon = 'file:jira.svg' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'Jira Domain',
			name: 'domain',
			type: 'string',
			default: '',
			placeholder: 'https://yourcompany.atlassian.net',
			description: 'Your Jira Cloud domain URL',
			required: true,
		},
		{
			displayName: 'Email',
			name: 'email',
			type: 'string',
			placeholder: 'name@company.com',
			default: '',
			description: 'The email address associated with your Atlassian account',
			required: true,
		},
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Generate an API token from your <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank">Atlassian Account Security</a>',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.email}}',
				password: '={{$credentials.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.domain}}',
			url: '/rest/api/2/myself',
		},
	};
}
