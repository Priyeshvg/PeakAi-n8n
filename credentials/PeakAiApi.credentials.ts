import {
	IAuthenticateGeneric,
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
			placeholder: 'pg@thepeakai.com',
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

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://automation.sayf.in',
			url: '/webhook/token',
			method: 'POST',
			body: {
				id: '={{$credentials.email}}',
				password: '={{$credentials.password}}',
			},
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