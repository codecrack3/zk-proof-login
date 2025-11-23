import snarkjs from "snarkjs";

export async function generateCommitment(secret, nonce) {
    // In a real implementation, this would use the Poseidon hash
    // For simplicity, we'll use a basic hash approach
    const encoder = new TextEncoder();
    const data = encoder.encode(secret + nonce);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function generateLoginProof(secret, nonce, storedCommitment) {
    try {
        // Load the WASM circuit
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            { secret, nonce, commitment: storedCommitment },
            "/circuits/build/auth.wasm",
            "/circuits/build/auth_final.zkey"
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