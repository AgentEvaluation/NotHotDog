# NotHotDog

<div align="center">
  <br />
  <h1>🤖 NotHotDog</h1>
  <h3>AI Agent Testing & Evaluation Platform</h3>
  <br />
  <p align="center">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white" alt="Next.js">
    <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
    <img src="https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white" alt="PostgreSQL">
    <img src="https://img.shields.io/github/stars/AgentEvaluation/NotHotDog?style=social" alt="GitHub stars">
  </p>
  <p align="center">
    <a href="#-overview">Overview</a> •
    <a href="#-editions">Editions</a> •
    <a href="#-features">Features</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>

<br />

## 📋 Overview

NotHotDog is an open-source platform for testing and evaluating AI agents. Built for developers who need quality assurance for their conversational AI systems, NotHotDog provides automated testing, hallucination detection, and performance monitoring.

## 🎁 Editions

### 🆓 Community Edition (This Repo)
Perfect for individuals and small teams getting started with AI agent testing.

**Includes:**
- ✅ Core agent testing framework
- ✅ Test case generation & execution
- ✅ **Hallucination detection** 
- ✅ Response time metrics
- ✅ Validation rules
- ✅ 3 pre-configured personas
- ✅ CSV/Excel test upload
- ✅ Basic performance metrics

### 🚀 Enterprise Edition
For teams needing advanced features, collaboration, and scale.

**Everything in Community, plus:**
- 🏢 Multi-tenant organizations
- 👥 Team collaboration & RBAC
- 🎭 Custom persona creation
- 📊 Custom metrics & KPIs  
- 📈 Advanced analytics dashboard
- 🔐 SSO & enterprise security
- 🎯 Priority support & SLAs
- 🔄 CI/CD integrations

[**Get Enterprise Access →**](mailto:enterprise@nothotdog.ai)

## ✨ Key Features (Community Edition)

### 🧪 Automated Test Generation
Generate test variations automatically using AI. Define a simple example, and NotHotDog creates diverse test cases covering different phrasings and scenarios.

### 🎭 Built-in Test Personas
Test with 3 pre-configured personas:
- **Friendly User**: Polite, clear communication style
- **Technical Expert**: Detailed technical questions  
- **Confused User**: Needs clarification and simple explanations

### 🔍 Hallucination Detection
Advanced AI-powered detection to identify when agents provide incorrect or fabricated information - a critical feature for production AI systems.

### 📊 Core Metrics

- **Response Time**: Measure agent latency and performance
- **Validation Pass/Fail**: Ensure responses meet your requirements
- **Hallucination Detection**: AI-powered factual verification
- **Test Success Rate**: Track overall agent reliability

### 🔄 Test Execution Engine
- **Parallel Processing**: Run 50+ test cases simultaneously
- **Conversation Memory**: Maintain context across multi-turn interactions
- **Adaptive Testing**: Dynamic conversation flow based on responses
- **Real-Time Monitoring**: Track test progress and results live

### ✅ Validation Framework
Define custom validation rules using:
- JSON path expressions for response parsing
- Conditional logic (equals, contains, regex matching)
- Criticality levels for rule prioritization
- Custom metric definitions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+
- API keys for LLM providers (Anthropic, OpenAI, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/AgentEvaluation/NotHotDog.git
cd NotHotDog

# Install dependencies
npm install

# Set up the database
npx prisma generate
npx prisma db push

# Configure environment variables
cp .env.example .env.local
```

### Environment Configuration

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nothotdog"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# LLM Provider Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
DEEPSEEK_API_KEY=...
GOOGLE_API_KEY=...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## 🏗️ Architecture

### System Overview

```mermaid
graph TB
    subgraph "Frontend"
        UI[Next.js App Router]
        Components[React Components]
        State[Client State Management]
    end
    
    subgraph "API Layer"
        Routes[API Routes]
        Auth[Authentication]
        Validation[Request Validation]
    end
    
    subgraph "Business Logic"
        TestEngine[Test Execution Engine]
        PersonaEngine[Persona Engine]
        MetricsEngine[Metrics Calculator]
        ValidationEngine[Validation Engine]
    end
    
    subgraph "Data Layer"
        Prisma[Prisma ORM]
        DB[(PostgreSQL)]
    end
    
    subgraph "External Services"
        LLM[LLM Providers]
        Clerk[Clerk Auth]
    end
    
    UI --> Routes
    Routes --> Auth
    Auth --> Validation
    Validation --> TestEngine
    TestEngine --> PersonaEngine
    TestEngine --> MetricsEngine
    TestEngine --> ValidationEngine
    PersonaEngine --> LLM
    MetricsEngine --> Prisma
    ValidationEngine --> Prisma
    Prisma --> DB
    Auth --> Clerk
```

### Tech Stack

#### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: React Hooks + Context
- **Charts**: Recharts

#### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Validation**: Zod
- **AI Integration**: LangChain

#### Infrastructure
- **Deployment**: Vercel / AWS / Self-hosted
- **Database**: PostgreSQL 15+
- **File Storage**: Local / S3 compatible

## 📡 API Reference

### Test Generation

```typescript
POST /api/tools/generate-tests
Content-Type: application/json

{
  "inputExample": "Sample user query",
  "agentDescription": "Customer support chatbot",
  "count": 50
}

Response:
{
  "testCases": [
    {
      "input": "Generated test input",
      "expectedBehavior": "Expected response pattern",
      "category": "edge-case"
    }
  ]
}
```

### Test Execution

```typescript
POST /api/tools/test-runs
Content-Type: application/json

{
  "agentConfig": {
    "endpoint": "https://api.example.com/chat",
    "headers": { "Authorization": "Bearer token" }
  },
  "testCases": ["test-id-1", "test-id-2"],
  "personas": ["persona-id-1", "persona-id-2"],
  "metrics": ["response-time", "validation-score"]
}

Response:
{
  "runId": "run-123",
  "status": "running",
  "totalTests": 100,
  "completed": 0
}
```

### Metrics Analysis

```typescript
GET /api/tools/metrics/{runId}

Response:
{
  "summary": {
    "totalTests": 100,
    "passed": 85,
    "failed": 15,
    "avgResponseTime": 1.2
  },
  "metrics": {
    "responseTime": { "min": 0.5, "max": 3.2, "avg": 1.2 },
    "validationScore": { "min": 0.7, "max": 1.0, "avg": 0.92 },
    "hallucinationRate": 0.05
  }
}
```

## 🧪 Testing Workflow

### 1. Configure Your Agent

```typescript
const agentConfig = {
  name: "Customer Support Bot",
  endpoint: "https://api.example.com/chat",
  headers: {
    "Authorization": "Bearer your-token",
    "Content-Type": "application/json"
  },
  inputFormat: {
    message: "string",
    context: "object"
  },
  outputFormat: {
    response: "string",
    metadata: "object"
  }
};
```

### 2. Define Validation Rules

```typescript
const validationRules = [
  {
    name: "Response Format",
    path: "$.response",
    condition: "exists",
    criticality: "high"
  },
  {
    name: "No PII Exposure",
    path: "$.response",
    condition: "not_contains",
    value: ["ssn", "credit card"],
    criticality: "high"
  }
];
```

### 3. Create Test Personas

```typescript
const personas = [
  {
    name: "Frustrated Customer",
    traits: {
      temperature: 0.9,
      messageLength: "short",
      communicationStyle: "casual",
      emotionalState: "frustrated",
      slangUsage: true
    }
  },
  {
    name: "Technical Expert",
    traits: {
      temperature: 0.3,
      messageLength: "detailed",
      techSavviness: "expert",
      communicationStyle: "formal"
    }
  }
];
```

### 4. Execute Tests

```typescript
const testRun = await executeTests({
  agent: agentConfig,
  testCases: generatedTests,
  personas: selectedPersonas,
  validationRules: rules,
  parallel: true,
  maxConcurrency: 50
});
```

## 📊 Metrics & Reporting

### Available Metrics

| Metric | Type | Description |
|--------|------|-------------|
| **Response Time** | Quantitative | Time taken for agent to respond |
| **Validation Score** | Quantitative | Percentage of passed validation rules |
| **Hallucination Rate** | Quantitative | Frequency of factually incorrect responses |
| **Format Compliance** | Binary | Whether response matches expected format |
| **Conversation Coherence** | Quantitative | Quality of multi-turn interactions |
| **Sentiment Alignment** | Quantitative | Match between expected and actual tone |

### Custom Metrics

Define custom metrics for your specific use cases:

```typescript
const customMetric = {
  name: "Domain Knowledge Score",
  type: "quantitative",
  criticality: "high",
  calculator: async (response, expected) => {
    // Custom calculation logic
    return score;
  }
};
```

## 🔒 Security & Privacy

- **Data Isolation**: Multi-tenant architecture with organization-level data separation
- **Authentication**: Enterprise-grade auth via Clerk
- **API Security**: Rate limiting and request validation
- **Sensitive Data**: Automatic PII detection and masking options
- **Audit Logging**: Comprehensive activity tracking

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Code of conduct
- Development setup
- Pull request process
- Coding standards
- Testing requirements

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/yourusername/NotHotDog.git
cd NotHotDog

# Create a feature branch
git checkout -b feature/your-feature-name

# Install dependencies
npm install

# Set up pre-commit hooks
npm run prepare

# Run tests
npm test

# Run linting
npm run lint
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with excellent open-source technologies:

- [Next.js](https://nextjs.org/) - The React framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [LangChain](https://langchain.com/) - LLM application framework
- [Radix UI](https://www.radix-ui.com/) - Accessible component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

<div align="center">
  <p>
    <a href="https://github.com/AgentEvaluation/NotHotDog/issues">Report Bug</a> •
    <a href="https://github.com/AgentEvaluation/NotHotDog/discussions">Discussions</a> •
    <a href="https://github.com/AgentEvaluation/NotHotDog/wiki">Documentation</a>
  </p>
</div>