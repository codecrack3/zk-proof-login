import { groth16 } from "snarkjs";
import { buildPoseidon } from "circomlibjs";

const CIRCUIT_ASSET_BASE = "/circuits";
const encoder = new TextEncoder();
let poseidonPromise;

function bytesToBigInt(bytes) {
    return bytes.reduce((acc, byte) => (acc << 8n) + BigInt(byte), 0n);
}

async function getPoseidon() {
    if (!poseidonPromise) {
        poseidonPromise = buildPoseidon();
    }
    return poseidonPromise;
}

async function deriveFieldElements(secret, nonce) {
    const poseidon = await getPoseidon();
    const secretField = poseidon.F.e(bytesToBigInt(encoder.encode(secret)));
    const nonceField = poseidon.F.e(bytesToBigInt(encoder.encode(nonce)));
    return { poseidon, secretField, nonceField };
}

export async function generateCommitment(secret, nonce) {
    const { poseidon, secretField, nonceField } = await deriveFieldElements(secret, nonce);
    const commitment = poseidon([secretField, nonceField]);
    return poseidon.F.toString(commitment);
}

export async function generateLoginProof(secret, nonce, storedCommitment) {
    try {
        const { poseidon, secretField, nonceField } = await deriveFieldElements(secret, nonce);
        const inputs = {
            secret: poseidon.F.toString(secretField),
            nonce: poseidon.F.toString(nonceField),
            commitment: storedCommitment
        };

        const { proof, publicSignals } = await groth16.fullProve(
            inputs,
            `${CIRCUIT_ASSET_BASE}/auth.wasm`,
            `${CIRCUIT_ASSET_BASE}/auth_final.zkey`
        );

        return { proof, publicSignals };
    } catch (error) {
        console.error("Proof generation failed:", error);
        throw error;
    }
}

export function generateNonce() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
