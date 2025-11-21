# Circuit Build Artifacts

This directory contains compiled zero-knowledge circuit artifacts.

## Files to be generated:
- `auth.r1cs` - Circuit constraints
- `auth.wasm` - WebAssembly circuit
- `auth.sym` - Symbolic information
- `auth_final.zkey` - Proving key
- `verification_key.json` - Verification key

## Compilation
Run `node compile.js` to compile the circuit (requires circom CLI tools).

For development, these files can be generated when needed or in CI/CD.