pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template AuthCircuit() {
    signal input private secret;
    signal input public commitment;
    signal input public nonce;
    signal output out;

    // Hash the secret with nonce
    component hasher = Poseidon(2);
    hasher.inputs[0] <== secret;
    hasher.inputs[1] <== nonce;

    // Verify the hashed secret matches the commitment
    out <== hasher.out === commitment;
}

component main = AuthCircuit();