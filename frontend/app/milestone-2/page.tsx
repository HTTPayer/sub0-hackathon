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
            Milestone 2 Plan: Spuro – Arkiv-backed Agent SDK
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

        {/* Milestone 2 template sections */}
        <section className="space-y-6 sm:space-y-8">
          {/* WHERE WE ARE NOW */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">
              📍 Where we are now
            </h2>
            <div className="space-y-5 text-sm sm:text-base text-gray-700">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  What we built/validated this weekend
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <span className="font-semibold">Spuro backend</span>:
                    FastAPI service wrapping Arkiv with x402/HTTPayer, exposing
                    paid entity endpoints.
                  </li>
                  <li>
                    <span className="font-semibold">Spuro Functions SDK</span>{" "}
                    in{" "}
                    <code className="font-mono text-[0.7rem]">packages/ts</code>
                    , providing typed helpers like{" "}
                    <code className="font-mono text-[0.7rem]">
                      createEntity
                    </code>{" "}
                    and{" "}
                    <code className="font-mono text-[0.7rem]">
                      queryEntities
                    </code>
                    .
                  </li>
                  <li>
                    <span className="font-semibold">AI-Spuro demo agent</span>{" "}
                    that snapshots Polkadot stash accounts via PAPI and persists
                    them to Arkiv through Spuro.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  What&apos;s working
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    End-to-end flow from external data source → AI-Spuro agent →
                    Spuro → Arkiv, with x402 handling payments at the HTTP
                    layer.
                  </li>
                  <li>
                    Docs &amp; catalogue UI that explains the core Spuro
                    endpoints and the Spuro Functions used by AI-Spuro.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  What still needs work
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Turning AI-Spuro into a reusable{" "}
                    <span className="font-semibold">Spuro Agent SDK</span> so
                    other teams can plug in their own prompts and flows.
                  </li>
                  <li>
                    Sharper agent patterns for Arkiv-backed memory (TTL,
                    session-scoped buckets, query helpers).
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Blockers or hurdles we hit
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Balancing time between core infra (Spuro/Arkiv/x402) and
                    higher-level DX (SDK ergonomics, agent templates).
                  </li>
                  <li>
                    Designing abstractions that work both for Polkadot data and
                    non‑Polkadot data sources without over-complicating the SDK.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* WHAT WE'LL SHIP IN 30 DAYS */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">
              🚀 What we&apos;ll ship in 30 days
            </h2>

            <div className="space-y-5 text-sm sm:text-base text-gray-700">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Our MVP will do this
                </h3>
                <p>
                  Ship an <span className="font-semibold">AI SDK for Spuro</span>{" "}
                  that any TypeScript agent can import to get Arkiv-backed
                  memory, x402-paid storage, and ready-made helpers for
                  snapshotting external data (starting with Polkadot accounts).
                  For hackathon teams and future users, this means they can wire
                  &quot;agent memory as a service&quot; into their bots in under
                  an hour.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Features we&apos;ll build (3–5 max)
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                      Weeks 1–2
                    </p>
                    <p className="text-sm font-semibold mb-1">
                      Feature: Spuro Agent SDK package
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700 mb-1">
                      Why it matters: turns today&apos;s Spuro Functions into a
                      consumable SDK with clear typings, examples, and sensible
                      defaults for agents.
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700">
                      Who builds it: backend/SDK engineer (Spuro + Arkiv).
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                      Weeks 2–3
                    </p>
                    <p className="text-sm font-semibold mb-1">
                      Feature: Agent memory patterns &amp; helpers
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700 mb-1">
                      Why it matters: gives teams opinionated recipes for
                      snapshots, TTL, and querying so they don&apos;t have to
                      design their own Arkiv schema.
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700">
                      Who builds it: backend + agent-experience engineer.
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                      Weeks 3–4
                    </p>
                    <p className="text-sm font-semibold mb-1">
                      Feature: Example agents &amp; docs
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700 mb-1">
                      Why it matters: shows how to plug the SDK into concrete
                      agents (Polkadot stash monitor plus a generic snapshotting
                      bot) and how to run them end-to-end.
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700">
                      Who builds it: frontend/docs + agent-experience engineer.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Team breakdown
                </h3>
                <div className="grid gap-4 sm:grid-cols-3 text-xs sm:text-sm text-gray-700">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="font-semibold mb-1">
                      Backend Engineer – Spuro/Arkiv | ~10 hrs/week
                    </p>
                    <p>Owns: Spuro API surface, Arkiv entity design, SDK core.</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="font-semibold mb-1">
                      Infra/Payments Engineer – HTTPayer/x402 | ~8 hrs/week
                    </p>
                    <p>
                      Owns: x402 payment flows, API security, example configs for
                      paid agents.
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="font-semibold mb-1">
                      Agent Experience Engineer – SDK DX &amp; Docs | ~8 hrs/week
                    </p>
                    <p>
                      Owns: AI-Spuro CLI demos, docs site, agent templates, and
                      onboarding guides.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Mentoring &amp; expertise we need
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 text-xs sm:text-sm text-gray-700">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="font-semibold mb-1">Areas where we need support</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Validating our SDK design against how other agent
                        frameworks structure tools and memory.
                      </li>
                      <li>
                        Stress-testing Arkiv/Spuro patterns for scale and
                        long-lived agent sessions.
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="font-semibold mb-1">
                      Specific expertise we&apos;re looking for
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Mentors with experience building agent SDKs or tool
                        ecosystems.
                      </li>
                      <li>
                        Experts in Arkiv / on-chain data storage best practices
                        to review our entity and TTL design.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WHAT HAPPENS AFTER */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">
              🎯 What happens after
            </h2>
            <div className="space-y-5 text-sm sm:text-base text-gray-700">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  When M2 is done, we plan to...
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Open up the Spuro Agent SDK to early design partners (other
                    hackathon teams, infra projects) and iterate on feedback.
                  </li>
                  <li>
                    Add 1–2 additional example agents beyond Polkadot, showing
                    how Spuro-backed memory can power any autonomous workflow.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  And 6 months out we see our project achieve:
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Multiple external teams shipping production agents that rely
                    on Spuro/Arkiv as their primary memory layer.
                  </li>
                  <li>
                    Spuro recognized as a core building block for{" "}
                    <span className="font-semibold">agent-native
                    infrastructure</span>, with HTTPayer/x402 and Arkiv
                    underneath and a healthy ecosystem of community-contributed
                    agent templates on top.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


