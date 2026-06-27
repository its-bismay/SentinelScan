import { inngest } from '../../services/inngest.js';
import { runScanPipeline } from '../../services/scanPipeline.js';
import connectDB from '../../config/db.js';

export const scanJob = inngest.createFunction(
  {
    id: 'perform-scan',
    name: 'Perform Security Scan',
    retries: 1,
    timeouts: { finish: '30m' },
  },
  { event: 'scan/queued' },
  async ({ event, step }) => {
    const { scanId } = event.data;

    await step.run('connect-db', async () => {
      await connectDB();
    });

    const result = await step.run('run-scan-pipeline', async () => {
      return await runScanPipeline(scanId);
    });

    return { scanId, ...result };
  }
);
