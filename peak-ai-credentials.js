class PeakAiApi {
    name = 'peakAiApi';
    displayName = 'Peak AI API';
    documentationUrl = 'https://peak.ai';
    properties = [
        {
            displayName: 'Email',
            name: 'email',
            type: 'string',
            placeholder: 'name@company.com',
            default: '',
            required: true,
            description: 'Your registered Peak AI email address',
        },
        {
            displayName: 'Password',
            name: 'password',
            type: 'string',
            typeOptions: {
                password: true
            },
            default: '',
            required: true,
            description: 'Your Peak AI account password',
        },
    ];
}

module.exports = { credentialClass: PeakAiApi };
