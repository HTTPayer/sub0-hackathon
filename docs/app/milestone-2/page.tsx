import React from "react";
import HackathonBanner from "@/components/HackathonBanner";

export const metadata = {
  title: "Milestone 2",
};

export default function Milestone2Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <header className="mb-8 sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-pink-600 mb-2">
            Spuro x HTTPayer · Sub0 Hackathon
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Milestone 2 Plan – Spuro Agent SDK
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl">
            This page follows the{" "}
            <a
              href="https://hack.sub0.gg/Milestone-2-Plan-Template-28b3e52aeb15802d919ffdfe5d4ca5b4"
              target="_blank"
              rel="noreferrer"
              className="text-pink-600 hover:text-pink-700 underline"
            >
              Sub0 Milestone 2 template
            </a>
            , adapted to the Spuro docs &amp; catalogue demo.
          </p>
        </header>

        <div className="mb-8 sm:mb-10">
          <HackathonBanner />
        </div>

        <section className="space-y-6 sm:space-y-8">
          {/* Objective */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Objective</h2>
            <p className="text-sm sm:text-base text-gray-700">
              Turn <span className="font-semibold">AI-Spuro</span> from a single
              demo agent into the foundation of an{" "}
              <span className="font-semibold">AI SDK for Spuro</span>, so other
              teams can build their own custom agents that use Arkiv-backed
              Spuro memory and HTTPayer/x402 payments. Milestone 2 focuses on a
              reusable TypeScript SDK layer that wraps{" "}
              <span className="font-semibold">Spuro Functions</span> for
              agent-style workflows, with Polkadot integrations as one concrete
              example vertical on top.
            </p>
          </div>

          {/* Deliverables */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">
              Deliverables
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-gray-700">
              <li>
                A packaged{" "}
                <span className="font-semibold">AI-Spuro SDK</span> (built on
                top of the existing Spuro Functions in{" "}
                <code className="font-mono text-[0.7rem]">packages/ts</code>)
                exposing higher-level tasks like{" "}
                <span className="font-semibold">
                  snapshotStashToArkiv, trackValidatorPerformance, and
                  queryStashHistory
                </span>
                .
              </li>
              <li>
                Deeper{" "}
                <span className="font-semibold">Spuro + Arkiv integration</span>{" "}
                patterns for agents: opinionated ways to model long‑lived memory,
                snapshots, and TTL semantics using the existing entity API.
              </li>
              <li>
                One or more{" "}
                <span className="font-semibold">example data sources</span>{" "}
                plugged into the SDK (e.g. the existing Polkadot snapshot
                monitor using PAPI, plus at least one non‑Polkadot source),
                modeled as reusable capabilities that read external state and
                persist it in Arkiv via Spuro.
              </li>
              <li>
                Opinionated{" "}
                <span className="font-semibold">agent blueprints</span> (docs +
                sample code) showing how a new team could plug in their own
                prompts/logic while reusing the AI-Spuro SDK for Spuro-backed
                memory and external data fetches (Polkadot or otherwise).
              </li>
              <li>
                A clearly scoped{" "}
                <span className="font-semibold">demo runbook</span> describing
                how judges can spin up the SDK, connect it to Spuro, and run at
                least two different agents (e.g. Polkadot stash monitor +
                generic snapshotting agent) end-to-end.
              </li>
            </ul>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Timeline</h2>
            <div className="grid gap-4 sm:grid-cols-3 text-sm sm:text-base text-gray-700">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                  Weeks 1–2
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Finalize Spuro backend API surface and OpenAPI docs for the
                    core entity endpoints.
                  </li>
                  <li>
                    Extract the existing Spuro Functions into a dedicated
                    AI-Spuro SDK package with clear typings and examples.
                  </li>
                </ul>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                  Weeks 3–4
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Implement deeper Spuro/Arkiv usage patterns in the SDK
                    (query helpers, pagination, and higher-level memory
                    utilities for agents).
                  </li>
                  <li>
                    Add at least one integration that uses an external data
                    source (including the existing Polkadot PAPI flow) and
                    document how agents should call it via the SDK.
                  </li>
                </ul>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                  Weeks 5–6
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Ship polished docs and code examples that show how to create
                    new agents with the SDK in under an hour.
                  </li>
                  <li>
                    Run end-to-end demo rehearsals and finalize the Milestone 2
                    submission narrative (including video/script).
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">
              Resources
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-gray-700">
              <li>
                <span className="font-semibold">Team</span>: Backend engineer
                (Spuro/Arkiv), infra/payments engineer (HTTPayer/x402), and
                front-end/agent-experience engineer (docs catalogue, SDK DX, and
                examples).
              </li>
              <li>
                <span className="font-semibold">Tooling</span>: FastAPI,
                TypeScript/Node, Next.js 16, Tailwind CSS, Arkiv SDK, HTTPayer
                client, and optional PAPI / other data-provider SDKs.
              </li>
              <li>
                <span className="font-semibold">Environments</span>: Hosted
                Spuro backend with live OpenAPI docs, local dev environment, and
                a public demo deployment for judges.
              </li>
            </ul>
          </div>

          {/* Risks & Mitigation */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">
              Risks &amp; Mitigation
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-gray-700">
              <li>
                <span className="font-semibold">API instability</span>: Changes
                to the Spuro or HTTPayer API late in the hackathon could break
                docs and examples.{" "}
                <span className="font-semibold">Mitigation</span>: freeze
                critical endpoints by the start of Week 2 and maintain a
                versioned OpenAPI schema.
              </li>
              <li>
                <span className="font-semibold">Integration complexity</span>:
                Connecting AI-Spuro, PAPI, Arkiv, and HTTPayer might introduce
                hard-to-debug issues.{" "}
                <span className="font-semibold">Mitigation</span>: keep each
                integration well-isolated, with health-check endpoints and
                minimal, focused examples.
              </li>
              <li>
                <span className="font-semibold">Time constraints</span>:
                Polishing UX and docs may get deprioritized against core
                backend work.{" "}
                <span className="font-semibold">Mitigation</span>: treat the
                docs app as a first-class deliverable with dedicated owner and
                weekly review.
              </li>
            </ul>
          </div>

          {/* Success Criteria */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">
              Success Criteria
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-gray-700">
              <li>
                A judge can follow the Milestone 2 docs to run the Spuro backend,
                AI-Spuro CLI, and at least one end-to-end snapshot flow without
                needing additional explanation.
              </li>
              <li>
                The docs clearly communicate how HTTPayer/x402, Arkiv, and
                Spuro fit together in the architecture, with Polkadot used as
                one concrete example rather than a hard dependency.
              </li>
              <li>
                The Milestone 2 plan on this page matches the final submission
                (features shipped, scope, and positioning).
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}


