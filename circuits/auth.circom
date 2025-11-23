pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

template AuthCircuit() {
    signal input secret;
    signal input commitment;
    signal input nonce;
    signal output out;

    // Hash the secret with nonce
    component hasher = Poseidon(2);
    hasher.inputs[0] <== secret;
    hasher.inputs[1] <== nonce;

    // Verify the hashed secret matches the commitment
    component eq = IsEqual();
    eq.in[0] <== hasher.out;
    eq.in[1] <== commitment;

    out <== eq.out;
}

component main { public [commitment, nonce] } = AuthCircuit();
