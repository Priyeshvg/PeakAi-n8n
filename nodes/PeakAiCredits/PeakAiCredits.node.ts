import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class PeakAiCredits implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Peak AI Credits',
		name: 'peakAiCredits',
		icon: 'file:peakai.svg',
		group: ['transform'],
		version: 1,
		description: 'Check remaining API credits',
		defaults: {
			name: 'Peak AI Credits',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Access Token',
				name: 'accessToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				required: true,
				description: 'Access token from Peak AI Auth node',
				placeholder: 'Enter access token',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const accessToken = this.getNodeParameter('accessToken', i) as string;

				const response = await this.helpers.httpRequest({
					method: 'GET',
					url: `https://automation.sayf.in/webhook/get_credits_api?access_token=${accessToken}`,
					json: true,
				});

				returnData.push({
					json: {
						credits: response.credits || 0,
					},
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
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
