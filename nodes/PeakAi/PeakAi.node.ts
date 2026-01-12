import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class PeakAi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Peak AI',
		name: 'peakAi',
		icon: 'file:peakai.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Enrich LinkedIn profiles with contact information using Peak AI',
		defaults: {
			name: 'Peak AI',
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
			// Resource
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Contact',
						value: 'contact',
						description: 'Get contact information from LinkedIn profiles',
					},
					{
						name: 'Account',
						value: 'account',
						description: 'Manage your Peak AI account',
					},
				],
				default: 'contact',
			},
			// Operations for Contact
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['contact'],
					},
				},
				options: [
					{
						name: 'Get Phone',
						value: 'getPhone',
						description: 'Get phone number from a LinkedIn profile',
						action: 'Get phone number from a linkedin profile',
					},
					{
						name: 'Get Email',
						value: 'getEmail',
						description: 'Get personal email from a LinkedIn profile',
						action: 'Get personal email from a linkedin profile',
					},
					{
						name: 'Get Work Email',
						value: 'getWorkEmail',
						description: 'Get work/business email from a LinkedIn profile',
						action: 'Get work email from a linkedin profile',
					},
					{
						name: 'Enrich',
						value: 'enrich',
						description: 'Get all contact information (phone, email, work email) from a LinkedIn profile',
						action: 'Enrich a linkedin profile with all contact info',
					},
				],
				default: 'getPhone',
			},
			// Operations for Account
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['account'],
					},
				},
				options: [
					{
						name: 'Get Credits',
						value: 'getCredits',
						description: 'Check your remaining API credits',
						action: 'Get remaining API credits',
					},
				],
				default: 'getCredits',
			},
			// LinkedIn URL field (shown for contact operations)
			{
				displayName: 'LinkedIn URL',
				name: 'linkedinUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['contact'],
					},
				},
				default: '',
				placeholder: 'https://www.linkedin.com/in/username',
				description: 'The LinkedIn profile URL or username to look up',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Get credentials and obtain access token
		const credentials = await this.getCredentials('peakAiApi');

		// Get access token using credentials
		let accessToken: string;
		try {
			const tokenResponse = await this.helpers.httpRequest({
				method: 'POST',
				url: 'https://automation.sayf.in/webhook/token',
				body: {
					id: credentials.email,
					password: credentials.password,
				},
				json: true,
			});

			if (!tokenResponse.access_token) {
				throw new NodeOperationError(
					this.getNode(),
					'Failed to authenticate with Peak AI. Please check your credentials.',
				);
			}

			accessToken = tokenResponse.access_token;
		} catch (error) {
			throw new NodeOperationError(
				this.getNode(),
				`Authentication failed: ${(error as Error).message}`,
			);
		}

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'account') {
					if (operation === 'getCredits') {
						const response = await this.helpers.httpRequest({
							method: 'GET',
							url: 'https://automation.sayf.in/webhook/get_credits_api',
							headers: {
								Authorization: `Bearer ${accessToken}`,
							},
							qs: {
								access_token: accessToken,
							},
							json: true,
						});

						returnData.push({
							json: {
								credits: response.credits || 0,
							},
							pairedItem: { item: i },
						});
					}
				} else if (resource === 'contact') {
					let linkedinUrl = this.getNodeParameter('linkedinUrl', i) as string;

					// Normalize LinkedIn URL
					if (!linkedinUrl.startsWith('http')) {
						linkedinUrl = `https://www.linkedin.com/in/${linkedinUrl}`;
					}

					if (operation === 'enrich') {
						// Fetch all contact types
						const result: {
							linkedinUrl: string;
							phoneNumber?: string | null;
							personalEmail?: string | null;
							workEmail?: string | null;
						} = { linkedinUrl };

						const types = [
							{ type: 'phone_no', key: 'phoneNumber', responseKey: 'phone_no' },
							{ type: 'email', key: 'personalEmail', responseKey: 'email' },
							{ type: 'work_email', key: 'workEmail', responseKey: 'work_email' },
						];

						for (const { type, key, responseKey } of types) {
							try {
								const response = await this.helpers.httpRequest({
									method: 'GET',
									url: 'https://automation.sayf.in/webhook/extractor',
									headers: {
										Authorization: `Bearer ${accessToken}`,
									},
									qs: {
										access_token: accessToken,
										type,
										profile_url: linkedinUrl,
									},
									json: true,
								});

								const value = response[responseKey]?.[0]?.item || null;
								(result as Record<string, unknown>)[key] = value;
							} catch {
								(result as Record<string, unknown>)[key] = null;
							}
						}

						returnData.push({
							json: result,
							pairedItem: { item: i },
						});
					} else {
						// Single operation (getPhone, getEmail, getWorkEmail)
						let type: string;
						let responseKey: string;
						let outputKey: string;

						switch (operation) {
							case 'getPhone':
								type = 'phone_no';
								responseKey = 'phone_no';
								outputKey = 'phoneNumber';
								break;
							case 'getEmail':
								type = 'email';
								responseKey = 'email';
								outputKey = 'personalEmail';
								break;
							case 'getWorkEmail':
								type = 'work_email';
								responseKey = 'work_email';
								outputKey = 'workEmail';
								break;
							default:
								throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
						}

						const response = await this.helpers.httpRequest({
							method: 'GET',
							url: 'https://automation.sayf.in/webhook/extractor',
							headers: {
								Authorization: `Bearer ${accessToken}`,
							},
							qs: {
								access_token: accessToken,
								type,
								profile_url: linkedinUrl,
							},
							json: true,
						});

						returnData.push({
							json: {
								linkedinUrl,
								[outputKey]: response[responseKey]?.[0]?.item || null,
							},
							pairedItem: { item: i },
						});
					}
				}
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
