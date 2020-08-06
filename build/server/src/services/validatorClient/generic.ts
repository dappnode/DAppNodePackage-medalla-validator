import { Supervisor } from "../../utils";
import { ChildProcessStatus } from "../../../common";

export interface ClientKeystoreManager {
  importKeystores(): Promise<void>;
  deleteKeystores(): Promise<void>;
  hasKeystores(): Promise<boolean>;
}

export class NoKeystoresError extends Error {}

export class ValidatorClient {
  private binary: Supervisor;
  private keystoreManager: ClientKeystoreManager;

  constructor(binary: Supervisor, keystoreManager: ClientKeystoreManager) {
    this.binary = binary;
    this.keystoreManager = keystoreManager;
  }

  /**
   * Restart only if previously running + if it has keys
   */
  async restart(): Promise<void> {
    if (
      this.binary.getTargetStatus() === "running" &&
      this.keystoreManager.hasKeystores()
    ) {
      await this.binary.restart();
    }
  }

  /**
   * Start binary if it has keystores. Run on main process start
   */
  async startIfHasKeystores(): Promise<void> {
    if (this.keystoreManager.hasKeystores()) {
      await this.binary.restart();
    }
  }

  /**
   * Grab validator keys and start process
   */
  async getKeystoresAndStart(): Promise<void> {
    if (this.keystoreManager.hasKeystores()) {
      await this.binary.kill();
      await this.keystoreManager.importKeystores();
      await this.binary.restart();
    } else {
      throw new NoKeystoresError("No keystores available");
    }
  }

  /**
   * Kill process and remove validator keys
   */
  async stopAndDeleteKeystores(): Promise<void> {
    await this.binary.kill();
    await this.keystoreManager.deleteKeystores();
  }

  /**
   * Get client status
   */
  async getStatus(): Promise<ChildProcessStatus | null> {
    return this.binary.getStatus();
  }
}
