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
		description: 'Authenticate with Peak AI and get access token (valid for 14 days)',
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
		properties: [],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('peakAiApi');

		for (let i = 0; i < items.length; i++) {
			try {
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
						validFor: '14 days',
						message: 'Save this token and reuse it for 14 days',
					},
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
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