import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const PTAU_URL = process.env.PTAU_URL ?? "https://hermez.s3.eu-west-1.amazonaws.com/powersOfTau28_hez_final_20.ptau";
const PTAU_FILENAME = "powersOfTau28_hez_final_20.ptau";
const PTAU_PATH = path.join(process.cwd(), PTAU_FILENAME);
const PTAU_MIN_BYTES = 1_000_000; // quick sanity check so we don't keep tiny XML error bodies

function ensurePtauFile() {
    if (fs.existsSync(PTAU_PATH)) {
        const { size } = fs.statSync(PTAU_PATH);
        if (size >= PTAU_MIN_BYTES) {
            console.log(`Found existing ${PTAU_FILENAME}, skipping download.`);
            return;
        }

        console.warn(`Existing ${PTAU_FILENAME} is only ${size} bytes, removing and regenerating...`);
        fs.rmSync(PTAU_PATH);
    }

    try {
        console.log("Downloading powers of tau ceremony key...");
        execSync(`curl -fL ${PTAU_URL} -o ${PTAU_FILENAME}`, { stdio: 'inherit' });
        const { size } = fs.statSync(PTAU_PATH);
        if (size < PTAU_MIN_BYTES) {
            throw new Error(`Downloaded file is unexpectedly small (${size} bytes).`);
        }
    } catch (downloadError) {
        console.warn(`Download failed (${downloadError.message}). Generating a local Powers of Tau file instead...`);
        execSync("snarkjs powersoftau new bn128 15 pot15_0000.ptau", { stdio: 'inherit' });
        execSync("snarkjs powersoftau contribute pot15_0000.ptau pot15_0001.ptau --name='Local Contributor' -v -e='Codex local entropy'", { stdio: 'inherit' });
        execSync("snarkjs powersoftau prepare phase2 pot15_0001.ptau pot15_final.ptau", { stdio: 'inherit' });
        fs.renameSync(path.join(process.cwd(), "pot15_final.ptau"), PTAU_PATH);
        fs.rmSync(path.join(process.cwd(), "pot15_0000.ptau"), { force: true });
        fs.rmSync(path.join(process.cwd(), "pot15_0001.ptau"), { force: true });
    }
}

async function compileCircuit() {
    try {
        // Compile the circuit
        console.log("Compiling circuit...");
        execSync("circom auth.circom --r1cs --wasm --sym -o ./build -l ../node_modules", { stdio: 'inherit' });

        ensurePtauFile();

        // Generate the zkey
        console.log("Starting trusted setup...");
        execSync(`snarkjs groth16 setup build/auth.r1cs ${PTAU_FILENAME} build/auth_0000.zkey`, { stdio: 'inherit' });

        // Contribute to the ceremony
        execSync("snarkjs zkey contribute build/auth_0000.zkey build/auth_final.zkey --name='1st Contributor Name' -e='Codex local entropy' -v", { stdio: 'inherit' });

        // Export verification key
        execSync("snarkjs zkey export verificationkey build/auth_final.zkey build/verification_key.json", { stdio: 'inherit' });

        copyArtifactsToClient();

        console.log("Circuit compiled successfully!");

    } catch (error) {
        console.error("Compilation failed:", error);
        process.exit(1);
    }
}

function copyArtifactsToClient() {
    const clientCircuitsDir = path.join(process.cwd(), "../client/public/circuits");

    try {
        fs.mkdirSync(clientCircuitsDir, { recursive: true });
        fs.copyFileSync(path.join(process.cwd(), "build/auth_js/auth.wasm"), path.join(clientCircuitsDir, "auth.wasm"));
        fs.copyFileSync(path.join(process.cwd(), "build/auth_final.zkey"), path.join(clientCircuitsDir, "auth_final.zkey"));
        console.log(`Copied proving artifacts to ${clientCircuitsDir}`);
    } catch (copyError) {
        console.warn("Unable to copy proving artifacts to client/public:", copyError.message);
    }
}

compileCircuit();
