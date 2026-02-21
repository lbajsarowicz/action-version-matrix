import * as core from '@actions/core';
import { fetchSupportedVersions } from './api.js';
import { filterVersions } from './filter.js';
import { buildMatrix } from './matrix.js';

async function run(): Promise<void> {
  try {
    const distribution = core.getInput('distribution') || 'magento-community';
    const kind = core.getInput('kind') || 'latest';
    const customVersions = core.getInput('custom_versions') || '';

    core.info(`Fetching supported versions for ${distribution}...`);
    const versions = await fetchSupportedVersions(distribution);
    core.info(`Found ${Object.keys(versions).length} supported versions`);

    const filtered = filterVersions(versions, kind, customVersions);
    core.info(`Filtered to ${filtered.length} versions (kind: ${kind})`);

    const matrix = buildMatrix(filtered);
    core.info(`Matrix has ${matrix.include.length} entries`);

    core.setOutput('matrix', JSON.stringify(matrix));
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();
