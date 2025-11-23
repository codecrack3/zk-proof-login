# Zero-Knowledge Proof Authentication System

A privacy-preserving authentication system built with Circom zero-knowledge proofs, enabling password verification without transmitting sensitive user credentials.

## Overview

This system implements a novel approach to authentication using zero-knowledge proofs (ZKPs), allowing users to authenticate without revealing their passwords or secrets to the server. The architecture consists of:

- **ZK Circuit**: Authentication verification circuit using Poseidon hashing
- **Express Backend**: User registration, session management, and proof verification
- **React Frontend**: Modern client interface with ZK proof generation

## Architecture

### Circuit Layer
The authentication circuit (`circuits/auth.circom`) implements:
- Poseidon hash function for secure commitment schemes
- Nonce-based replay attack prevention
- Public commitment verification without secret exposure

### Backend Services
- RESTful API with Express.js
- SQLite database for user storage
- Snarkjs integration for ZK proof verification
- Session-based authentication flow

### Frontend Application
- React 18 with Vite build system
- Real-time ZK proof generation and verification
- Responsive UI with Tailwind CSS and Radix components

## Security Features

- **Zero-Knowledge Authentication**: Passwords never leave the client
- **Replay Attack Protection**: Nonce-based challenge system
- **Commitment Scheme**: Secure password storage using cryptographic commitments
- **Session Management**: Secure server-side session handling

## Technology Stack

**Circuit Development**
- Circom 2.0.0
- Circomlib cryptographic primitives
- Snarkjs for proof generation and verification

**Backend**
- Node.js with Express.js
- SQLite3 database
- Ethers.js for cryptographic operations

**Frontend**
- React 18 with modern hooks
- Vite for development and building
- Tailwind CSS for styling
- Radix UI for accessible components

## Quick Start

```bash
# Install dependencies
npm run setup

# Start development servers (both client and server)
npm run dev

# Compile ZK circuit
npm run compile:circuit
```

## Authentication Flow

1. **Registration**: Client generates commitment and stores with server
2. **Login Request**: Server issues nonce challenge
3. **Proof Generation**: Client creates ZK proof of password knowledge
4. **Verification**: Server validates proof without learning the secret
5. **Session**: Authenticated session established if proof is valid

## Project Structure

```
├── circuits/           # Circom circuit files and compilation
├── server/            # Express backend with authentication API
├── client/            # React frontend application
├── contracts/         # Smart contract interfaces (future)
└── tests/             # Integration and unit tests
```
