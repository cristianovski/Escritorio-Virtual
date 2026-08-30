import { performance } from "node:perf_hooks";

// Mock for testing
const MOCK_DOCS = Array.from({ length: 50 }).map((_, i) => ({ id: `doc-${i}`, title: `Doc ${i}` }));

async function mockDbCall(delayMs: number = 10) {
    return new Promise(resolve => setTimeout(resolve, delayMs));
}

async function simulateOldBehavior() {
    const start = performance.now();
    for (const doc of MOCK_DOCS) {
        // simulate a db read
        await mockDbCall(10);
        // simulate a db write
        await mockDbCall(10);
    }
    const end = performance.now();
    return end - start;
}

async function simulateNewBehavior() {
    const start = performance.now();
    // simulate one big read
    await mockDbCall(30);

    // simulate accumulating inside loop
    const writes = [];
    for (const doc of MOCK_DOCS) {
        // cache hit checking logic is fast/local
        writes.push({ id: doc.id });
    }

    // simulate one big write
    await mockDbCall(50);

    const end = performance.now();
    return end - start;
}

async function runBenchmark() {
    console.log("Running Old Behavior (N+1 queries)...");
    const oldTime = await simulateOldBehavior();
    console.log(`Old Behavior Time: ${oldTime.toFixed(2)} ms`);

    console.log("Running New Behavior (Bulk queries)...");
    const newTime = await simulateNewBehavior();
    console.log(`New Behavior Time: ${newTime.toFixed(2)} ms`);

    console.log(`Improvement: ${oldTime / newTime}x faster`);
}

runBenchmark();
