import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PeakAiApi implements ICredentialType {
	name = 'peakAiApi';
	displayName = 'Peak AI API';
	documentationUrl = 'https://thepeakai.com';
	icon = 'file:peakai.svg' as const;
	properties: INodeProperties[] = [
		{
			displayName: 'Email',
			name: 'email',
			type: 'string',
			default: '',
			placeholder: 'your@email.com',
			required: true,
			description: 'Your Peak AI account email',
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
			description: 'Your Peak AI account password',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			body: {
				id: '={{$credentials.email}}',
				password: '={{$credentials.password}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://automation.sayf.in',
			url: '/webhook/token',
			method: 'POST',
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'access_token',
					value: '/.+/',
					message: 'Invalid email or password',
				},
			},
		],
	};
}
