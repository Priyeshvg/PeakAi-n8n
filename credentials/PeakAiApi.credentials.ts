import {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PeakAiApi implements ICredentialType {
	name = 'peakAiApi';
	displayName = 'Peak AI API';
	documentationUrl = 'https://automation.sayf.in';
	icon = 'file:peakai.svg' as const;
	properties: INodeProperties[] = [
		{
			displayName: 'Email',
			name: 'email',
			type: 'string',
			default: '',
			placeholder: 'your-email@example.com',
			required: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://automation.sayf.in',
			url: '/webhook/login',
			method: 'POST',
			body: {
				email: '={{$credentials.email}}',
				password: '={{$credentials.password}}',
			},
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'access_token',
					message: 'Invalid credentials or API error',
				},
			},
		],
	};
}