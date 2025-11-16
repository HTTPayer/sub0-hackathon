# Submission Checklist

## POLKADOT MAIN TRACK CHECKLIST

Use this checklist to ensure you've submitted everything required. **Incomplete submissions will be disqualified.**

### **Core Submission Materials**

- [ ] 2-3 minute pitch video (uploaded and link provided)

  - Walkthrough of what you built + your pitch
  - Include: problem, solution, demo, market context, Milestone 2 overview
  - Show: running AI-Spuro, reading + writing snapshots via Spuro, and TTL expiry in action
  - Upload to any platform (e.g., YouTube, Loom) and share the link

- [ ] Pitch deck (URL)

  - Problem & solution
  - Market research & competitive analysis
  - Technical approach (Spuro backend, Spuro Docs frontend, AI-Spuro CLI)
  - Milestone 2 plan summary

- [ ] Public GitHub repository
  - Open source license
  - `MILESTONE-2-PLAN.md` using [Milestone 2 Plan Template](https://www.notion.so/Milestone-2-Plan-Template-28b3e52aeb15802d919ffdfe5d4ca5b4?pvs=21)
  - `README.md`: including setup instructions, link to demo URL (if applicable), link to pitch video, team member names + roles, link to pitch deck

### Bonus Material (to be Included in `README.md`)

- [ ] Demo video showing prototype/concept (separate from pitch video)

  - Demonstrate: running the agent, reading + writing snapshots via Spuro, and TTL expiry in action

- [ ] User feedback or validation evidence (e.g. surveys, results from mini marketing campaign)

- [ ] Marketing material or plan (e.g. social media links, online engagement with product)

---

### 🚀 SHIP-A-TON TECH REQUIREMENTS

- [ ] Working code deployed to Polkadot testnet (e.g Paseo or Passet Hub) OR working Substrate blockchain

  - AI-Spuro CLI connecting to Polkadot via PAPI
  - Spuro backend API functional
  - Spuro Docs frontend (can be mocked / locally deployed)

- [ ] Functional prototype demonstrating core features

  - AI-Spuro agent can query Polkadot stash accounts
  - Spuro API can store/retrieve snapshots with TTL
  - HTTPayer handles x402 payments seamlessly
  - Docs frontend explains the Arkiv-backed memory capability (Polkadot data is fetched externally via PAPI)

- [ ] Clear instructions for judges to test functionality

  - Setup instructions for Spuro backend
  - Setup instructions for AI-Spuro CLI
  - How to open the Spuro Docs frontend
  - How to run the agent and verify it works

- [ ] Demo URL (if deployed) - nice to have

**Note:** Your project demonstrates agent-native infrastructure where agents purchase infrastructure via x402 payments.

---

## ARKIV MAIN TRACK CHECKLIST

### Your submission must include the following deliverables:

- [ ] Public live demo link

  - Spuro backend API endpoint
  - Spuro Docs frontend (can be mocked / locally deployed)

- [ ] Public repo with `README.md`: what it does, how to run it, how Arkiv is used

  - Document how Arkiv SDK is wrapped in the Spuro backend
  - Explain TTL-based snapshot storage
  - Show how the AI-Spuro agent uses Arkiv via x402 API

- [ ] 2-3 minute demo video
  - Show Arkiv integration: storing and retrieving Polkadot account snapshots
  - Demonstrate TTL expiry behavior
  - Show how agents pay for Arkiv storage via Spuro + HTTPayer

---

## More TODOs

### Integration & Testing

- [ ] End-to-end test: agent queries Polkadot → stores in Arkiv → reads back
- [ ] Test TTL expiry behavior
- [ ] Test x402 payment flow with HTTPayer
- [ ] Test end-to-end Spuro payment flow (no separate marketplace UI)
- [ ] Verify error handling across all components

### Documentation

- [ ] Complete README.md with setup instructions
- [ ] Add architecture diagram
- [ ] Document API endpoints (Spuro)
- [ ] Document CLI usage (AI-Spuro)
- [ ] Create MILESTONE-2-PLAN.md
- [ ] Add team member names + roles to README

---

## References

- [Milestone 2 Plan Template](https://www.notion.so/Milestone-2-Plan-Template-28b3e52aeb15802d919ffdfe5d4ca5b4?pvs=21)
- [IDEA-T-ON TECHNICAL PLAN CHECKLIST](https://www.notion.so/IDEA-T-ON-TECHNICAL-PLAN-CHECKLIST-2a43e52aeb1580558beddf44eed73e73?pvs=21)
- [Polkadot Developer Docs - PAPI](https://docs.polkadot.com/develop/toolkit/api-libraries/papi/)
