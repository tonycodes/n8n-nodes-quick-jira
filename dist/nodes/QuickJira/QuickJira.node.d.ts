import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';
export declare class QuickJira implements INodeType {
    description: INodeTypeDescription;
    methods: {
        listSearch: {
            getProjects(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult>;
            getIssueTypes(this: ILoadOptionsFunctions): Promise<INodeListSearchResult>;
            getPriorities(this: ILoadOptionsFunctions): Promise<INodeListSearchResult>;
            getUsers(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult>;
            getTransitions(this: ILoadOptionsFunctions): Promise<INodeListSearchResult>;
        };
    };
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
