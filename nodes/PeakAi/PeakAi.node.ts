import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class PeakAi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Peak AI',
		name: 'peakAi',
		icon: 'file:peakai.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Enrich LinkedIn profiles with contact information using Peak AI',
		defaults: {
			name: 'Peak AI',
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
				placeholder: 'Enter access token from Peak AI Auth',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Phone Number',
						value: 'getPhone',
						description: 'Extract phone number from LinkedIn profile',
						action: 'Get phone number',
					},
					{
						name: 'Get Personal Email',
						value: 'getEmail',
						description: 'Extract personal email from LinkedIn profile',
						action: 'Get personal email',
					},
					{
						name: 'Get Secondary Email',
						value: 'getWorkEmail',
						description: 'Extract work/secondary email from LinkedIn profile',
						action: 'Get secondary email',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Extract many available contact information',
						action: 'Get many contact info',
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'LinkedIn URL',
				name: 'linkedinUrl',
				type: 'string',
				default: '',
				required: true,
				description: 'LinkedIn profile URL or username',
				placeholder: 'https://www.linkedin.com/in/username or just username',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const accessToken = this.getNodeParameter('accessToken', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				let linkedinUrl = this.getNodeParameter('linkedinUrl', i) as string;

				// Normalize LinkedIn URL
				if (!linkedinUrl.startsWith('http')) {
					linkedinUrl = `https://www.linkedin.com/in/${linkedinUrl}`;
				}

				const result: {
					linkedinUrl: string;
					phoneNumber?: string;
					personalEmail?: string;
					secondaryEmail?: string;
				} = {
					linkedinUrl,
				};

				if (operation === 'getAll') {
					// Get all contact information
					const types = ['phone_no', 'email', 'work_email'];
					
					for (const type of types) {
						try {
							const response = await this.helpers.httpRequest({
								method: 'GET',
								url: `https://automation.sayf.in/webhook/extractor?access_token=${accessToken}&type=${type}&profile_url=${encodeURIComponent(linkedinUrl)}`,
								json: true,
							});

							if (type === 'phone_no' && response.phone_no && response.phone_no.length > 0) {
								result.phoneNumber = response.phone_no[0].item;
							} else if (type === 'email' && response.email && response.email.length > 0) {
								result.personalEmail = response.email[0].item;
							} else if (type === 'work_email' && response.work_email && response.work_email.length > 0) {
								result.secondaryEmail = response.work_email[0].item;
							}
						} catch {
							// Continue if one type fails
							continue;
						}
					}
				} else {
					// Get specific information
					const typeMap: { [key: string]: string } = {
						getPhone: 'phone_no',
						getEmail: 'email',
						getWorkEmail: 'work_email',
					};

					const type = typeMap[operation];
					const response = await this.helpers.httpRequest({
						method: 'GET',
						url: `https://automation.sayf.in/webhook/extractor?access_token=${accessToken}&type=${type}&profile_url=${encodeURIComponent(linkedinUrl)}`,
						json: true,
					});

					if (type === 'phone_no' && response.phone_no && response.phone_no.length > 0) {
						result.phoneNumber = response.phone_no[0].item;
					} else if (type === 'email' && response.email && response.email.length > 0) {
						result.personalEmail = response.email[0].item;
					} else if (type === 'work_email' && response.work_email && response.work_email.length > 0) {
						result.secondaryEmail = response.work_email[0].item;
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