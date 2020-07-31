import "mocha";
import assert from "assert";
import request from "supertest";
import app from "../src/app";
import { logs } from "../src/logs";

const requestApp = request(app);

/**
 * Use this format to have visibility of the body in case it fails
 * @param res
 * @param code
 * @param body
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function expect(res: request.Response, code: number, body: any): void {
  assert.deepEqual(
    { code: res.status, body: res.body },
    { code: code, body: body }
  );
}

describe("/api", () => {
  it("should return 200 OK", async () => {
    const res = await requestApp.get("/api");
    expect(res, 200, { success: true, result: "ethdo account api" });
  });

  describe("Authorize an admin", () => {
    it("should reject without auth", async () => {
      const res = await requestApp.get("/api/login");
      expect(res, 400, { success: false, message: "No cookie" });
    });

    it("should error for missing credentials", async () => {
      const res = await requestApp.post("/api/login");
      expect(res, 500, { success: false, message: "Missing credentials" });
    });

    it("should error for invalid password", async () => {
      const res = await requestApp
        .post("/api/login")
        .send({ password: "other" });
      expect(res, 500, { success: false, message: "Wrong password" });
    });

    it("should accept a valid password and set cookie", async () => {
      const agent = request.agent(app);
      const resLogin = await agent
        .post("/api/login")
        .send({ id: "admin", password: "test-password" })
        .expect(200);
      const setCookie = resLogin.header["set-cookie"][0];
      assert.ok(setCookie, "header set-cookie should be set");
      logs.info({ setCookie });

      // Check it logged in
      await agent.get("/api/login").expect(200);

      // Log out
      await agent.get("/api/logout").expect(200);

      // Check it's not logged in
      await agent.get("/api/login").expect(403);
    });
  });

  describe("/rpc", () => {
    it("should greet", async () => {
      const res = await requestApp
        .post("/api/rpc")
        .send({ method: "greet", params: ["Mike"] });
      expect(res, 200, { result: "Hello Mike" });
    });

    it("should fail for wrong type", async () => {
      const res = await requestApp
        .post("/api/rpc")
        .send({ method: "greet", params: [222] });
      expect(res, 200, {
        error: {
          code: -32603,
          message: "Validation error:\nparams[0] should be string"
        }
      });
    });
  });
});
