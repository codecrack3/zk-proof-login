import snarkjs from "snarkjs";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

async function compileCircuit() {
    try {
        // Compile the circuit
        console.log("Compiling circuit...");
        execSync("circom auth.circom --r1cs --wasm --sym -o ./build", { stdio: 'inherit' });

        // Download the ceremony key (ptau)
        console.log("Downloading powers of tau ceremony key...");
        execSync("wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_20.ptau", { stdio: 'inherit' });

        // Generate the zkey
        console.log("Starting trusted setup...");
        execSync("snarkjs groth16 setup build/auth.r1cs powersOfTau28_hez_final_20.ptau build/auth_0000.zkey", { stdio: 'inherit' });

        // Contribute to the ceremony
        execSync("snarkjs zkey contribute build/auth_0000.zkey build/auth_final.zkey --name='1st Contributor Name' -v", { stdio: 'inherit' });

        // Export verification key
        execSync("snarkjs zkey export verificationkey build/auth_final.zkey build/verification_key.json", { stdio: 'inherit' });

        console.log("Circuit compiled successfully!");

    } catch (error) {
        console.error("Compilation failed:", error);
        process.exit(1);
    }
}

compileCircuit();