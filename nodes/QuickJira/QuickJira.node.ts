import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodeListSearchResult,
	INodeListSearchItems,
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeOperationError, NodeApiError } from 'n8n-workflow';

// Helper function to make Jira API requests
async function jiraApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	endpoint: string,
	method: IHttpRequestMethods,
	body: IDataObject = {},
	query?: IDataObject,
): Promise<IDataObject | IDataObject[]> {
	const credentials = await this.getCredentials('quickJiraApi');
	const domain = credentials.domain as string;

	const options: IHttpRequestOptions = {
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			'X-Atlassian-Token': 'no-check',
		},
		method,
		qs: query,
		url: `${domain}/rest${endpoint}`,
		body,
		json: true,
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	if (Object.keys(query || {}).length === 0) {
		delete options.qs;
	}

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'quickJiraApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

// Helper function to simplify issue output
function simplifyIssue(issue: IDataObject): IDataObject {
	const fields = (issue.fields || {}) as IDataObject;
	const status = (fields.status || {}) as IDataObject;
	const priority = (fields.priority || {}) as IDataObject;
	const assignee = (fields.assignee || {}) as IDataObject;
	const reporter = (fields.reporter || {}) as IDataObject;
	const issuetype = (fields.issuetype || {}) as IDataObject;
	const project = (fields.project || {}) as IDataObject;

	return {
		id: issue.id,
		key: issue.key,
		summary: fields.summary || '',
		description: fields.description || '',
		status: status.name || '',
		priority: priority.name || '',
		assignee: assignee.displayName || '',
		assigneeEmail: assignee.emailAddress || '',
		reporter: reporter.displayName || '',
		reporterEmail: reporter.emailAddress || '',
		created: fields.created || '',
		updated: fields.updated || '',
		issueType: issuetype.name || '',
		project: project.name || '',
		projectKey: project.key || '',
		url: (issue.self as string || '').replace(/\/rest\/api\/.*/, `/browse/${issue.key}`) || '',
	};
}

export class QuickJira implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Quick Jira',
		name: 'quickJira',
		icon: 'file:jira.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Simplified Jira operations with smart defaults',
		defaults: {
			name: 'Quick Jira',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [
			{
				name: 'quickJiraApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Add Attachment',
						value: 'addAttachment',
						description: 'Attach a file to a ticket',
						action: 'Add an attachment',
					},
					{
						name: 'Add Comment',
						value: 'addComment',
						description: 'Add a comment to a ticket',
						action: 'Add a comment',
					},
					{
						name: 'Create Ticket',
						value: 'create',
						description: 'Create a new Jira ticket with smart defaults',
						action: 'Create a ticket',
					},
					{
						name: 'Get Ticket',
						value: 'get',
						description: 'Get ticket details with simplified output',
						action: 'Get a ticket',
					},
					{
						name: 'Search Tickets',
						value: 'search',
						description: 'Search for tickets using simple or custom JQL',
						action: 'Search tickets',
					},
					{
						name: 'Update Status',
						value: 'updateStatus',
						description: 'Change the status of a ticket',
						action: 'Update ticket status',
					},
				],
				default: 'create',
			},

			// Create Ticket Fields
			{
				displayName: 'Project',
				name: 'project',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'getProjects',
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: '10000',
					},
				],
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				description: 'The project to create the ticket in',
			},
			{
				displayName: 'Issue Type',
				name: 'issueType',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'getIssueTypes',
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: '10001',
					},
				],
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				description: 'The type of issue to create',
			},
			{
				displayName: 'Summary',
				name: 'summary',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				description: 'Short summary of the ticket',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '',
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				description: 'Detailed description of the ticket',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'getPriorities',
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: '3',
					},
				],
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				description: 'Priority of the ticket (optional)',
			},
			{
				displayName: 'Assignee',
				name: 'assignee',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'getUsers',
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: 'accountId',
					},
				],
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				description: 'User to assign the ticket to (optional)',
			},

			// Update Status Fields
			{
				displayName: 'Issue Key',
				name: 'issueKey',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['updateStatus', 'addComment', 'addAttachment', 'get'],
					},
				},
				placeholder: 'PROJ-123',
				description: 'The key of the Jira issue (e.g., PROJ-123)',
			},
			{
				displayName: 'New Status',
				name: 'newStatus',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'getTransitions',
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: '21',
					},
				],
				displayOptions: {
					show: {
						operation: ['updateStatus'],
					},
				},
				description: 'The status to transition the ticket to',
			},

			// Add Comment Fields
			{
				displayName: 'Comment',
				name: 'comment',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['addComment'],
					},
				},
				description: 'The comment text to add',
			},

			// Add Attachment Fields
			{
				displayName: 'Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						operation: ['addAttachment'],
					},
				},
				placeholder: 'data',
				description: 'Name of the binary property containing the file to attach',
			},

			// Search Fields
			{
				displayName: 'Search Type',
				name: 'searchType',
				type: 'options',
				options: [
					{
						name: 'My Open Issues',
						value: 'myOpen',
						description: 'All issues assigned to you that are not done',
					},
					{
						name: 'Recent Issues',
						value: 'recent',
						description: 'Recently updated issues',
					},
					{
						name: 'By Project',
						value: 'byProject',
						description: 'All issues in a specific project',
					},
					{
						name: 'Custom JQL',
						value: 'custom',
						description: 'Write your own JQL query',
					},
				],
				default: 'myOpen',
				displayOptions: {
					show: {
						operation: ['search'],
					},
				},
				description: 'Type of search to perform',
			},
			{
				displayName: 'Project',
				name: 'searchProject',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'getProjects',
							searchable: true,
						},
					},
					{
						displayName: 'By Key',
						name: 'id',
						type: 'string',
						placeholder: 'PROJ',
					},
				],
				displayOptions: {
					show: {
						operation: ['search'],
						searchType: ['byProject'],
					},
				},
				description: 'The project to search in',
			},
			{
				displayName: 'JQL Query',
				name: 'jql',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['search'],
						searchType: ['custom'],
					},
				},
				placeholder: 'project = PROJ AND status = "In Progress"',
				description: 'Custom JQL query',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				displayOptions: {
					show: {
						operation: ['search'],
					},
				},
				description: 'Max number of results to return',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
			},
		],
	};

	methods = {
		listSearch: {
			async getProjects(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const returnData: INodeListSearchItems[] = [];
				const projects = await jiraApiRequest.call(
					this,
					'/api/2/project/search',
					'GET',
					{},
					{ maxResults: 100 },
				) as IDataObject;

				const projectValues = (projects.values || []) as IDataObject[];
				for (const project of projectValues) {
					const projectName = project.name as string;
					const projectId = project.id as string;
					returnData.push({
						name: projectName,
						value: projectId,
					});
				}

				return {
					results: returnData.filter((item) =>
						filter ? item.name.toLowerCase().includes(filter.toLowerCase()) : true,
					),
				};
			},

			async getIssueTypes(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
				const projectId = this.getCurrentNodeParameter('project', { extractValue: true });
				const returnData: INodeListSearchItems[] = [];

				const response = await jiraApiRequest.call(
					this,
					`/api/2/project/${projectId}`,
					'GET',
				) as IDataObject;

				const issueTypes = (response.issueTypes || []) as IDataObject[];
				for (const issueType of issueTypes) {
					returnData.push({
						name: issueType.name as string,
						value: issueType.id as string,
					});
				}

				return { results: returnData };
			},

			async getPriorities(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
				const returnData: INodeListSearchItems[] = [];
				const priorities = await jiraApiRequest.call(this, '/api/2/priority', 'GET') as IDataObject[];

				for (const priority of priorities) {
					returnData.push({
						name: priority.name as string,
						value: priority.id as string,
					});
				}

				return { results: returnData };
			},

			async getUsers(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const returnData: INodeListSearchItems[] = [];
				const users = await jiraApiRequest.call(
					this,
					'/api/2/users/search',
					'GET',
					{},
					{ maxResults: 100 },
				) as IDataObject[];

				for (const user of users) {
					returnData.push({
						name: user.displayName as string,
						value: user.accountId as string,
					});
				}

				return {
					results: returnData.filter((item) =>
						filter ? item.name.toLowerCase().includes(filter.toLowerCase()) : true,
					),
				};
			},

			async getTransitions(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
				const issueKey = this.getCurrentNodeParameter('issueKey');
				const returnData: INodeListSearchItems[] = [];

				const response = await jiraApiRequest.call(
					this,
					`/api/2/issue/${issueKey}/transitions`,
					'GET',
				) as IDataObject;

				const transitions = (response.transitions || []) as IDataObject[];
				for (const transition of transitions) {
					returnData.push({
						name: transition.name as string,
						value: transition.id as string,
					});
				}

				return { results: returnData };
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[] = {};

				if (operation === 'create') {
					const projectId = this.getNodeParameter('project', i, '', {
						extractValue: true,
					}) as string;
					const issueTypeId = this.getNodeParameter('issueType', i, '', {
						extractValue: true,
					}) as string;
					const summary = this.getNodeParameter('summary', i) as string;
					const description = this.getNodeParameter('description', i, '') as string;
					const priorityId = this.getNodeParameter('priority', i, '', {
						extractValue: true,
					}) as string;
					const assigneeId = this.getNodeParameter('assignee', i, '', {
						extractValue: true,
					}) as string;

					const fields: IDataObject = {
						project: { id: projectId },
						issuetype: { id: issueTypeId },
						summary,
					};

					if (description) {
						fields.description = description;
					}

					if (priorityId) {
						fields.priority = { id: priorityId };
					}

					if (assigneeId) {
						fields.assignee = { id: assigneeId };
					}

					const body: IDataObject = { fields };

					const createResponse = await jiraApiRequest.call(this, '/api/2/issue', 'POST', body) as IDataObject;
					responseData = {
						success: true,
						issueKey: createResponse.key,
						issueId: createResponse.id,
						url: (createResponse.self as string).replace(/\/rest\/api\/.*/, `/browse/${createResponse.key}`),
					};
				} else if (operation === 'updateStatus') {
					const issueKey = this.getNodeParameter('issueKey', i) as string;
					const statusId = this.getNodeParameter('newStatus', i, '', {
						extractValue: true,
					}) as string;

					await jiraApiRequest.call(
						this,
						`/api/2/issue/${issueKey}/transitions`,
						'POST',
						{
							transition: { id: statusId },
						},
					);

					responseData = {
						success: true,
						issueKey,
						message: 'Status updated successfully',
					};
				} else if (operation === 'addComment') {
					const issueKey = this.getNodeParameter('issueKey', i) as string;
					const comment = this.getNodeParameter('comment', i) as string;

					const body = {
						body: {
							type: 'doc',
							version: 1,
							content: [
								{
									type: 'paragraph',
									content: [
										{
											type: 'text',
											text: comment,
										},
									],
								},
							],
						},
					};

					const commentResponse = await jiraApiRequest.call(
						this,
						`/api/3/issue/${issueKey}/comment`,
						'POST',
						body,
					) as IDataObject;

					responseData = {
						success: true,
						issueKey,
						commentId: commentResponse.id,
						message: 'Comment added successfully',
					};
				} else if (operation === 'addAttachment') {
					const issueKey = this.getNodeParameter('issueKey', i) as string;
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;

					const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
					const dataBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

					const credentials = await this.getCredentials('quickJiraApi');
					const domain = credentials.domain as string;

					const formData = {
						file: {
							value: dataBuffer,
							options: {
								filename: binaryData.fileName,
								contentType: binaryData.mimeType,
							},
						},
					};

					const options: IHttpRequestOptions = {
						headers: {
							'X-Atlassian-Token': 'no-check',
						},
						method: 'POST',
						url: `${domain}/rest/api/2/issue/${issueKey}/attachments`,
						body: formData,
					};

					try {
						const attachmentResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'quickJiraApi',
							options,
						) as IDataObject[];

						responseData = {
							success: true,
							issueKey,
							attachmentId: attachmentResponse[0]?.id,
							filename: attachmentResponse[0]?.filename,
							message: 'Attachment added successfully',
						};
					} catch (error) {
						throw new NodeApiError(this.getNode(), error as JsonObject);
					}
				} else if (operation === 'get') {
					const issueKey = this.getNodeParameter('issueKey', i) as string;
					const issue = await jiraApiRequest.call(this, `/api/2/issue/${issueKey}`, 'GET') as IDataObject;
					responseData = simplifyIssue(issue);
				} else if (operation === 'search') {
					const searchType = this.getNodeParameter('searchType', i) as string;
					const limit = this.getNodeParameter('limit', i) as number;

					let jql = '';

					if (searchType === 'myOpen') {
						jql = 'assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC';
					} else if (searchType === 'recent') {
						jql = 'updated >= -7d ORDER BY updated DESC';
					} else if (searchType === 'byProject') {
						const projectKey = this.getNodeParameter('searchProject', i, '', {
							extractValue: true,
						}) as string;
						jql = `project = ${projectKey} ORDER BY created DESC`;
					} else if (searchType === 'custom') {
						jql = this.getNodeParameter('jql', i) as string;
					}

					const body = {
						jql,
						maxResults: limit,
						fields: ['summary', 'status', 'assignee', 'reporter', 'priority', 'created', 'updated', 'issuetype', 'project', 'description'],
					};

					const results = await jiraApiRequest.call(this, '/api/2/search', 'POST', body) as IDataObject;
					const issues = (results.issues || []) as IDataObject[];
					responseData = issues.map((issue: IDataObject) => simplifyIssue(issue));
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
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
				throw new NodeOperationError(this.getNode(), error, {
					itemIndex: i,
					description: error.description,
				});
			}
		}

		return [returnData];
	}
}
