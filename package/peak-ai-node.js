class PeakAiNode {
    description = {
        displayName: 'Peak AI',
        name: 'peakAi',
        icon: 'fa:search',
        group: ['transform'],
        version: 1,
        description: 'Get contact information from LinkedIn profiles via Peak AI API',
        defaults: {
            name: 'Peak AI',
            color: '#1A82e2',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'peakAiApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: '📞 Get Phone Number',
                        value: 'getPhone',
                        description: 'Extract phone number from LinkedIn profile',
                    },
                    {
                        name: '📧 Get Personal Email',
                        value: 'getEmail',
                        description: 'Extract personal email from LinkedIn profile',
                    },
                    {
                        name: '💼 Get Work Email',
                        value: 'getWorkEmail',
                        description: 'Extract work email from LinkedIn profile',
                    },
                ],
                default: 'getPhone',
            },
            {
                displayName: 'LinkedIn Profile URL',
                name: 'linkedinUrl',
                type: 'string',
                required: true,
                default: '',
                placeholder: 'https://www.linkedin.com/in/username/',
                description: 'Full LinkedIn profile URL to lookup',
            }
        ],
    };

    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const operation = this.getNodeParameter('operation', 0);
        const linkedinUrl = this.getNodeParameter('linkedinUrl', 0);
        
        const credentials = await this.getCredentials('peakAiApi');

        try {
            const tokenResponse = await this.helpers.httpRequest({
                method: 'POST',
                url: 'https://automation.sayf.in/webhook/token',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: {
                    id: credentials.email,
                    password: credentials.password,
                },
                json: true,
            });

            const accessToken = tokenResponse.access_token;

            let endpoint;
            switch(operation) {
                case 'getPhone':
                    endpoint = 'linkedin-phone';
                    break;
                case 'getEmail':
                    endpoint = 'linkedin-email';
                    break;
                case 'getWorkEmail':
                    endpoint = 'linkedin-work-email';
                    break;
            }

            const apiResponse = await this.helpers.httpRequest({
                method: 'GET',
                url: `https://automation.sayf.in/webhook/${endpoint}`,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                qs: {
                    url: linkedinUrl,
                },
                json: true,
            });

            returnData.push({
                json: {
                    success: true,
                    operation: operation,
                    linkedinUrl: linkedinUrl,
                    data: apiResponse,
                    tokenExpiresIn: tokenResponse.token_expires_in,
                    email: tokenResponse.email,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            if (this.continueOnFail()) {
                returnData.push({
                    json: {
                        success: false,
                        operation: operation,
                        linkedinUrl: linkedinUrl,
                        error: error.message,
                        timestamp: new Date().toISOString()
                    }
                });
            } else {
                throw error;
            }
        }

        return this.prepareOutputData(returnData);
    }
}

module.exports = { PeakAiNode };
