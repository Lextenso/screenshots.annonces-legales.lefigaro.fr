import SftpClient from "ssh2-sftp-client";
import path from "path";

export class SftpService {
  private client: SftpClient;
  private config: {
    host: string;
    username: string;
    password: string;
    baseDirectory: string;
  };

  constructor() {
    this.client = new SftpClient();
    
    const host = process.env.SFTP_SERVEUR || process.env.SFTP_SERVER;
    const username = process.env.SFTP_LOGIN || process.env.SFTP_USERNAME;
    const password = process.env.SFTP_PASSWORD;
    const baseDirectory = process.env.SFTP_DIRECTORY || "/uploads";

    if (!host || !username || !password) {
      throw new Error("SFTP credentials not configured in environment variables");
    }

    this.config = {
      host,
      username,
      password,
      baseDirectory,
    };
  }

  async connect(): Promise<void> {
    await this.client.connect({
      host: this.config.host,
      username: this.config.username,
      password: this.config.password,
      port: 22,
    });
  }

  async uploadFile(localPath: string, fileName: string): Promise<string> {
    try {
      await this.connect();

      const currentYear = new Date().getFullYear().toString();
      const remoteDir = path.posix.join(this.config.baseDirectory, currentYear);
      const remotePath = path.posix.join(remoteDir, fileName);

      // Ensure the year directory exists
      try {
        await this.client.mkdir(remoteDir, true);
      } catch (error) {
        // Directory might already exist, that's okay
      }

      await this.client.put(localPath, remotePath);
      
      return remotePath;
    } finally {
      await this.disconnect();
    }
  }

  async disconnect(): Promise<void> {
    await this.client.end();
  }
}
