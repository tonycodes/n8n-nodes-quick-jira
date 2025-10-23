"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickJiraApi = void 0;
class QuickJiraApi {
    constructor() {
        this.name = 'quickJiraApi';
        this.displayName = 'Quick Jira API';
        this.documentationUrl = 'https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/';
        this.icon = 'file:jira.svg';
        this.properties = [
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
        this.authenticate = {
            type: 'generic',
            properties: {
                auth: {
                    username: '={{$credentials.email}}',
                    password: '={{$credentials.apiToken}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: '={{$credentials?.domain}}',
                url: '/rest/api/2/myself',
            },
        };
    }
}
exports.QuickJiraApi = QuickJiraApi;
//# sourceMappingURL=QuickJiraApi.credentials.js.map