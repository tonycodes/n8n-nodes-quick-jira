import type { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';
export declare class QuickJiraApi implements ICredentialType {
    name: string;
    displayName: string;
    documentationUrl: string;
    icon: "file:jira.svg";
    properties: INodeProperties[];
    authenticate: IAuthenticateGeneric;
    test: ICredentialTestRequest;
}
