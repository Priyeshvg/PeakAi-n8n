const { SimpleTestNode } = require('./simple-test-node.js');
const { PeakAiNode } = require('./peak-ai-node.js');
const { PeakAiApi } = require('./credentials/peak-ai-credentials.js');

module.exports = {
    nodeTypes: {
        simpleTest: SimpleTestNode,
        peakAi: PeakAiNode
    },
    credentialTypes: {
        peakAiApi: PeakAiApi
    }
};
