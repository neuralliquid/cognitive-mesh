# Agent Contract Schemas

This directory defines the Cognitive Mesh side of Agent Operating Model v0. These
schemas are the machine-readable boundary between generated repo guidance,
runtime workflow execution, Baton evidence, model routing, cost routing, and
benchmark promotion gates.

## Status

Implemented in this repository:

- JSON Schemas for workflow contracts, harness contracts, and shared benchmark
  gate identifiers.
- Reference examples for the existing `DurableWorkflowEngine` orchestration
  surface.
- Documentation links from the API spec and orchestration evaluation surfaces.

Planned follow-up work:

- Actual harness runners for latency, fan-out throughput, and failure recovery.
- Automated evidence attachment to Baton or release records.
- Automated lifecycle promotion from `specified` through `promoted`.

## Files

- `workflow-contract.schema.json` defines a governed multi-agent workflow:
  trigger/input, ordered steps, state handoff, authority, tools, model route,
  cost route, timeout/retry/backpressure/idempotency, approval, audit, rollback,
  and evaluation gates.
- `harness-contract.schema.json` defines the benchmark harness that decides
  whether a workflow contract is harnessed, verified, or promotable.
- `benchmark-kind.schema.json` is the canonical enum for benchmark gate
  identifiers shared by workflow and harness contracts.
- `examples/standard-orchestration-workflow.contract.json` is the reference
  workflow contract for the existing `DurableWorkflowEngine` surface.
- `examples/standard-orchestration-harness.contract.json` binds the workflow to
  the existing latency, fan-out throughput, failure recovery, and MAKER gates.

## Gate Mapping

The harness contract makes the existing
`docs/orchestration-evaluation/08-gaps-and-future/benchmark-harness-spec.md`
actionable:

| Gate | Source | Critical threshold |
|------|--------|--------------------|
| Interactive coordination latency | Benchmark 1 | p95 < 200 ms |
| Parallel fan-out throughput | Benchmark 2 | N=100 wall clock < 30 s and backpressure observed |
| Failure injection and recovery | Benchmark 3 | correct final state and complete audit trail |
| MAKER long-horizon execution | `MakerBenchmark` | at least 10 discs completed |

Promotion from `specified` to `verified` is not automated yet. It requires all
critical gates to pass and evidence artifacts to be attached to the task or
release record. The schemas do not claim a workflow is currently verified; they
define the contract required to produce that evidence.
