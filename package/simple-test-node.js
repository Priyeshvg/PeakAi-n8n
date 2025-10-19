const { Node } = require('n8n-workflow');

class SimpleTestNode extends Node {
    constructor() {
        super();
        this.description = {
            displayName: 'Simple Test',
            name: 'simpleTest',
            icon: 'fa:star',
            group: ['transform'],
            version: 1,
            description: 'Test if n8n loads our package',
            inputs: ['main'],
            outputs: ['main'],
            properties: []
        };
    }

    async execute() {
        return [[{ json: { message: 'IT WORKS!', timestamp: new Date().toISOString() } }]];
    }
}

module.exports = SimpleTestNode;