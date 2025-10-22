import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class PeakAiAuth implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Peak AI Auth',
		name: 'peakAiAuth',
		icon: 'file:peakai.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Authenticate with Peak AI and manage access tokens',
		defaults: {
			name: 'Peak AI Auth',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [
			{
				name: 'peakAiApi',
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
						name: 'Get Access Token',
						value: 'getAccessToken',
						description: 'Login and retrieve access token',
						action: 'Get access token',
					},
					{
						name: 'Check Credits',
						value: 'checkCredits',
						description: 'Check remaining API credits',
						action: 'Check credits',
					},
				],
				default: 'getAccessToken',
			},
			{
				displayName: 'Access Token',
				name: 'accessToken',
				type: 'string',
				typeOptions: { password: true },
				displayOptions: {
					show: {
						operation: ['checkCredits'],
					},
				},
				default: '',
				required: true,
				description: 'The access token to check credits for',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('peakAiApi');

		for (let i = 0; i < items.length; i++) {
			try {
				if (operation === 'getAccessToken') {
					const body = {
						email: credentials.email,
						password: credentials.password,
					};

					const response = await this.helpers.httpRequest({
						method: 'POST',
						url: 'https://automation.sayf.in/webhook/login',
						body,
						json: true,
					});

					if (!response.access_token) {
						throw new NodeOperationError(
							this.getNode(),
							'Failed to retrieve access token. Please check your credentials.',
						);
					}

					returnData.push({
						json: {
							accessToken: response.access_token,
							success: true,
						},
						pairedItem: { item: i },
					});
				} else if (operation === 'checkCredits') {
					const accessToken = this.getNodeParameter('accessToken', i) as string;

					const response = await this.helpers.httpRequest({
						method: 'GET',
						url: `https://automation.sayf.in/webhook/get_credits_api?access_token=${accessToken}`,
						json: true,
					});

					returnData.push({
						json: {
							credits: response.credits || 0,
							accessToken,
						},
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							success: false,
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