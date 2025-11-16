# Arkiv Developer Experience Feedback  

## What Worked

### **Familiar EVM Foundation**
- The Python SDK is built on top of `web3.py`, which immediately reduces the onboarding curve.
- Our existing knowledge of ABI calls, contract methods, and event logs transfers nicely.
- Ability to use standard signing flows, providers, and middleware makes the whole process feel like extending existing tooling rather than learning a new ecosystem.

### **Accessible Faucet + Example Code**
- The faucet flow was instant and funding a dev wallet took seconds.
- Example scripts for reading/writing entities made it possible to get a full round-trip working within minutes.
- Good defaults in the example code helped reduce trial and error.

---

## Friction Points

### **Lack of Comprehensive SDK Reference Documentation**
- While helper methods exist, there is no dedicated API reference that outlines all functions, params, expected types, or return values.
- Had to rely heavily on example scripts, and then dive into source code to confirm assumptions about argument shape and behavior.
- A proper SDK reference on PyPI or docs.arkiv would reduce guesswork significantly, especially for advanced or dynamic use cases.

### **Limited Advanced Examples**
Examples cover the basics, but I had to piece together more advanced flows:
- multi-entity batch operations  
- integrating custom metadata schemas  
- entity transfer flows in multi-user systems  
- best practices for indexing / caching  

---

## Opportunities for Improvement

### **1. Full SDK Documentation Page**
A single reference that includes:
- function signatures  
- param and return types  
- exceptions / error reference  
- code samples per method  
Would dramatically cut down onboarding time.

### **2. PyPI Documentation Expansion**
- Add a “Full Reference” tab  
- Link to entity schema examples  
- Include code snippets for common patterns  
- Version changelog + upgrade guide  


