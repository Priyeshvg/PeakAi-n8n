try {
    const SimpleTestNode = require('./simple-test-node.js');
    const PeakAiNode = require('./peak-ai-node.js');
    const PeakAiApi = require('./peak-ai-credentials.js');
    
    console.log('✅ SimpleTestNode loaded:', SimpleTestNode);
    console.log('✅ PeakAiNode loaded:', PeakAiNode);
    console.log('✅ PeakAiApi loaded:', PeakAiApi);
    
    console.log('\n--- Index.js content ---');
    const index = require('./index.js');
    console.log(index);
} catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
}
