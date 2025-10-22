import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class PeakAiWorkEmail implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Peak AI Work Email',
		name: 'peakAiWorkEmail',
		icon: 'file:peakai.svg',
		group: ['transform'],
		version: 1,
		description: 'Get work/business email from LinkedIn profile',
		defaults: {
			name: 'Peak AI Work Email',
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
			{
				displayName: 'LinkedIn URL',
				name: 'linkedinUrl',
				type: 'string',
				default: '',
				required: true,
				description: 'LinkedIn profile URL or username',
				placeholder: 'https://www.linkedin.com/in/username',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const accessToken = this.getNodeParameter('accessToken', i) as string;
				let linkedinUrl = this.getNodeParameter('linkedinUrl', i) as string;

				if (!linkedinUrl.startsWith('http')) {
					linkedinUrl = `https://www.linkedin.com/in/${linkedinUrl}`;
				}

				const response = await this.helpers.httpRequest({
					method: 'GET',
					url: `https://automation.sayf.in/webhook/extractor?access_token=${accessToken}&type=work_email&profile_url=${encodeURIComponent(linkedinUrl)}`,
					json: true,
				});

				returnData.push({
					json: {
						linkedinUrl,
						workEmail: response.work_email?.[0]?.item || null,
					},
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
							linkedinUrl: this.getNodeParameter('linkedinUrl', i) as string,
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
