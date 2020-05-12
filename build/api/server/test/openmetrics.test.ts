import "mocha";
import assert from "assert";
import { parseOpenMetrics } from "../src/services/openMetrics";

describe("Parse open metrics", () => {
  it("Should parse open metrics", () => {
    const res = `# HELP promhttp_metric_handler_requests_in_flight Current number of scrapes being served.
    # TYPE promhttp_metric_handler_requests_in_flight gauge
    promhttp_metric_handler_requests_in_flight 1
    # HELP promhttp_metric_handler_requests_total Total number of scrapes by HTTP status code.
    # TYPE promhttp_metric_handler_requests_total counter
    promhttp_metric_handler_requests_total{code="200"} 120
    promhttp_metric_handler_requests_total{code="500"} 0
    promhttp_metric_handler_requests_total{code="503"} 0
    # HELP skip_slot_cache_hit The total number of cache hits on the skip slot cache.
    # TYPE skip_slot_cache_hit counter
    skip_slot_cache_hit 0
    # HELP skip_slot_cache_miss The total number of cache misses on the skip slot cache.
    # TYPE skip_slot_cache_miss counter
    skip_slot_cache_miss 0
    # HELP validator_balance current validator balance.
    # TYPE validator_balance gauge
    validator_balance{pubkey="0x80cacfe3240d2705ab2099e405bfe8d938057317f2e2ee7ecda0c5472b4a337c406f1893527dbde9594c9f90b5706e9b"} 31.994658496
    validator_balance{pubkey="0x88646c9fd4040b35fb8830edc32e44e64836b224a96374067b61758e329f4006b3f281c6e575f95672e1aceff8368c0a"} 32.25572165
    validator_balance{pubkey="0x8aac9f975e0cda2454b3d89688cd82588799398542650e5a7335a0cf2e708b2011de965959102999fae6d1620f7e1634"} 0
    validator_balance{pubkey="0x96f4737d66abfc15ea88bac3d80d031f77f014610b3e6a1633f8c6d0776f28d935a9b3f8b8ad77e71c571619ccaf31fb"} 31.992965954
    # HELP validator_failed_attestations 
    # TYPE validator_failed_attestations counter
    validator_failed_attestations{pubkey="0x88646c9fd4040b35fb8830edc32e44e64836b224a96374067b61758e329f4006b3f281c6e575f95672e1aceff8368c0a"} 1
    validator_failed_attestations{pubkey="0x96f4737d66abfc15ea88bac3d80d031f77f014610b3e6a1633f8c6d0776f28d935a9b3f8b8ad77e71c571619ccaf31fb"} 1
    # HELP validator_statuses validator statuses: 0 UNKNOWN, 1 DEPOSITED, 2 PENDING, 3 ACTIVE, 4 EXITING, 5 SLASHING, 6 EXITED
    # TYPE validator_statuses gauge
    validator_statuses{pubkey="0x80cacfe3240d2705ab2099e405bfe8d938057317f2e2ee7ecda0c5472b4a337c406f1893527dbde9594c9f90b5706e9b"} 3
    validator_statuses{pubkey="0x88646c9fd4040b35fb8830edc32e44e64836b224a96374067b61758e329f4006b3f281c6e575f95672e1aceff8368c0a"} 3
    validator_statuses{pubkey="0x8aac9f975e0cda2454b3d89688cd82588799398542650e5a7335a0cf2e708b2011de965959102999fae6d1620f7e1634"} 0
    validator_statuses{pubkey="0x96f4737d66abfc15ea88bac3d80d031f77f014610b3e6a1633f8c6d0776f28d935a9b3f8b8ad77e71c571619ccaf31fb"} 3
    # HELP validator_successful_aggregations 
    # TYPE validator_successful_aggregations counter
    validator_successful_aggregations{pubkey="0x80cacfe3240d2705ab2099e405bfe8d938057317f2e2ee7ecda0c5472b4a337c406f1893527dbde9594c9f90b5706e9b"} 1
    validator_successful_aggregations{pubkey="0x88646c9fd4040b35fb8830edc32e44e64836b224a96374067b61758e329f4006b3f281c6e575f95672e1aceff8368c0a"} 1
    # HELP validator_successful_attestations 
    # TYPE validator_successful_attestations counter
    validator_successful_attestations{pubkey="0x80cacfe3240d2705ab2099e405bfe8d938057317f2e2ee7ecda0c5472b4a337c406f1893527dbde9594c9f90b5706e9b"} 4
    validator_successful_attestations{pubkey="0x88646c9fd4040b35fb8830edc32e44e64836b224a96374067b61758e329f4006b3f281c6e575f95672e1aceff8368c0a"} 2
    validator_successful_attestations{pubkey="0x96f4737d66abfc15ea88bac3d80d031f77f014610b3e6a1633f8c6d0776f28d935a9b3f8b8ad77e71c571619ccaf31fb"} 4`;

    const parsed = parseOpenMetrics(res);
    assert.deepEqual(parsed, {
      validatorBalance: {
        "0x80cacfe3240d2705ab2099e405bfe8d938057317f2e2ee7ecda0c5472b4a337c406f1893527dbde9594c9f90b5706e9b": 31.994658496,
        "0x88646c9fd4040b35fb8830edc32e44e64836b224a96374067b61758e329f4006b3f281c6e575f95672e1aceff8368c0a": 32.25572165,
        "0x8aac9f975e0cda2454b3d89688cd82588799398542650e5a7335a0cf2e708b2011de965959102999fae6d1620f7e1634": 0,
        "0x96f4737d66abfc15ea88bac3d80d031f77f014610b3e6a1633f8c6d0776f28d935a9b3f8b8ad77e71c571619ccaf31fb": 31.992965954
      },
      validatorStatus: {
        "0x80cacfe3240d2705ab2099e405bfe8d938057317f2e2ee7ecda0c5472b4a337c406f1893527dbde9594c9f90b5706e9b":
          "ACTIVE",
        "0x88646c9fd4040b35fb8830edc32e44e64836b224a96374067b61758e329f4006b3f281c6e575f95672e1aceff8368c0a":
          "ACTIVE",
        "0x8aac9f975e0cda2454b3d89688cd82588799398542650e5a7335a0cf2e708b2011de965959102999fae6d1620f7e1634":
          "UNKNOWN",
        "0x96f4737d66abfc15ea88bac3d80d031f77f014610b3e6a1633f8c6d0776f28d935a9b3f8b8ad77e71c571619ccaf31fb":
          "ACTIVE"
      }
    });
  });
});
