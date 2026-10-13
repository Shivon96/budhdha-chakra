import { RGBColor } from '../types/chakra';

export interface SerialStatus {
  supported: boolean;
  connected: boolean;
  portName?: string;
  error?: string;
}

class WebSerialController {
  private port: any = null;
  private writer: any = null;
  private isWriting = false;

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  public async connect(baudRate: number = 115200): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Web Serial API is not supported in this browser. Please use Google Chrome, Edge, or Opera.');
    }

    try {
      // @ts-ignore
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate });
      this.writer = this.port.writable.getWriter();
      return true;
    } catch (err: any) {
      this.disconnect();
      throw err;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.writer) {
        await this.writer.close();
        this.writer = null;
      }
      if (this.port) {
        await this.port.close();
        this.port = null;
      }
    } catch {
      // ignore close errors
    }
  }

  public isConnected(): boolean {
    return this.port !== null && this.writer !== null;
  }

  /**
   * Stream a raw RGB frame over serial.
   * Frame header: 0x55, 0xAA, followed by [R, G, B] * totalLeds, and 0xEE footer.
   */
  public async sendFrame(colors: RGBColor[]): Promise<void> {
    if (!this.isConnected() || this.isWriting) return;

    this.isWriting = true;
    try {
      const buffer = new Uint8Array(2 + colors.length * 3 + 1);
      buffer[0] = 0x55; // magic sync byte 1
      buffer[1] = 0xaa; // magic sync byte 2

      let ptr = 2;
      for (let i = 0; i < colors.length; i++) {
        buffer[ptr++] = colors[i].r;
        buffer[ptr++] = colors[i].g;
        buffer[ptr++] = colors[i].b;
      }
      buffer[ptr] = 0xee; // end byte

      await this.writer.write(buffer);
    } catch (e) {
      console.warn('Serial write dropped frame:', e);
    } finally {
      this.isWriting = false;
    }
  }
}

export const webSerial = new WebSerialController();
