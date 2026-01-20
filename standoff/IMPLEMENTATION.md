# Stand Off - Technical Implementation Guide

> **Companion to**: `standoff-spec.md` (product specification)  
> **Purpose**: Hands-on code implementation guide with Farcaster/Neynar integration

---

## Quick Start

```bash
# 1. Clone and setup
git clone <repo>
cd standoff
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Start local development
docker-compose up -d  # Postgres + Redis
npx prisma migrate dev
npm run dev

# 4. Deploy contracts (Anvil for local testing)
cd contracts
forge test
forge script script/Deploy.s.sol --broadcast --rpc-url http://localhost:8545
```

---

## Core Tech Stack

```json
{
  "contracts": {
    "framework": "Foundry",
    "language": "Solidity ^0.8.24",
    "chain": "Base (8453)",
    "libs": "@openzeppelin/contracts-upgradeable@5.0.1"
  },
  "backend": {
    "runtime": "Next.js 14 (App Router)",
    "database": "PostgreSQL 16 + Prisma",
    "cache": "Redis (Upstash)",
    "storage": "IPFS (Pinata)",
    "events": "Viem + Alchemy webhooks"
  },
  "frontend": {
    "framework": "Next.js 14 + React 18",
    "web3": "wagmi ^2.5 + viem ^2.7",
    "wallet": "ConnectKit",
    "ui": "TailwindCSS + shadcn/ui"
  },
  "farcaster": {
    "frames": "Frog 0.11+",
    "api": "Neynar API v2",
    "auth": "@farcaster/auth-kit",
    "sdk": "@neynar/react"
  }
}
```

---

## Smart Contract Implementation

### Complete BattleFactory Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/**
 * @title BattleFactory
 * @notice Core contract for Stand Off design battles
 * @dev Upgradeable via UUPS pattern
 */
contract BattleFactory is 
    UUPSUpgradeable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable,
    PausableUpgradeable 
{
    // ============ State Variables ============
    
    uint256 public nextBattleId;
    uint256 public platformFeePercent; // Basis points (1000 = 10%)
    address public platformFeeRecipient;
    
    // Constants
    uint256 public constant MAX_SUBMISSIONS = 100;
    uint256 public constant MIN_ENTRY_FEE = 0.001 ether;
    uint256 public constant MAX_ENTRY_FEE = 10 ether;
    uint256 public constant MIN_DURATION = 1 days;
    uint256 public constant MAX_DURATION = 7 days;
    
    // ============ Structs ============
    
    struct Battle {
        uint256 id;
        address creator;
        string prompt;
        string ipfsMetadata;
        uint256 entryFee;
        uint256 deadline;
        BattleStatus status;
        uint256 prizePool;
        uint256 submissionCount;
        uint256 winningSubmissionId;
        uint256 createdAt;
    }
    
    struct Submission {
        uint256 id;
        uint256 battleId;
        address designer;
        string ipfsHash;
        string title;
        uint256 voteCount;
        uint256 submittedAt;
    }
    
    enum BattleStatus { Active, Finalized, Cancelled }
    
    // ============ Storage ============
    
    mapping(uint256 => Battle) public battles;
    mapping(uint256 => Submission[]) public submissions;
    mapping(uint256 => mapping(address => uint256)) public userVotes; // battleId => voter => submissionId+1 (0 = not voted)
    mapping(uint256 => mapping(address => uint256)) public claimableWinnings;
    
    // ============ Events ============
    
    event BattleCreated(
        uint256 indexed battleId,
        address indexed creator,
        uint256 entryFee,
        uint256 deadline,
        string ipfsMetadata
    );
    
    event DesignSubmitted(
        uint256 indexed battleId,
        uint256 indexed submissionId,
        address indexed designer,
        string ipfsHash
    );
    
    event VoteCast(
        uint256 indexed battleId,
        uint256 indexed submissionId,
        address indexed voter
    );
    
    event BattleFinalized(
        uint256 indexed battleId,
        uint256 indexed winningSubmissionId,
        address indexed winner,
        uint256 prize
    );
    
    event WinningsClaimed(
        uint256 indexed battleId,
        address indexed claimer,
        uint256 amount
    );
    
    // ============ Initialization ============
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _platformFeeRecipient,
        uint256 _platformFeePercent
    ) public initializer {
        require(_platformFeeRecipient != address(0), "Invalid recipient");
        require(_platformFeePercent <= 2000, "Fee too high"); // Max 20%
        
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        
        platformFeeRecipient = _platformFeeRecipient;
        platformFeePercent = _platformFeePercent;
    }

    // ============ Core Functions ============
    
    function createBattle(
        string calldata prompt,
        string calldata ipfsMetadata,
        uint256 entryFee,
        uint256 duration
    ) external onlyOwner whenNotPaused returns (uint256) {
        require(bytes(prompt).length > 0 && bytes(prompt).length <= 500, "Invalid prompt");
        require(bytes(ipfsMetadata).length > 0, "IPFS required");
        require(entryFee >= MIN_ENTRY_FEE && entryFee <= MAX_ENTRY_FEE, "Invalid fee");
        require(duration >= MIN_DURATION && duration <= MAX_DURATION, "Invalid duration");
        
        uint256 battleId = nextBattleId++;
        
        battles[battleId] = Battle({
            id: battleId,
            creator: msg.sender,
            prompt: prompt,
            ipfsMetadata: ipfsMetadata,
            entryFee: entryFee,
            deadline: block.timestamp + duration,
            status: BattleStatus.Active,
            prizePool: 0,
            submissionCount: 0,
            winningSubmissionId: 0,
            createdAt: block.timestamp
        });
        
        emit BattleCreated(battleId, msg.sender, entryFee, battles[battleId].deadline, ipfsMetadata);
        return battleId;
    }
    
    function submitDesign(
        uint256 battleId,
        string calldata ipfsHash,
        string calldata title
    ) external payable whenNotPaused nonReentrant {
        Battle storage battle = battles[battleId];
        
        require(battle.status == BattleStatus.Active, "Not active");
        require(block.timestamp < battle.deadline, "Ended");
        require(msg.value == battle.entryFee, "Wrong fee");
        require(battle.submissionCount < MAX_SUBMISSIONS, "Max submissions");
        require(bytes(ipfsHash).length > 0 && bytes(title).length > 0, "Invalid data");
        
        // Check not already submitted
        Submission[] storage subs = submissions[battleId];
        for (uint256 i = 0; i < subs.length; i++) {
            require(subs[i].designer != msg.sender, "Already submitted");
        }
        
        uint256 submissionId = battle.submissionCount;
        
        subs.push(Submission({
            id: submissionId,
            battleId: battleId,
            designer: msg.sender,
            ipfsHash: ipfsHash,
            title: title,
            voteCount: 0,
            submittedAt: block.timestamp
        }));
        
        battle.submissionCount++;
        battle.prizePool += msg.value;
        
        emit DesignSubmitted(battleId, submissionId, msg.sender, ipfsHash);
    }
    
    function vote(uint256 battleId, uint256 submissionId) external whenNotPaused {
        Battle storage battle = battles[battleId];
        
        require(battle.status == BattleStatus.Active, "Not active");
        require(block.timestamp < battle.deadline, "Ended");
        require(submissionId < battle.submissionCount, "Invalid submission");
        require(userVotes[battleId][msg.sender] == 0, "Already voted");
        
        userVotes[battleId][msg.sender] = submissionId + 1;
        submissions[battleId][submissionId].voteCount++;
        
        emit VoteCast(battleId, submissionId, msg.sender);
    }
    
    function finalizeBattle(uint256 battleId) external onlyOwner nonReentrant {
        Battle storage battle = battles[battleId];
        
        require(battle.status == BattleStatus.Active, "Not active");
        require(block.timestamp >= battle.deadline, "Not ended");
        require(battle.submissionCount > 0, "No submissions");
        
        // Find winner
        uint256 winningId = 0;
        uint256 maxVotes = 0;
        
        Submission[] storage subs = submissions[battleId];
        for (uint256 i = 0; i < subs.length; i++) {
            if (subs[i].voteCount > maxVotes ||
                (subs[i].voteCount == maxVotes && subs[i].submittedAt < subs[winningId].submittedAt)) {
                maxVotes = subs[i].voteCount;
                winningId = i;
            }
        }
        
        address winner = subs[winningId].designer;
        uint256 platformFee = (battle.prizePool * platformFeePercent) / 10000;
        uint256 winnerPrize = battle.prizePool - platformFee;
        
        battle.status = BattleStatus.Finalized;
        battle.winningSubmissionId = winningId;
        
        claimableWinnings[battleId][winner] = winnerPrize;
        claimableWinnings[battleId][platformFeeRecipient] = platformFee;
        
        emit BattleFinalized(battleId, winningId, winner, winnerPrize);
    }
    
    function claimWinnings(uint256 battleId) external nonReentrant {
        require(battles[battleId].status == BattleStatus.Finalized, "Not finalized");
        
        uint256 amount = claimableWinnings[battleId][msg.sender];
        require(amount > 0, "No winnings");
        
        claimableWinnings[battleId][msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit WinningsClaimed(battleId, msg.sender, amount);
    }
    
    // ============ View Functions ============
    
    function getBattle(uint256 battleId) external view returns (Battle memory) {
        return battles[battleId];
    }
    
    function getSubmissions(uint256 battleId) external view returns (Submission[] memory) {
        return submissions[battleId];
    }
    
    function hasVoted(uint256 battleId, address voter) external view returns (bool) {
        return userVotes[battleId][voter] > 0;
    }
    
    // ============ Admin ============
    
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 2000, "Too high");
        platformFeePercent = _newFee;
    }
    
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
    
    function _authorizeUpgrade(address) internal override onlyOwner {}
}
```

### Deployment Script

```solidity
// script/Deploy.s.sol
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/BattleFactory.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address feeRecipient = vm.envAddress("PLATFORM_FEE_RECIPIENT");
        
        vm.startBroadcast(deployerKey);
        
        // Deploy implementation
        BattleFactory impl = new BattleFactory();
        console.log("Implementation:", address(impl));
        
        // Deploy proxy
        bytes memory initData = abi.encodeCall(
            BattleFactory.initialize,
            (feeRecipient, 1000) // 10% fee
        );
        
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        console.log("Proxy:", address(proxy));
        
        vm.stopBroadcast();
    }
}
```

---

## Backend Implementation

### Prisma Schema (Complete)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Battle {
  id                  BigInt       @id @default(autoincrement())
  battleId            BigInt       @unique
  creator             String
  title               String
  prompt              String       @db.Text
  ipfsMetadata        String
  entryFee            String
  deadline            DateTime
  status              BattleStatus
  prizePool           String
  submissionCount     Int          @default(0)
  winningSubmissionId BigInt?
  createdAt           DateTime     @default(now())
  finalizedAt         DateTime?
  
  submissions Submission[]
  votes       Vote[]
  
  @@index([status])
  @@index([deadline])
  @@index([createdAt])
}

enum BattleStatus {
  ACTIVE
  FINALIZED
  CANCELLED
}

model Submission {
  id           BigInt   @id @default(autoincrement())
  battleId     BigInt
  submissionId BigInt
  designer     String
  ipfsHash     String
  title        String
  voteCount    Int      @default(0)
  createdAt    DateTime @default(now())
  
  battle Battle @relation(fields: [battleId], references: [battleId])
  votes  Vote[]
  user   User?  @relation(fields: [designer], references: [address])
  
  @@unique([battleId, submissionId])
  @@index([battleId])
  @@index([designer])
}

model Vote {
  id           BigInt   @id @default(autoincrement())
  battleId     BigInt
  submissionId BigInt
  voter        String
  txHash       String
  createdAt    DateTime @default(now())
  
  battle     Battle     @relation(fields: [battleId], references: [battleId])
  submission Submission @relation(fields: [submissionId], references: [id])
  user       User?      @relation(fields: [voter], references: [address])
  
  @@unique([battleId, voter])
  @@index([battleId])
}

model User {
  address          String       @id
  farcasterFid     BigInt?      @unique
  username         String?
  displayName      String?
  bio              String?      @db.Text
  pfpUrl           String?
  totalWins        Int          @default(0)
  totalSubmissions Int          @default(0)
  totalEarnings    String       @default("0")
  createdAt        DateTime     @default(now())
  
  submissions Submission[]
  votes       Vote[]
  
  @@index([totalWins])
  @@index([farcasterFid])
}
```

### Contract Integration Layer

```typescript
// lib/contract.ts
import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const ABI = parseAbi([
  'function createBattle(string,string,uint256,uint256) returns (uint256)',
  'function submitDesign(uint256,string,string) payable',
  'function vote(uint256,uint256)',
  'function finalizeBattle(uint256)',
  'function claimWinnings(uint256)',
  'function getBattle(uint256) view returns (tuple(uint256,address,string,string,uint256,uint256,uint8,uint256,uint256,uint256,uint256))',
  'function getSubmissions(uint256) view returns (tuple(uint256,uint256,address,string,string,uint256,uint256)[])',
  'event BattleCreated(uint256 indexed,address indexed,uint256,uint256,string)',
  'event DesignSubmitted(uint256 indexed,uint256 indexed,address indexed,string)',
  'event VoteCast(uint256 indexed,uint256 indexed,address indexed)',
  'event BattleFinalized(uint256 indexed,uint256 indexed,address indexed,uint256)',
]);

export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL!),
});

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

export const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(process.env.BASE_RPC_URL!),
});

export const CONTRACT_ADDRESS = process.env.BATTLE_FACTORY_ADDRESS as `0x${string}`;

export const contract = {
  address: CONTRACT_ADDRESS,
  abi: ABI,
};

// Helper functions
export async function createBattle(params: {
  prompt: string;
  ipfsMetadata: string;
  entryFee: bigint;
  duration: bigint;
}) {
  const { request } = await publicClient.simulateContract({
    ...contract,
    functionName: 'createBattle',
    args: [params.prompt, params.ipfsMetadata, params.entryFee, params.duration],
    account,
  });
  return await walletClient.writeContract(request);
}

export async function finalizeBattle(battleId: bigint) {
  const { request } = await publicClient.simulateContract({
    ...contract,
    functionName: 'finalizeBattle',
    args: [battleId],
    account,
  });
  return await walletClient.writeContract(request);
}
```

### Neynar Integration

```typescript
// lib/neynar.ts
import { NeynarAPIClient } from '@neynar/nodejs-sdk';

if (!process.env.NEYNAR_API_KEY) {
  throw new Error('NEYNAR_API_KEY required');
}

export const neynar = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

/**
 * Get Farcaster user by Ethereum address
 */
export async function getUserByAddress(address: string) {
  try {
    const { users } = await neynar.fetchBulkUsersByEthereumAddress([address]);
    return users[address]?.[0] || null;
  } catch (error) {
    console.error('Neynar getUserByAddress error:', error);
    return null;
  }
}

/**
 * Get Farcaster user by FID
 */
export async function getUserByFid(fid: number) {
  try {
    const { users } = await neynar.fetchBulkUsers([fid]);
    return users[0] || null;
  } catch (error) {
    console.error('Neynar getUserByFid error:', error);
    return null;
  }
}

/**
 * Send notification to user
 */
export async function notifyUser(fid: number, message: string) {
  try {
    // This requires a Neynar signer - set up via Neynar dashboard
    if (!process.env.NEYNAR_SIGNER_UUID) {
      console.warn('NEYNAR_SIGNER_UUID not set, skipping notification');
      return;
    }

    await neynar.publishCast({
      signerUuid: process.env.NEYNAR_SIGNER_UUID,
      text: `@${await getFidUsername(fid)} ${message}`,
    });
  } catch (error) {
    console.error('Notification error:', error);
  }
}

async function getFidUsername(fid: number): Promise<string> {
  const user = await getUserByFid(fid);
  return user?.username || `fid:${fid}`;
}
```

### Event Indexer

```typescript
// services/indexer.ts
import { publicClient, contract } from '@/lib/contract';
import { prisma } from '@/lib/db';
import { getUserByAddress } from '@/lib/neynar';

class Indexer {
  async start() {
    console.log('🔍 Starting event indexer...');
    this.watchBattleCreated();
    this.watchDesignSubmitted();
    this.watchVoteCast();
    this.watchBattleFinalized();
  }

  private watchBattleCreated() {
    publicClient.watchContractEvent({
      ...contract,
      eventName: 'BattleCreated',
      onLogs: async (logs) => {
        for (const log of logs) {
          const { battleId, creator, entryFee, deadline, ipfsMetadata } = log.args;
          
          // Fetch metadata from IPFS
          const metadata = await fetch(`${process.env.PINATA_GATEWAY}/ipfs/${ipfsMetadata}`)
            .then(r => r.json());

          await prisma.battle.create({
            data: {
              battleId: BigInt(battleId),
              creator,
              title: metadata.title,
              prompt: metadata.description,
              ipfsMetadata,
              entryFee: entryFee.toString(),
              deadline: new Date(Number(deadline) * 1000),
              status: 'ACTIVE',
              prizePool: '0',
            },
          });
          
          console.log(`✅ Battle created: ${battleId}`);
        }
      },
    });
  }

  private watchDesignSubmitted() {
    publicClient.watchContractEvent({
      ...contract,
      eventName: 'DesignSubmitted',
      onLogs: async (logs) => {
        for (const log of logs) {
          const { battleId, submissionId, designer, ipfsHash } = log.args;
          
          // Fetch Farcaster profile
          const fcUser = await getUserByAddress(designer);
          
          // Upsert user
          if (fcUser) {
            await prisma.user.upsert({
              where: { address: designer },
              create: {
                address: designer,
                farcasterFid: BigInt(fcUser.fid),
                username: fcUser.username,
                displayName: fcUser.display_name,
                pfpUrl: fcUser.pfp_url,
                totalSubmissions: 1,
              },
              update: {
                totalSubmissions: { increment: 1 },
              },
            });
          }

          // Get submission title from contract
          const subs = await publicClient.readContract({
            ...contract,
            functionName: 'getSubmissions',
            args: [battleId],
          });
          const sub = subs[Number(submissionId)];

          await prisma.submission.create({
            data: {
              battleId: BigInt(battleId),
              submissionId: BigInt(submissionId),
              designer,
              ipfsHash,
              title: sub.title,
            },
          });

          await prisma.battle.update({
            where: { battleId: BigInt(battleId) },
            data: {
              submissionCount: { increment: 1 },
              prizePool: { increment: sub.battleId }, // Add entry fee
            },
          });

          console.log(`✅ Submission: Battle ${battleId}, ID ${submissionId}`);
        }
      },
    });
  }

  private watchVoteCast() {
    publicClient.watchContractEvent({
      ...contract,
      eventName: 'VoteCast',
      onLogs: async (logs) => {
        for (const log of logs) {
          const { battleId, submissionId, voter } = log.args;
          
          const submission = await prisma.submission.findFirst({
            where: {
              battleId: BigInt(battleId),
              submissionId: BigInt(submissionId),
            },
          });

          if (!submission) continue;

          await prisma.vote.create({
            data: {
              battleId: BigInt(battleId),
              submissionId: submission.id,
              voter,
              txHash: log.transactionHash,
            },
          });

          await prisma.submission.update({
            where: { id: submission.id },
            data: { voteCount: { increment: 1 } },
          });

          console.log(`✅ Vote: Battle ${battleId}, Submission ${submissionId}`);
        }
      },
    });
  }

  private watchBattleFinalized() {
    publicClient.watchContractEvent({
      ...contract,
      eventName: 'BattleFinalized',
      onLogs: async (logs) => {
        for (const log of logs) {
          const { battleId, winningSubmissionId, winner, prize } = log.args;
          
          await prisma.battle.update({
            where: { battleId: BigInt(battleId) },
            data: {
              status: 'FINALIZED',
              winningSubmissionId: BigInt(winningSubmissionId),
              finalizedAt: new Date(),
            },
          });

          await prisma.user.update({
            where: { address: winner },
            data: {
              totalWins: { increment: 1 },
              totalEarnings: {
                set: (
                  BigInt((await prisma.user.findUnique({ where: { address: winner } }))?.totalEarnings || '0') +
                  BigInt(prize)
                ).toString(),
              },
            },
          });

          console.log(`🏆 Battle ${battleId} finalized! Winner: ${winner}`);
        }
      },
    });
  }
}

export const indexer = new Indexer();
```

---

## Farcaster Frames Implementation

### Complete Frame Implementation

```typescript
// app/api/frames/[[...routes]]/route.tsx
/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog';
import { handle } from 'frog/next';
import { prisma } from '@/lib/db';

const app = new Frog({
  assetsPath: '/',
  basePath: '/api/frames',
  title: 'Stand Off - Design Battles',
  imageOptions: { width: 1200, height: 630 },
});

// Frame 1: Battle Discovery
app.frame('/', async (c) => {
  const battles = await prisma.battle.findMany({
    where: {
      status: 'ACTIVE',
      deadline: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
    take: 1,
  });

  if (battles.length === 0) {
    return c.res({
      image: (
        <div tw="flex w-full h-full bg-slate-900 items-center justify-center">
          <div tw="flex flex-col items-center">
            <h1 tw="text-6xl font-bold text-white">No Active Battles</h1>
            <p tw="text-2xl text-gray-400 mt-4">Check back soon!</p>
          </div>
        </div>
      ),
    });
  }

  const battle = battles[0];
  const hoursLeft = Math.floor((battle.deadline.getTime() - Date.now()) / 1000 / 60 / 60);
  const prizeEth = (Number(battle.prizePool) / 1e18).toFixed(3);

  return c.res({
    image: (
      <div tw="flex w-full h-full bg-slate-900 text-white p-16 flex-col">
        <div tw="flex text-5xl font-bold mb-8">🎨 {battle.title}</div>
        <div tw="flex text-2xl text-gray-300 mb-12">{battle.prompt.slice(0, 150)}...</div>
        <div tw="flex justify-between text-2xl">
          <div tw="flex flex-col">
            <span tw="text-gray-400">Prize Pool</span>
            <span tw="text-4xl font-bold text-green-400">{prizeEth} ETH</span>
          </div>
          <div tw="flex flex-col">
            <span tw="text-gray-400">Entries</span>
            <span tw="text-4xl font-bold">{battle.submissionCount}</span>
          </div>
          <div tw="flex flex-col">
            <span tw="text-gray-400">Ends In</span>
            <span tw="text-4xl font-bold">{hoursLeft}h</span>
          </div>
        </div>
      </div>
    ),
    intents: [
      <Button action={`/battle/${battle.battleId}`}>View Designs</Button>,
      <Button.Link href={`${process.env.NEXT_PUBLIC_APP_URL}/battles/${battle.battleId}`}>
        Enter Battle →
      </Button.Link>,
    ],
  });
});

// Frame 2: View Designs
app.frame('/battle/:id', async (c) => {
  const battleId = c.req.param('id');
  const index = Number(c.buttonValue) || 0;

  const battle = await prisma.battle.findUnique({
    where: { battleId: BigInt(battleId) },
    include: {
      submissions: {
        include: { user: true },
        orderBy: { voteCount: 'desc' },
      },
    },
  });

  if (!battle || !battle.submissions[index]) {
    return c.res({ image: <div tw="flex">Not found</div> });
  }

  const sub = battle.submissions[index];
  const imageUrl = `${process.env.PINATA_GATEWAY}/ipfs/${sub.ipfsHash}`;

  return c.res({
    image: imageUrl,
    imageAspectRatio: '1:1',
    intents: [
      index > 0 && <Button value={String(index - 1)}>⬅️</Button>,
      <Button.Link href={`${process.env.NEXT_PUBLIC_APP_URL}/battles/${battleId}?vote=${sub.submissionId}`}>
        Vote ({sub.voteCount})
      </Button.Link>,
      index < battle.submissions.length - 1 && <Button value={String(index + 1)}>➡️</Button>,
    ].filter(Boolean),
  });
});

export const GET = handle(app);
export const POST = handle(app);
```

### Farcaster Auth Component

```typescript
// components/FarcasterAuth.tsx
'use client';

import { AuthKitProvider, SignInButton, useProfile } from '@farcaster/auth-kit';
import { useAccount } from 'wagmi';

const config = {
  relay: 'https://relay.farcaster.xyz',
  rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL!,
  domain: 'standoff.xyz',
  siweUri: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
};

export function FarcasterAuth() {
  return (
    <AuthKitProvider config={config}>
      <AuthContent />
    </AuthKitProvider>
  );
}

function AuthContent() {
  const { address } = useAccount();
  const { profile, isLoading } = useProfile();

  if (!address) {
    return <p className="text-gray-400">Connect wallet first</p>;
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!profile) {
    return (
      <SignInButton
        onSuccess={(res) => {
          console.log('Farcaster auth success:', res);
          // Store FID in session/local storage if needed
        }}
      />
    );
  }

  return (
    <div className="flex items-center gap-3">
      <img src={profile.pfpUrl} alt="" className="w-10 h-10 rounded-full" />
      <div>
        <p className="font-medium">{profile.displayName}</p>
        <p className="text-sm text-gray-400">@{profile.username}</p>
      </div>
    </div>
  );
}
```

---

## Frontend Components

### Vote Button with Optimistic UI

```typescript
// components/VoteButton.tsx
'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contract } from '@/lib/contract';

interface Props {
  battleId: string;
  submissionId: string;
  currentVotes: number;
  hasVoted: boolean;
}

export function VoteButton({ battleId, submissionId, currentVotes, hasVoted }: Props) {
  const [optimisticVotes, setOptimisticVotes] = useState(currentVotes);
  
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading } = useWaitForTransactionReceipt({ hash });

  const handleVote = async () => {
    try {
      // Optimistic update
      setOptimisticVotes(optimisticVotes + 1);

      writeContract({
        ...contract,
        functionName: 'vote',
        args: [BigInt(battleId), BigInt(submissionId)],
      });
    } catch (error) {
      // Revert optimistic update
      setOptimisticVotes(currentVotes);
      console.error('Vote error:', error);
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={hasVoted || isLoading}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
    >
      {isLoading ? 'Voting...' : hasVoted ? 'Voted' : `Vote (${optimisticVotes})`}
    </button>
  );
}
```

### Submit Design Modal

```typescript
// components/SubmitDesignModal.tsx
'use client';

import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { contract } from '@/lib/contract';

interface Props {
  battleId: string;
  entryFee: string;
  onClose: () => void;
}

export function SubmitDesignModal({ battleId, entryFee, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const { writeContract, isPending } = useWriteContract();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    try {
      setIsUploading(true);

      // Upload to IPFS
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const { ipfsHash } = await response.json();

      // Submit to contract
      writeContract({
        ...contract,
        functionName: 'submitDesign',
        args: [BigInt(battleId), ipfsHash, title],
        value: parseEther(entryFee),
      });

      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit design');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-6">Submit Your Design</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Design Image *</label>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              required
            />
            {preview && (
              <img src={preview} alt="Preview" className="mt-4 rounded-lg max-h-64 object-contain" />
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
              placeholder="My Awesome Design"
              required
            />
          </div>

          {/* Entry fee */}
          <div className="bg-slate-700 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Entry Fee</p>
            <p className="text-2xl font-bold">{entryFee} ETH</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || !title || isUploading || isPending}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-bold"
            >
              {isUploading ? 'Uploading...' : isPending ? 'Submitting...' : 'Submit Design'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## Security Checklist

### Smart Contract Security

```solidity
// ✅ Reentrancy protection
modifier nonReentrant() { ... }

// ✅ Pull pattern for withdrawals
function claimWinnings() external nonReentrant {
    uint256 amount = claimableWinnings[msg.sender];
    claimableWinnings[msg.sender] = 0; // Update state first
    (bool success, ) = msg.sender.call{value: amount}("");
}

// ✅ Input validation
require(entryFee >= MIN_ENTRY_FEE && entryFee <= MAX_ENTRY_FEE);
require(bytes(ipfsHash).length > 0);

// ✅ Access control
modifier onlyOwner() { ... }

// ✅ Emergency pause
function pause() external onlyOwner { _pause(); }
```

### API Security

```typescript
// Rate limiting
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  // ... handle request
}
```

### File Upload Security

```typescript
// app/api/upload/route.ts
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  // Validation
  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: 'Invalid type' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return Response.json({ error: 'Too large' }, { status: 400 });
  }

  // Upload to IPFS...
}
```

---

## Testing

### Contract Tests

```bash
# Run all tests
forge test

# Run with gas report
forge test --gas-report

# Run specific test
forge test --match-test testSubmitDesign -vvv

# Coverage
forge coverage
```

### E2E Test Example

```typescript
// tests/e2e/battle-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete battle flow', async ({ page }) => {
  // Navigate to battle
  await page.goto('http://localhost:3000/battles/0');
  
  // Connect wallet (mocked)
  await page.click('text=Connect Wallet');
  
  // Submit design
  await page.click('text=Enter Battle');
  await page.setInputFiles('input[type="file"]', './test-image.png');
  await page.fill('input[name="title"]', 'Test Design');
  await page.click('text=Submit');
  
  // Wait for confirmation
  await page.waitForSelector('text=submitted', { timeout: 30000 });
  
  // Verify appears in grid
  await expect(page.locator('text=Test Design')).toBeVisible();
});
```

---

## Deployment

```bash
# 1. Deploy contracts
cd contracts
forge script script/Deploy.s.sol --rpc-url $BASE_RPC_URL --broadcast --verify

# 2. Set up database
npx prisma migrate deploy

# 3. Deploy to Vercel
vercel --prod

# 4. Start indexer (auto-starts in Vercel)
# Monitor in Vercel logs

# 5. Test Frame
# Post to Warpcast: https://standoff.xyz/api/frames
```

---

## Environment Variables Template

```bash
# .env.local
# Blockchain
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
BATTLE_FACTORY_ADDRESS=0x...
PRIVATE_KEY=0x...

# Database
DATABASE_URL=postgresql://user:pass@host:5432/standoff

# Redis
REDIS_URL=redis://default:xxx@xxx.upstash.io:6379
REDIS_TOKEN=xxx

# IPFS
PINATA_JWT=eyJhbGc...
PINATA_GATEWAY=https://gateway.pinata.cloud

# Neynar
NEYNAR_API_KEY=YOUR_KEY
NEYNAR_SIGNER_UUID=xxx

# App
NEXT_PUBLIC_APP_URL=https://standoff.xyz
NEXT_PUBLIC_CHAIN_ID=8453
```

---

**This guide provides everything needed to build Stand Off MVP. Follow section by section, test as you go, and ship fast. 🚀**
