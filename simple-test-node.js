class SimpleTestNode {
    description = {
        displayName: 'Simple Test',
        name: 'simpleTest',
        icon: 'fa:star',
        group: ['transform'],
        version: 1,
        description: 'Test if n8n loads our package',
        defaults: {
            name: 'Simple Test',
        },
        inputs: ['main'],
        outputs: ['main'],
        properties: []
    };

    async execute() {
        const items = this.getInputData();
        return this.prepareOutputData([{
            json: { 
                message: 'IT WORKS!', 
                timestamp: new Date().toISOString() 
            }
        }]);
    }
}

module.exports = { nodeClass: SimpleTestNode };
