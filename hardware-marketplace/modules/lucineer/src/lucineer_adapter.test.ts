import { LucineerAdapter } from './lucineer_adapter';

async function runTest() {
  console.log('🚀 Starting LucineerAdapter Integration Test...
');
  const adapter = new LucineerAdapter({ hardwareType: 'gpu' });

  try {
    console.log('Step 1: Initializing...');
    const initRes = await adapter.initialize();
    if (!initRes.success) throw new Error('Initialization failed');
    console.log('✅ Initialization successful');

    console.log('
Step 2: Testing Ping...');
    const isAlive = await adapter.ping();
    if (!isAlive) throw new Error('Ping failed');
    console.log('✅ Ping successful');

    console.log('
Step 3: Executing Compute Task...');
    const execRes = await adapter.execute('matrix_multiply', { rows: 1024, cols: 1024 });
    if (!execRes.success) throw new Error('Execution failed');
    console.log('✅ Execution successful:', execRes.data);

    console.log('
Step 4: Fetching Telemetry...');
    const telRes = await adapter.getTelemetry();
    if (!telRes.success) throw new Error('Telemetry failed');
    console.log('✅ Telemetry received:', telRes.data);

    console.log('
Step 5: Shutting Down...');
    await adapter.shutdown();
    const postShutdownPing = await adapter.ping();
    if (postShutdownPing) throw new Error('Shutdown failed');
    console.log('✅ Shutdown successful
');

    console.log('🌟 ALL TESTS PASSED 🌟');
    process.exit(0);
  } catch (error) {
    console.error('
❌ TEST FAILED');
    console.error(error);
    process.exit(1);
  }
}

runTest();