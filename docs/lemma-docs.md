# Lemma Documentation

> Source: https://lemma.work/docs  
> Captured: 2026-06-26

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Overview](#overview)
3. [Quickstart / First Pod](#quickstart--first-pod)
4. [How Lemma Works](#how-lemma-works)
5. [Glossary](#glossary)
6. [Concepts](#concepts)
   - [Pod](#pod)
   - [Agent](#agent)
   - [Workflow](#workflow)
   - [Table](#table)
   - [File](#file)
   - [Surface](#surface)
   - [App](#app)
   - [Kit](#kit)
   - [Function](#function)
   - [Schedule](#schedule)
   - [Connector](#connector)
   - [Conversation](#conversation)
   - [Sharing](#sharing)
   - [Access Scope](#access-scope)
   - [Approval](#approval)
   - [Runtime](#runtime)
   - [Variables](#variables)
7. [Platform](#platform)
   - [Pods and Scope](#pods-and-scope)
   - [Resources](#resources)
   - [Data Modeling](#data-modeling)
8. [SDK](#sdk)
   - [Installation](#installation)
   - [Core Client](#core-client)
   - [React Auth and Pod Access](#react-auth-and-pod-access)
   - [Conversations](#conversations-sdk)
   - [Data and Files](#data-and-files)
   - [Workflows and Functions](#workflows-and-functions-sdk)
   - [Registry Blocks](#registry-blocks)
9. [CLI](#cli)
   - [Overview](#cli-overview)
   - [Auth and Context](#auth-and-context)
   - [Pods, Data, and Files](#pods-data-and-files)
   - [Functions and Agents](#functions-and-agents)
   - [Workflows](#workflows-cli)
   - [Apps](#apps-cli)
   - [Connectors](#connectors-cli)
10. [Guides](#guides)
    - [Your First Agent](#your-first-agent)
    - [Inbox to Table Triage Flow](#inbox-to-table-triage-flow)
    - [Slack Integration End-to-End](#slack-integration-end-to-end)
    - [Function vs Agent](#function-vs-agent)
    - [Sharing Safely](#sharing-safely)
    - [Build an App](#build-an-app)
11. [Reference: Command Reference](#reference-command-reference)

---

## Getting Started

Lemma is a platform for building pods — workspace boundaries containing tables, files, agents, workflows, permissions, apps, and surfaces for teams or processes.

### Setup Options

Three deployment paths are available:

**Lemma Cloud** — ideal when you want to start without hosting anything. Provides an account at lemma.work and hosted pods.

**Local Stack** — for those wanting the product running on their own machine. Delivers frontend, API, database, auth, Redis, and document processing in containers.

**Source Checkout** — for contributors, enabling hot-reload backend, frontend, and agentbox from the repository.

### Quick Installation Steps

#### Cloud Setup

```bash
uv tool install lemma-terminal
lemma servers cloud --use
lemma auth login
```

#### Local Setup

```bash
curl -fsSL https://raw.githubusercontent.com/lemma-work/lemma-platform/main/install.sh | bash
uv tool install lemma-terminal
lemma servers select local
lemma auth login
```

#### Developer Setup

For platform contributors, cloning the repository enables development on ports 3710/8710, coexisting with the local stack.

### Essential Next Steps

After setup:

- Create a pod: `lemma pod create my-team --with-starter`
- Install TypeScript SDK: `npm install lemma-sdk`
- Install Python SDK: `uv pip install lemma-sdk`
- Read the Overview and First Pod documentation
- Review CLI and SDK reference sections

---

## Overview

Lemma is described as "an operating-system platform for business teams."

**Tagline:** "Build operating systems for real work."

**Reading path — From model to shipped system:**

1. Scope the pod
2. Model data
3. Wire runtime
4. Ship the app

Key entry points:
- **Conversations** — agent and assistant interaction patterns with instructions and streaming
- **Workflows** — create definitions, deploy triggers, execute runs
- **Build an App** — practical checklist for turning pod resources into an operator workbench

---

## Quickstart / First Pod

### Build Loop

The recommended order for turning a blank workspace into a useful pod:

1. Define the operating job: one team or process, one domain, one primary unit of work.
2. Create the pod and inspect what the starter gave you.
3. Create or refine collaborative tables for shared business records.
4. Add one function only if a write needs validation, coordinated records, or an external operation.
5. Add an agent for one judgment-heavy step, with explicit input and output schemas.
6. Create a workflow only when there is real orchestration: branching, waits, schedules, or handoffs.
7. Build the app last, against verified resources, keeping the first screen focused on real work.

### CLI Rhythm

```bash
lemma pod create support-triage --with-starter --description "Triage and route inbound support work"
lemma pods select support-triage --save-default
lemma pod describe

lemma table create --pod-id <pod-id> --payload-file ./payloads/tickets-table.json
lemma function create --pod-id <pod-id> --payload-file ./payloads/escalate-ticket-function.json
lemma agent create --pod-id <pod-id> --payload-file ./payloads/ticket-triage-agent.json
lemma workflow create --pod-id <pod-id> --payload-file ./payloads/ticket-triage-workflow.json
lemma pod describe <pod-id>
```

> **Do not skip verification.** Before wiring an app or workflow node, run the underlying function, inspect agent output, and verify table records with realistic sample data.

---

## How Lemma Works

> "Work arrives through surfaces. Inside the pod, agents handle judgment, functions handle rules, and workflows chain them with human approvals."

**Pod:** A self-contained workspace for one team or process — its agents, data, flows, and permissions live together.

**Two distinct controls per worker:**
- **Access scope** — what data a worker can touch
- **Sharing settings** — who can view and use the worker

> "The Share button governs people; the Access section governs the worker."

**Interactive components:** Surfaces → Agents → Workflows → Functions → Approvals → Tables → Files → Apps → Conversations → Schedules → Connectors

---

## Glossary

Every Lemma term, defined in one line.

| Term | Definition |
|------|-----------|
| **Pod** | A self-contained workspace for one team or process — its agents, data, flows, and permissions live together. |
| **Agent** | An AI worker with a role, instructions, and scoped access to your tables, files, and apps. |
| **Workflow** | A repeatable process: steps of agents, functions, decisions, and human approvals that run in order. |
| **Table** | Typed business data the pod reads and writes — leads, tickets, tasks — with per-row security. |
| **File** | Documents the pod can search, read, and cite in its answers. |
| **Surface** | A channel where work reaches the pod: Slack, Gmail, WhatsApp, Telegram, Teams, Outlook. |
| **App** | A custom app where your team and the pod's agents work together — built on this pod's data, deployed at its own URL. |
| **Kit** | A whole pod setup compressed into something shareable — install it like a plugin and it builds out apps, agents, tables, workflows, and schedules. |
| **Function** | Deterministic code for steps that shouldn't be AI judgment: validation, math, formatting. |
| **Schedule** | A timer that runs an agent or flow automatically — daily digests, hourly syncs. |
| **Connector** | An authenticated connection to a third-party app that agents and flows can act on. |
| **Conversation** | A thread between you (or a surface) and this pod's agents, with every tool call visible. |
| **Sharing** | Who can see and use a resource: private, pod members, or the whole organization. |
| **Access scope** | The tables, folders, tools, and apps this worker is allowed to read and act on — nothing else. |
| **Approval** | A pause in a flow where a named person decides before work continues. |
| **Runtime** | The model and harness an agent runs on — pick per agent. |
| **Variables** | The typed inputs an agent expects and the structured output it returns — its contract with the rest of the pod. |

---

## Concepts

### Pod

A pod functions as a self-contained workspace designed for a single team or business process, consolidating agents, data, workflows, and access permissions within one unified space.

**In short:** One operating unit of your business: support, hiring, ads reporting.

A "Customer support" pod integrates the triage agent, Tickets table, escalation workflow, and connected support inbox.

#### When to Use Pods

- A team or process requires isolated data, workers, and governance rules
- Different processes should remain data-siloed from one another
- You need to share an entire functional system rather than individual components
- A kit or template requires a dedicated installation environment

#### Best Practices

1. Name pods by process, not team (e.g., "Support triage" not "Acme Inc")
2. Establish one primary work unit (ticket, lead, claim, applicant)
3. Create the initial table for that unit before adding agents
4. Invite only process participants; expand resource sharing selectively

The pod switcher sits at the top of the left sidebar.

---

### Agent

An AI worker with a role, instructions, and scoped access to your tables, files, and apps.

Agents are deployed like team members: you establish their job description through instructions, select an appropriate runtime, and restrict their access to only necessary data and applications. They can operate through chat, scheduled tasks, workflow steps, or surface integrations.

**Example:** A triage agent processes incoming support emails by categorizing issues and creating corresponding entries in a Tickets table.

#### When to Use Agents

- Tasks require judgment (writing, classification, extraction, summarization, decision-making)
- Incoming work is too variable for rigid rules
- Current workflows involve human reading and reasoning rather than checklist-following
- You need conversational assistance with access to pod data

#### Implementation Steps

1. Access Agents from the sidebar and create one focused on a specific task
2. Write clear instructions outlining inputs, expected outputs, and uncertainty handling
3. Set an access scope limiting access to required tables, folders, and apps
4. Test with a real example through chat before deployment

Agents are accessible in the left sidebar, with dedicated tabs for Runs, Edit, and History.

---

### Workflow

A repeatable process: steps of agents, functions, decisions, and human approvals that run in order.

When work has more than one step, put it in a workflow instead of one big agent prompt. Each step does one job, and you can mix AI steps with deterministic functions and human approval gates. Workflows start from a schedule, a webhook, chat, or by hand — and every run is inspectable step by step.

**Example:** New lead arrives → agent enriches it → function scores it → if score is high, a human approves → agent drafts the outreach email.

#### When to Use Workflows

- The work has more than one step and the steps have an order
- Steps mix AI judgment with deterministic rules or human sign-off
- You need to see where each item is and why it stopped
- The same process should run the same way every time it starts

#### Build a Workflow That Earns Its Keep

1. Write the process as a sentence first: "When X arrives, do A, then B, and ask a person before C."
2. Create the tables, agents, and functions the steps will use.
3. Open Workflows, add steps in order, and pick a work type for each.
4. Put an approval before anything with real consequences.
5. Run it once by hand and read the run step by step before scheduling it.

Workflows appear in the left sidebar. The editor has a Steps view (list) and a Flow view (canvas).

---

### Table

Typed business data the pod reads and writes — leads, tickets, tasks — with per-row security.

Tables organize information into columns (typed fields) and rows (individual records). Key feature: granular access control — "an agent can work the Tickets table without ever seeing Payroll."

**Example:** A Leads table containing name, company, source, and status fields. Agents can append new rows while team members manage them through an app interface.

#### When to Use Tables

- Data contains filterable, sortable, or countable fields
- Multiple stakeholders (agents, workflows, people) need concurrent read/write access
- Records progress through defined states (open → in progress → done)
- You're managing data currently stored outside Lemma

#### Getting Started

1. Create a table in Data section with plural naming (tickets, leads, claims)
2. Add typed columns for frequently filtered attributes
3. Include a status column with default values for workflow transitions
4. Grant agent access and observe initial row creation

Tables and their records are accessible via the Data section in the left sidebar.

---

### File

Documents the pod can search, read, and cite in its answers.

"Upload contracts, policies, specs, or exports and they become part of what the pod knows." Files enable agents to ground their responses in actual documentation. Like tables (which store structured data), files handle unstructured content — prose documents that lack fixed fields.

**Example:** Uploading a returns policy PDF allows a support agent to quote the exact policy language when responding to customer inquiries.

#### When to Use Files

- Important knowledge exists in document form (policies, contracts, manuals, transcripts)
- Agents should reference actual sources instead of improvising answers
- Team members attach supporting evidence to work items
- Content is narrative-based rather than record-based

#### Implementation

1. Open Docs and upload documents your team regularly consults
2. Organize files into folders by subject matter
3. Grant relevant folders to agents that require access
4. Test by asking agents questions the documents answer and verify they cite sources

Personal files exist in individual user spaces; pod files are shared across the pod.

---

### Surface

A channel where work reaches the pod: Slack, Gmail, WhatsApp, Telegram, Teams, Outlook.

Without a surface, work only enters Lemma when someone types directly into it. By connecting Slack or Gmail, the pod's agents can pick up messages, triage them, and reply where your team already works. Each surface connects to a specific agent.

**Example:** Connect a support Gmail inbox so the triage agent can label each email and file a row in the Tickets table.

#### When to Use Surfaces

- Work arrives in Slack, email, WhatsApp, or Teams and requires manual copy-pasting
- Customers or teammates should reach the pod without learning new tools
- Approvals should be clickable directly in channels your team monitors
- The pod needs to reply in the conversation's original location

#### Setup Steps

1. Open Surfaces and select the channel receiving incoming work
2. Authenticate the account and designate which agent processes inbound messages
3. Configure routing rules for channels, mentions, and inbox labels
4. Send a test message from the channel to verify it appears in Conversations

Surfaces appear in the left sidebar, with each card displaying the channel, connection status, and routing configuration.

---

### App

A custom app where your team and the pod's agents work together — built on this pod's data, deployed at its own URL.

Apps function as collaborative environments where human team members drive work while AI agents provide support through two methods: background execution via buttons or real-time assistance alongside the user.

**Example:** A support ticketing system where agents automatically generate draft replies when tickets open — team members can send, refine, or request alternative versions.

#### When to Use Apps

- Teams and agents need to operate in the same workspace rather than just accessing data
- Human workers should direct efforts while agents handle drafting, answering, and background tasks
- A recurring daily process would benefit from a dedicated AI-powered interface
- External users require secure, limited access to agent capabilities

#### Implementation Steps

1. Create an app through the Apps section; AI can draft it or build manually
2. Prioritize the primary work elements (records, drafts, decisions) users interact with
3. Position agents within workflows — drafting, summarizing, suggesting
4. Share the URL; access inherits pod sharing rules, keeping configuration hidden from teammates

Apps appear in the left sidebar, each with its own deployed URL.

---

### Kit

A whole pod setup compressed into something shareable — install it like a plugin and it builds out apps, agents, tables, workflows, and schedules.

**Example:** The hiring kit installs four components simultaneously: a candidate table, sourcing agent, review application, and weekly follow-up schedule — all pre-configured to work together.

#### When to Use Kits

- Starting common workflows without designing from scratch
- Learning from existing pod configurations before building independently
- Rapidly establishing structure (apps, agents, tables, schedules) for new pods
- Reusing setups other users have shared

#### Installation Process

1. Review available kits in the sidebar to see bundled components
2. Install into your pod — all components deploy simultaneously and pre-wired
3. Customize each component through renaming, editing, or deletion
4. Test the kit's app or workflow to understand the intended process flow

Kits appear in the left sidebar, with featured options displayed on pod home screens.

---

### Function

Deterministic code for steps that shouldn't be AI judgment: validation, math, formatting.

"Not everything should be left to a model. Functions are plain code the pod runs exactly the same way every time — perfect for scoring, validating, transforming, and calling APIs."

**Example:** A lead-scoring function applies predetermined point rules, ensuring the same prospect receives the same score consistently.

#### When to Use Functions

- **Exact rules:** Scoring systems, validation logic, mathematical calculations, or data formatting
- **Consistency:** The same input must always produce identical output
- **API reliability:** Calls requiring retries and typed inputs without improvisation
- **Structured automation:** When agents repeatedly apply rulebooks or perform arithmetic

#### Implementation Steps

1. Create a function via the Workflows section with a typed input schema
2. Keep the function single-purpose (e.g., score-lead, validate-expense)
3. Test independently with realistic data to verify output structure
4. Integrate as a workflow step or call from agents needing rule application

---

### Schedule

A timer that runs an agent or flow automatically — daily digests, hourly syncs.

Schedules transform the pod from reactive to proactive. Any repetitive request you find yourself making becomes a candidate for automation via schedule.

**Example:** "Every weekday at 8am, the reporting agent posts yesterday's ad spend summary to Slack."

#### When to Use Schedules

- You request the same report, sync, or sweep on a recurring basis
- Work should initiate at a specific time rather than in response to a message
- A flow requires nightly, hourly, or weekly execution

#### Setup Steps

1. Open Schedules and create a new one by selecting an agent or workflow
2. Define the timing using either a preset cadence or custom cron expression
3. Optionally add a condition to skip runs when unnecessary
4. Verify the pod home displays the next scheduled run under Upcoming

Schedules appear in the left sidebar, with upcoming executions also visible on the pod home.

---

### Connector

An authenticated connection to a third-party app that agents and flows can act on.

Connectors are the pod's hands: connect Salesforce, GitHub, or Notion once, and agents can read and act on them — within the operations you allow. Surfaces bring work in; connectors let the pod act out in your other tools.

**Example:** Connect Salesforce and the sales agent updates opportunity stages instead of just telling you to.

#### When to Use Connectors

- Agents or flows should act in Salesforce, GitHub, Notion, Gmail — not just talk about them
- The pod needs to read state that lives in another product
- A workflow step ends with "…and then update it in the other system"

#### Setup Steps

1. Open Connectors and connect the app with the account that should act
2. Decide the account mode: each user acts as themselves, or one fixed service account
3. Grant the connector to the specific agents and functions that need it
4. Test one real operation from a conversation before trusting it in a flow

Connectors in the left sidebar; connected accounts are workspace-wide.

---

### Conversation

A thread between you (or a surface) and a pod's agents, with every tool call visible.

Every interaction with an agent — from chat, Slack, email, or the API — becomes a conversation you can open and audit. The system records not just agent responses, but all actions taken: table writes, file searches, and connector calls.

**Example:** Open yesterday's triage conversation to see exactly why the agent escalated ticket #482.

#### When to Use Conversations

- You want to ask the pod for something in plain language
- You need to audit what an agent actually did and why
- Work arrived from a surface and you want the full thread

#### Read a Conversation Like an Audit Log

1. Open any conversation from the sidebar history or the Conversations list
2. Expand the tool calls — every table write, file search, and app action is recorded
3. Use this view when an agent surprises you: the reasoning trail is the debugging tool

The chat on pod home starts conversations; history lives in the left sidebar.

---

### Sharing

Who can see and use a resource: private, pod members, or the whole organization.

"Every resource — agent, table, app, file — carries its own visibility." This is separate from what those resources themselves are permitted to access.

#### Visibility Levels

| Level | Audience | Purpose |
|-------|----------|---------|
| Private | You only | Work-in-progress and confidential data |
| Pod | Team members | Active operational resources |
| Organization | All employees | Finished applications and reference materials |

#### How to Share

1. Open the desired resource and locate the Share button
2. Select the appropriate visibility tier: private, pod, or organization
3. Remember: sharing controls people's access; agent permissions use separate access scope settings

---

### Access Scope

The tables, folders, tools, and apps a worker is allowed to read and act on — nothing else.

Workers operate under restricted permissions rather than blanket access. This operates independently from sharing settings (which govern who can view or modify the worker itself).

**Example:** A triage agent might have read access to a support folder and write permissions for a Tickets table, while remaining completely unaware of payroll systems.

#### When to Apply Access Scopes

- Creating an agent and determining appropriate permissions
- An agent should access specific tables while being restricted from others
- A function requires access to exactly one external app operation

#### Implementation Steps

1. Open the Access section within the agent editor and select Manage
2. Grant specific tables, folders, tools, and apps starting with minimal permissions
3. Periodically review scope assignments when agent responsibilities evolve

---

### Approval

A pause in a flow where a named person decides before work continues.

Approvals serve as human gates for high-stakes actions — financial transactions, customer communications, or data deletion.

#### When to Use Approvals

When a flow step sends money, emails a customer, or deletes records.

#### How It Works

1. Add an approval step in the workflow editor where the consequential action occurs
2. Route approval to a specific person or role
3. Decisions are made directly through the app or connected platforms like Slack with one click

"Approvals arrive in the app and on connected surfaces like Slack — deciding is one click."

---

### Runtime

The model and harness an agent runs on — pick per agent.

Different jobs want different brains. A heavyweight model for judgment-heavy work, a fast one for high-volume triage. Runtime is set per agent, so one pod can mix both.

**Example:** The contract-review agent runs the strongest model; the email-labeling agent runs the fast one.

#### Implementation

1. In the agent editor, open the Model section
2. Leave the pod default for most agents; pin a runtime when the job clearly wants speed or depth
3. Revisit after watching real runs — the run history shows where quality or latency hurts

---

### Variables

The typed inputs an agent expects and the structured output it returns — its contract with the rest of the pod.

Variables transform an agent from unstructured conversation into a reusable component. By declaring expected inputs and defining output structure, workflows, apps, and other agents can call it predictably.

**Example:** A scoring agent accepting `{ company, employees }` and returning `{ score, reason }` allows workflows to branch on the score value without parsing narrative text.

#### When to Use Variables

- Downstream components (workflows, apps, other agents) require field-level access to agent output
- The agent should consistently accept and return the same data shape
- A workflow must branch based on agent-produced values
- Integrating an agent into a process flow rather than interactive conversation

#### Implementation Steps

1. Open the Variables section in the agent editor and select Edit
2. Define required inputs with names and types
3. Specify output fields for downstream consumption
4. Execute once and verify output matches your schema

---

## Platform

### Pods and Scope

**Definition:** "A pod is the technical and operational boundary for one team or process. It contains the tables, files, agents, workflows, functions, permissions, apps, and surfaces that make that work one system."

#### Operating Job Foundation

Pods should be organized around the actual work being performed: "triage support, qualify leads, review expenses, onboard teammates, track launch items, or run a back-office loop."

#### Characteristics of Good Pod Scope

- Single team or operating domain
- One primary unit of work (ticket, lead, claim, expense, applicant, or launch item)
- Unified data model for the domain
- Multiple user surfaces only when serving materially different personas within the same operating loop

#### Anti-Patterns to Avoid

- Combining unrelated business domains (hiring, support, finance, sales) in one pod
- Building mirror membership tables instead of using built-in organization and pod membership APIs
- Beginning design with an app layout before identifying the core work object

---

### Resources

| Resource | Owns | Avoid Using It For |
|----------|------|-------------------|
| Table | Durable structured state | Unstructured documents or binary assets |
| Record API | Simple table CRUD | Multi-table writes with business rules |
| File | Documents and attachments | State needing filtering, sorting, or workflow transitions |
| Function | Typed deterministic logic | Single-row inserts with no business logic |
| Agent | Judgment-heavy reasoning | Deterministic writes or hidden side effects |
| Workflow | Orchestration over time | One-shot actions with no real process |
| Conversation | Interactive or agent-scoped message flow | Durable business data |
| App | Repeatable operator workflow | Static marketing or dashboard posters |
| Connector | External system access | Pod-local business state |

> **Build order for real pods:** provision connectors, functions, workflows, and apps in that order. Applications should be designed early but integrated last against verified upstream resources.

---

### Data Modeling

#### Table Rules

- **Use tables for:** typed fields, filtering, sorting, structured updates, and workflow state
- **Collaborative tables:** store shared work such as tickets, leads, approvals, claims, and expenses
- **Personal RLS tables:** appropriate only when individual callers need visibility into their own rows exclusively
- **System fields** — `created_at`, `updated_at`, and system-managed `user_id` should never be included in record payloads
- **Ownership fields** — use `owner_user_id`, `assignee_user_id`, `creator_user_id`, or `reporter_user_id` to denote explicit business ownership

#### File Rules

- **Use files for:** contracts, manuals, reports, workflows, screenshots, transcripts, and attachments
- File uploads do not automatically inject text content into agents or workflows
- Store stable paths or identifiers, grant folder access, and have the runtime explicitly fetch or search files
- Search indexing occurs asynchronously — verify functionality after uploading before depending on it

#### Example: Creating a Collaborative Table

```bash
lemma table create --pod-id <pod-id> --payload '{
  "name": "tickets",
  "enable_rls": false,
  "columns": [
    {"name": "title", "type": "TEXT", "required": true},
    {"name": "status", "type": "TEXT", "required": true, "default": "OPEN"},
    {"name": "assignee_user_id", "type": "UUID"}
  ]
}'
```

---

## SDK

### Installation

```bash
npm install lemma-sdk
```

#### Create a Client

The SDK automatically resolves API and authentication URLs from explicit overrides, window configuration, or environment variables.

```typescript
import { LemmaClient } from "lemma-sdk";

const client = new LemmaClient({
  apiUrl: import.meta.env.VITE_LEMMA_API_URL,
  authUrl: import.meta.env.VITE_LEMMA_AUTH_URL,
  podId: import.meta.env.VITE_LEMMA_POD_ID,
});

await client.initialize();
```

#### Environment Variable Names

| Runtime | Supported names |
|---------|-----------------|
| Vite | `VITE_LEMMA_API_URL`, `VITE_LEMMA_AUTH_URL`, `VITE_LEMMA_POD_ID` |
| CRA / webpack | `REACT_APP_LEMMA_API_URL`, `REACT_APP_LEMMA_AUTH_URL`, `REACT_APP_LEMMA_POD_ID` |
| Node | `LEMMA_API_URL`, `LEMMA_AUTH_URL`, `LEMMA_POD_ID` |
| Browser | `window.__LEMMA_CONFIG__` |

#### Optional Registry Setup

```bash
npx lemma-sdk init-shadcn
npx shadcn@latest add @lemma/lemma-records-view
npx shadcn@latest add @lemma/lemma-assistant-experience
```

---

### Core Client

#### Namespaces

The `LemmaClient` exposes different namespaces organized by scope:

**Pod-scoped:** `tables`, `records`, `files`, `functions`, `agents`, `conversations`, `workflows`, `apps`, `resources`, `schedules`, `datastore`

**Org and user:** `users`, `organizations`, `pods`, `podMembers`, `podJoinRequests`, `podSurfaces`, `icons`

**External systems:** `connectors`

#### Switching Pod Scope

```typescript
const rootClient = new LemmaClient({ apiUrl, authUrl });
const podClient = rootClient.withPod("<pod-id>");

const tables = await podClient.tables.list();
const currentUser = await podClient.users.current();
```

#### Escape Hatch

`client.request<T>(method, path, options)` provides direct access to underlying endpoints when no typed namespace wrapper has landed yet.

---

### React Auth and Pod Access

#### AuthGuard Component

Wraps your app and handles authentication state and pod access automatically.

```tsx
import { AuthGuard } from "lemma-sdk/react";

export function App({ client }: { client: LemmaClient }) {
  return (
    <AuthGuard client={client} appName="Support Triage">
      <SupportTriageApp client={client} />
    </AuthGuard>
  );
}
```

Handles: authentication verification, pod membership validation, sign-in fallback UI, access request interface for non-members, and custom fallback options.

#### usePodAccess Hook

For custom access control UI:

```tsx
const access = usePodAccess({ client });

if (access.status === "missing") {
  return <button onClick={() => void access.requestAccess()}>Request access</button>;
}

return <span>{access.member?.roles?.join(", ") ?? "No pod role"}</span>;
```

---

### Conversations (SDK)

#### Key Patterns

Create conversations before sending messages (rather than using create-if-missing helpers).

Standard workflow:
1. Create a conversation for an agent with configuration details (title, instructions, metadata, conversation type)
2. Send messages using the returned conversation ID

#### Surface Selection Guide

| Use Case | Hook |
|----------|------|
| Browse past interactions | `useConversations` |
| Load a single conversation | `useConversation` |
| Streaming and final responses | `useConversationMessages` |
| Complete UI behavior | `useAssistantController` / `useAssistantRuntime` |
| Examine agent specifications | `useAgentInputSchema` |

---

### Data and Files

#### Data Hooks

| Job | Hook |
|-----|------|
| List records | `useRecords` |
| Fetch one record | `useRecord` |
| Create/update/delete | `useCreateRecord`, `useUpdateRecord`, `useDeleteRecord` |
| Schema-driven forms | `useRecordForm`, `useRecordSchema`, `useForeignKeyOptions` |
| Joins and related records | `useJoinedRecords`, `useRelatedRecords`, `useReverseRelatedRecords` |
| Custom SQL reads and aggregates | `useDatastoreQuery`, `useRecordAggregates` |

#### File Hooks

| Job | Hook |
|-----|------|
| Browse folder | `useFiles` |
| Upload | `useUploadFile` |
| Rename or move | `useUpdateFile` |
| Delete | `useDeleteFile` |
| Create folder | `useCreateFolder` |
| Search files | `useFileSearch` |
| Directory tree | `useFileTree` |
| Preview content | `useFilePreview` |
| Search records and files together | `useGlobalSearch` |

#### Function-Backed Record Form

```typescript
const form = useRecordForm({
  client,
  tableName: "issues",
  mode: "create",
  submitVia: "function",
  submitFunctionName: "create-issue",
  submitFunctionInput: (payload) => ({
    title: payload.title,
    priority: payload.priority,
  }),
});
```

---

### Workflows and Functions (SDK)

Enables starting workflows, polling runs, resuming human waits, and calling deterministic functions from app surfaces.

#### Workflow Hooks

| Hook | Purpose |
|------|---------|
| `useWorkflowStart` | Initiate a run with schema support |
| `useWorkflowRun` | Start or monitor a single known workflow |
| `useWorkflowRuns` | Retrieve list of runs |
| `useWorkflowRunWaitAssignments` | Display waits assigned to current pod member |
| `useWorkflowResume` | Resume an interrupted run |
| `useFlowSession`, `useFlowRunHistory` | Legacy flow naming options |

---

### Registry Blocks

Optional UI components on top of the headless SDK.

```bash
npx lemma-sdk init-shadcn
```

#### Available Components

**Records Management**
- `lemma-records-view`
- `lemma-detail-panel`
- `lemma-record-form`
- `lemma-status-flow`

**Search and Files**
- `lemma-global-search`
- `lemma-file-browser`
- `lemma-document-workspace`
- `lemma-markdown-editor`
- `lemma-page-tree`

**Collaboration**
- `lemma-comments`
- `lemma-activity-feed`
- `lemma-insights`
- `lemma-action-surface`

**Workflow and Shell**
- `lemma-workflow-runner`
- `lemma-members`
- `lemma-notification-bell`
- `lemma-user-menu`

**Agent Experience**
- `lemma-assistant-experience`

> Registry blocks work best when aligned with operator workflows. For specialized use cases involving review, triage, approval, or queue management, build custom solutions locally using hooks.

---

## CLI

### CLI Overview

The Lemma CLI manages organizations, pods, resources, runs, conversations, connectors, and app bundles.

```bash
lemma --base-url https://api.lemma.work --auth-url https://lemma.work/auth --output json <command>
```

#### Top-Level Command Groups

| Group | Purpose |
|-------|---------|
| `auth`, `config`, `ls` | Authentication, local config, org/pod tree snapshot |
| `organization`, `pod` | Workspace and pod lifecycle |
| `table`, `record`, `query`, `file` | Data and file management |
| `function`, `agent`, `task`, `assistant`, `conversation` | AI and deterministic runtime resources |
| `workflow` | Workflow definitions, installs, and runs |
| `app` | App metadata, clone, and deploy |
| `connector` | Connectors, operations, triggers, and connected accounts |
| `operation`, `web`, `tool` | OpenAPI inspection, web tools, and agent tooling |

#### Payload Habits

- Use `--payload-file` for larger JSON to avoid shell escaping drift
- Use `--output json` when saving artifacts or piping results
- Use `pod describe` before changing a live pod so you know what exists
- Use flat command names such as `workflow graph-update` and `workflow run-start`

---

### Auth and Context

```bash
lemma auth --help
lemma config --help
lemma ls
```

#### Connection Options

| Option | Purpose |
|--------|---------|
| `--base-url` | Specifies the backend API endpoint |
| `--auth-url` | Provides the authentication frontend URL for browser-based login |
| `--token` | Supplies bearer token (reads from `LEMMA_TOKEN` env var or config file) |
| `--config-file` | Points to alternate configuration file (defaults to `~/.lemma/config.json`) |
| `--no-verify-ssl` | Disables SSL verification for local dev with self-signed certificates |
| `--output json` | Returns machine-readable JSON output suitable for scripts |

> When working with local backends, SSL or proxy errors involving `https://api.localhost` may occur. Try explicit `127.0.0.1` addresses before assuming a CLI command malfunction.

---

### Pods, Data, and Files

#### Pod Commands

- **Lifecycle:** `pod list/create/get/update/delete`
- **Configuration:** `pod config` — fetch runtime settings
- **Inspection:** `pod describe` — snapshot of agents, assistants, functions, tables, workflows, and file roots
- **Members:** `pod member-list/member-add/member-update-role/member-remove`
- **Import/Export:** `pod export/import` — resource folder trees

#### Data Operations

```bash
lemma table list --pod-id <pod-id>
lemma table describe tickets --pod-id <pod-id>
lemma record list tickets --pod-id <pod-id>
lemma query execute --pod-id <pod-id> "SELECT * FROM tickets LIMIT 20"
lemma file list / --pod-id <pod-id>
lemma file search onboarding --pod-id <pod-id> --scope-path /manuals --scope-mode SUBTREE
```

> **System fields:** Do not manually write to `user_id`, `created_at`, or `updated_at`. For shared ownership, use pod member APIs and explicit business-level fields.

---

### Functions and Agents

#### Function Lifecycle

```bash
lemma function create --pod-id <pod-id> --payload-file ./payloads/expense-function.json
lemma function list --pod-id <pod-id>
lemma function get validate-expense --pod-id <pod-id>
lemma function run validate-expense --pod-id <pod-id> --payload '{"merchant":"Acme","amount":120}'
lemma function run-list validate-expense --pod-id <pod-id>
```

#### Agent Lifecycle

```bash
lemma agent create --pod-id <pod-id> --payload-file ./payloads/triage-agent.json
lemma agent list --pod-id <pod-id>
lemma agent get triage-agent --pod-id <pod-id>
lemma task create triage-agent --pod-id <pod-id> --payload '{"input":{"email":"..."}}'
lemma task get triage-agent <task-id> --pod-id <pod-id>
```

#### Runtime Selection Guide

| Use Case | Recommended Runtime |
|----------|-------------------|
| Typed validation and writes | Function |
| External operations with retries | Function + connectors |
| Research and analysis tasks | Agent |
| Background execution | Task or workflow |
| Interactive chat | Conversation/assistant |

---

### Workflows (CLI)

#### Workflow Build Order

1. Design the SOP
2. Create tables, functions, and agents first
3. Run each function standalone and save the response shape
4. Create the workflow shell
5. Upload the graph with real `function_name` and `agent_name` values
6. Install the workflow if start type is scheduled, event, or datastore event
7. Run a realistic test and inspect run output

#### Commands

```bash
lemma workflow create --pod-id <pod-id> --payload-file ./payloads/workflow-create.json
lemma workflow graph-update expense-review --pod-id <pod-id> --payload-file ./payloads/workflow-graph.json
lemma workflow get expense-review --pod-id <pod-id>

lemma workflow install-create expense-review --pod-id <pod-id> --schedule-type CRON --cron-expression '*/5 * * * *' --timezone UTC
lemma workflow run-start expense-review --pod-id <pod-id> --payload '{"input":{"expense_id":"exp_123"}}'
lemma workflow run-get expense-review <run-id> --pod-id <pod-id>
lemma workflow run-resume expense-review <run-id> --pod-id <pod-id> --payload-file ./payloads/resume.json
```

> **Manual workflow threshold:** "A manual workflow should usually have at least two substantive stages after intake, or a clear need for branching, waiting, looping, approval handoffs, or resumability."

---

### Apps (CLI)

#### App Rules

- An app is a workbench, not a landing page
- The first visible screen should start with work
- One active work object should usually anchor the interface
- Actions should sit close to the object they affect
- Preserve scaffolded routing and shell unless the workflow truly needs a change

#### CLI Lifecycle

```bash
lemma app list --pod-id <pod-id>
lemma app get support-triage --pod-id <pod-id>
lemma app clone support-triage --pod-id <pod-id> ./support-triage-app
cd ./support-triage-app
npm install
npm run build
lemma app deploy support-triage --pod-id <pod-id> --source-dir .
```

#### Scaffold a Vite App

```bash
lemma apps init support-triage \
  --pod <pod-id> \
  --title "Support Triage" \
  --nav sidebar \
  --style soft \
  --template /path/to/lemma-template-vite
```

---

### Connectors (CLI)

#### Connector Lifecycle

1. List or inspect the app
2. Discover relevant operations or triggers
3. Fetch live operation details before writing payloads
4. Create a connect request if no account exists
5. Execute a realistic smoke test and save the response artifact
6. Grant DYNAMIC or FIXED access to the workload
7. Wire functions, workflows, assistants, or apps only after completing the above steps

#### Commands

```bash
lemma connector list --limit 100
lemma connector operation-discover gmail --query "send an email"
lemma connector operation-details gmail messages_send
lemma connector account list gmail
lemma connector operation-execute gmail messages_send \
  --account-id <account-id> \
  --payload-file ./payloads/messages-send.json
```

#### Access Modes

| Mode | Meaning |
|------|---------|
| `DYNAMIC` | The runtime acts through the current caller's connected account |
| `FIXED` | The workload always uses a designated shared or service account |

---

## Guides

### Your First Agent

#### Core Principle

"The most common failed first agent is a general assistant with access to everything and a vague brief." Instead: narrow scope — one specific task, one table, examples you can manually verify.

#### Six-Step Process

1. **Define the task** — Select a repetitive, judgment-based workflow (e.g., categorizing incoming requests). Document three real examples with desired outputs.

2. **Create the data structure** — Build a table with necessary columns (title, category, priority, status with OPEN as default).

3. **Build the agent** — Write clear instructions describing what arrives, what should be produced, and how to handle uncertainty. Include a real example in the instructions.

4. **Restrict permissions** — Grant only write access to the specific table. Avoid expanding permissions unnecessarily.

5. **Test with examples** — Run the agent on your second example and inspect the created records in the conversation tool calls.

6. **Validate and deploy** — Verify the third example; if successful, integrate with surfaces or workflows. Otherwise, refine instructions rather than expanding access.

#### Success Metric

Team members cannot distinguish between records created by the agent versus human operators.

#### Common Issues

| Issue | Remedy |
|-------|--------|
| Vague labeling | Add more specific examples to instructions |
| Schema mismatches | Check column names and types in table definition |
| Format inconsistencies | Specify exact output format in instructions |
| Overconfident mistakes on edge cases | Add explicit uncertainty handling to instructions |

---

### Inbox to Table Triage Flow

#### The Shape of Triage

Five consistent steps: arrival, classification, scoring, filing, human exception handling.

In Lemma: **surface → agent → function → table → approval**

#### Build It

1. **Prepare components** — Set up a tickets table, create a triage agent, optionally develop a scoring function for exact priority rules.

2. **Create the workflow** — Open Workflows and establish a new one, beginning with the triage agent.

3. **Add scoring logic** — Include a function if priority rules are deterministic ("enterprise customers are always P1"); otherwise let agent judgment suffice.

4. **Implement branching** — Add a decision node that routes P1 items separately from other tickets.

5. **Configure routing** — Direct P1 cases to an approval step assigned to on-call; route other items to file the record and conclude.

6. **Test thoroughly** — Execute manual runs with realistic data and review each step's results before connecting the actual inbox trigger.

> **Start the surface last.** "Wire the inbox trigger only after manual runs look right." Testing with real production data after configuration is complete prevents widespread misfiling.

---

### Slack Integration End-to-End

#### Setup Process

1. **Enable Slack Surface** — Navigate to Surfaces and activate Slack using a workspace account with appropriate channel permissions.

2. **Designate an Agent** — Assign a single agent per surface to maintain consistent behavior.

3. **Configure Routing Rules** — Specify which channels the pod monitors and whether it responds to all messages or only mentions.

4. **Test with a Mention** — Tag the bot with a genuine request. The response appears in-channel; review the full thread with tool calls in Lemma's Conversations section.

5. **Enable Approvals** — When workflows include approval steps, connected Slack users receive approval messages directly in the channel.

#### Key Routing Strategies

- Reserve mention-only mode for collaborative spaces; use every-message routing exclusively in dedicated channels (support inboxes)
- Keep high-volume intake channels separate from collaboration spaces
- Equip agents with necessary knowledge resources (policy folders) to answer accurately

#### Surfaces vs Connectors

| Slack as Surface | Slack as Connector |
|------------------|--------------------|
| Incoming work reaches the pod | Agents can act on Slack (post messages, access channel history) |

Most deployments leverage both.

---

### Function vs Agent

#### The Core Decision Framework

> "Could two careful colleagues disagree about the right output? If yes, it is judgment — use an agent. If no — if there is one correct answer a rulebook produces — it is rules, and rules belong in a function."

#### Practical Examples

| Task | Type | Rationale |
|------|------|-----------|
| Summarize support threads | Agent | No universally correct summary |
| Score leads by employee count/region | Function | Exact, deterministic rules |
| Determine if email is complaint | Agent | Requires language interpretation |
| Validate expenses against policy | Function | Binary yes/no based on limits |
| Draft rejection messages | Agent | Tone and context vary |
| Convert currency | Function | Mathematical precision |

#### The Recommended Hybrid Approach

**Agent sandwich:** an agent interprets the messy input → a function applies the exact rules to the agent's structured output → another agent drafts the human-facing result.

> **Warning sign:** "If you find yourself writing agent instructions full of thresholds, point values, and if-then rules, stop — that paragraph wants to be a function. Agents drift; functions don't."

---

### Sharing Safely

#### Two Distinct Systems

| System | Controls |
|--------|---------|
| Sharing | Who can access a resource (private, pod, organization) |
| Access scopes | Which tables, folders, tools, and apps an agent can interact with |

"A pod-visible agent can still be scoped to a single table, and a private table can be granted to widely-used agents — these are independent controls."

#### Recommended Setup

1. Maintain resource-level privacy during development
2. Grant agents minimal necessary permissions based on their function
3. Restrict genuinely sensitive data (payroll, legal documents) to private visibility
4. Share completed applications organization-wide when appropriate (apps display data through their own queries)
5. Perform regular audits to remove unnecessary agent permissions

#### Additional Safeguards

Implement approval workflows for significant operations like refunds, communications, or deletions — requiring explicit authorization for each instance rather than relying solely on standing permissions.

---

### Build an App

#### App Build Checklist

1. **Define the operator moment** — Who will use it, their emotional context, what must be immediately clear, and success criteria.

2. **Name the work unit** — Identify the core work object and document its state transitions.

3. **Select scaffold shell** — Choose between sidebar, topbar, or single-page layouts based on workflow needs.

4. **Rename routes** — Replace placeholder routes with actual work routes that reflect real tasks.

5. **Wire components with SDK** — Connect lists, detail panels, forms, workflow buttons, and assistant context using SDK hooks.

6. **Apply registry blocks strategically** — Use registry blocks only where they align with the work object being managed.

7. **Test with realistic data** — Run the app using seeded records that represent actual usage scenarios.

8. **Deploy after core usability** — Release only once the main work loop functions without placeholder UI elements.

#### What Good Feels Like

> "The operator opens the app and immediately knows what needs attention, why it matters, and what action is safe to take next."

---

## Reference: Command Reference

A concise overview of all CLI command groups.

| Command | Subcommands |
|---------|------------|
| `pod` | `list`, `create`, `get`, `update`, `delete`, `config`, `describe`, `member-list`, `member-add`, `member-update-role`, `member-remove`, `export`, `import` |
| `table` | `list`, `create`, `get`, `update`, `delete`, `describe`, `column-add`, `column-remove` |
| `file` | `list`, `ls`, `describe`, `upload`, `download`, `search`, `get`, `update`, `delete`, `folder-create` |
| `function` | `list`, `get`, `create`, `update`, `delete`, `run`, `run-list`, `run-get` |
| `agent` | `list`, `get`, `create`, `update`, `delete` |
| `workflow` | `list`, `get`, `create`, `graph-update`, `update`, `delete`, `install-create`, `install-list`, `install-delete`, `run-start`, `run-get`, `run-list`, `run-resume` |
| `app` | `list`, `get`, `create`, `update`, `delete`, `deploy`, `clone` |
| `conversation` | `list`, `create`, `get`, `message-send`, `message-list` |
| `connector` | `list`, `get`, `operation-discover`, `operation-details`, `operation-execute`, `trigger list/get`, `account list`, `connect-request create` |
