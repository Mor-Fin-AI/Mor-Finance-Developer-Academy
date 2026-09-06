/**
 * Telemetry & Multichain Deployment Tracker Service
 * Tracks student software module deployments by chain and language for institutional grant metrics.
 */

// Dynamically determine the analytics deployment endpoint
const getAnalyticsUrl = () => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL as string) || (import.meta.env.VITE_API_URL as string);
  if (envUrl && envUrl.trim()) {
    const clean = envUrl.trim().replace(/\/$/, '');
    if (clean.endsWith('/api')) {
      return `${clean}/v1/analytics/deployment`;
    }
    return `${clean}/api/v1/analytics/deployment`;
  }
  return '/api/v1/analytics/deployment';
};

export const ANALYTICS_API_URL = getAnalyticsUrl();

export interface DeploymentPayload {
  contractAddress: string;
  network: string; // 'arbitrum_sepolia', 'base_sepolia', 'optimism_sepolia', 'solana_devnet', 'polygon_amoy', 'aptos_testnet', etc.
  executionEnvironment: string; // 'wasm_stylus', 'evm_op_stack', 'evm_nitro', 'sealevel_svm', 'move_vm', 'cairo_vm', etc.
  programmingLanguage: string; // 'logic', 'rust', 'move', 'cairo', 'go'
  gasUsed: number | string;
}

export async function trackStudentDeployment(
  developerGithubId: string,
  cohortId: string = "KU_COHORT_2026_01",
  deploymentPayload: DeploymentPayload
) {
  try {
    const { contractAddress, network, executionEnvironment, programmingLanguage, gasUsed } = deploymentPayload;
    if (!contractAddress || !developerGithubId) return null;

    const telemetryBundle = {
      developer_github_id: developerGithubId,
      cohort_id: cohortId || "KU_COHORT_2026_01",
      network: network, // 'arbitrum_sepolia', 'solana_devnet', etc.
      execution_environment: executionEnvironment, // 'wasm_stylus', 'evm', etc.
      contract_address: contractAddress,
      programming_language: programmingLanguage, // 'logic', 'rust', 'go'
      gas_used_computation: parseInt(String(gasUsed), 10) || 0,
      timestamp: new Date().toISOString()
    };

    return await fetch(ANALYTICS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MOR-App-Source": "Academy-Sandbox-Core"
      },
      body: JSON.stringify(telemetryBundle)
    });
  } catch (error) {
    console.error("[MOR_TRACKER_EXCEPTION]: Failed to log metric.", error);
    return false;
  }
}
