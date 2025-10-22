import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class PeakAiEnrich implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Peak AI Enrich',
		name: 'peakAiEnrich',
		icon: 'file:peakai.svg',
		group: ['transform'],
		version: 1,
		description: 'LinkedIn data enrichment - Get phone numbers and emails from LinkedIn profiles',
		defaults: {
			name: 'Peak AI Enrich',
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
				description: 'Access token from Peak AI Auth node (valid for 14 days)',
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

				const result: {
					linkedinUrl: string;
					phoneNumber?: string;
					personalEmail?: string;
					workEmail?: string;
				} = { linkedinUrl };

				const types = ['phone_no', 'email', 'work_email'];
				
				for (const type of types) {
					try {
						const response = await this.helpers.httpRequest({
							method: 'GET',
							url: `https://automation.sayf.in/webhook/extractor?access_token=${accessToken}&type=${type}&profile_url=${encodeURIComponent(linkedinUrl)}`,
							json: true,
						});

						if (type === 'phone_no' && response.phone_no?.[0]?.item) {
							result.phoneNumber = response.phone_no[0].item;
						} else if (type === 'email' && response.email?.[0]?.item) {
							result.personalEmail = response.email[0].item;
						} else if (type === 'work_email' && response.work_email?.[0]?.item) {
							result.workEmail = response.work_email[0].item;
						}
					} catch {
						continue;
					}
				}

				returnData.push({
					json: result,
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
