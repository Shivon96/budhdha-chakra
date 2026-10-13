import React, { useState } from 'react';
import { ChakraTopology, HardwareExportConfig, RGBColor } from '../types/chakra';
import { generateFastLedCode, generateWledLedMap } from '../utils/fastledGenerator';
import { webSerial } from '../utils/webSerial';
import { Download, Copy, Check, Terminal, Usb, Sliders, Cpu, FileCode, CheckCircle2, AlertTriangle, Info, Zap } from 'lucide-react';

interface HardwareExporterProps {
  topology: ChakraTopology;
  totalLeds: number;
  currentFrameColors: RGBColor[];
}

export const HardwareExporter: React.FC<HardwareExporterProps> = ({
  topology,
  totalLeds,
  currentFrameColors,
}) => {
  const [activeTab, setActiveTab] = useState<'arduino' | 'esp01_guide' | 'wled' | 'serial' | 'wiring'>('arduino');
  const [copied, setCopied] = useState(false);

  // Hardware config state (default to ESP-01 with GPIO 2)
  const [config, setConfig] = useState<HardwareExportConfig>({
    chipType: 'esp01',
    dataPin: 2, // Standard GPIO 2 for ESP-01
    ledType: 'WS2812B',
    colorOrder: 'GRB',
    maxMilliamps: 2000,
    hasButtonControl: false,
    buttonPin: 0,
    hasBrightnessPot: false,
    potPin: 34,
  });

  const [serialConnected, setSerialConnected] = useState(false);
  const [serialError, setSerialError] = useState<string | null>(null);

  const generatedCode = generateFastLedCode(topology, totalLeds, config);
  const generatedWledMap = generateWledLedMap(totalLeds);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadIno = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `buddha_chakra_${config.chipType}_${totalLeds}leds.ino`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleConnectSerial = async () => {
    setSerialError(null);
    try {
      if (serialConnected) {
        await webSerial.disconnect();
        setSerialConnected(false);
      } else {
        await webSerial.connect(115200);
        setSerialConnected(true);
      }
    } catch (err: any) {
      setSerialError(err.message || 'Failed to connect via USB Serial');
      setSerialConnected(false);
    }
  };

  React.useEffect(() => {
    if (serialConnected && currentFrameColors.length > 0) {
      webSerial.sendFrame(currentFrameColors);
    }
  }, [serialConnected, currentFrameColors]);

  return (
    <div className="space-y-6">
      {/* Top Export Mode Segmented Tabs */}
      <div className="p-1 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('arduino')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'arduino'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>FastLED Code (.ino)</span>
        </button>

        <button
          onClick={() => setActiveTab('esp01_guide')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'esp01_guide'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>ESP-01 Guide & Pinout</span>
        </button>

        <button
          onClick={() => setActiveTab('wled')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'wled'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>WLED ledmap.json</span>
        </button>

        <button
          onClick={() => setActiveTab('serial')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'serial'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Usb className="w-3.5 h-3.5" />
          <span>USB Web Serial Test</span>
        </button>

        <button
          onClick={() => setActiveTab('wiring')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'wiring'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Wiring Guide</span>
        </button>
      </div>

      {/* ARDUINO & FASTLED CODE TAB */}
      {activeTab === 'arduino' && (
        <div className="space-y-4">
          {/* Microcontroller & Pin Configuration */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Target Microcontroller & Pin Settings
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Chip Type */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Target Controller</label>
                <select
                  value={config.chipType}
                  onChange={(e) => {
                    const newChip = e.target.value as any;
                    setConfig({
                      ...config,
                      chipType: newChip,
                      dataPin: newChip === 'esp01' ? 2 : (newChip === 'esp32' ? 2 : 4),
                      hasButtonControl: newChip === 'esp01' ? false : config.hasButtonControl,
                    });
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-semibold cursor-pointer"
                >
                  <option value="esp01">ESP-01 / ESP-01S (ESP8266)</option>
                  <option value="esp32">ESP32 (NodeMCU / DevKit)</option>
                  <option value="esp8266">ESP8266 (D1 Mini / NodeMCU)</option>
                  <option value="arduino_nano">Arduino Nano (ATmega328P)</option>
                  <option value="arduino_uno">Arduino Uno</option>
                </select>
              </div>

              {/* Data Pin */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Data Pin (DIN) {config.chipType === 'esp01' && '(GPIO 2)'}
                </label>
                <input
                  type="number"
                  value={config.dataPin}
                  onChange={(e) => setConfig({ ...config, dataPin: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-amber-400"
                />
              </div>

              {/* LED Type */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">LED IC Type</label>
                <select
                  value={config.ledType}
                  onChange={(e) => setConfig({ ...config, ledType: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 cursor-pointer"
                >
                  <option value="WS2812B">WS2812B (5V SMD5050)</option>
                  <option value="WS2811">WS2811 (12V / 5V)</option>
                  <option value="SK6812">SK6812</option>
                </select>
              </div>

              {/* Max Current Limiter */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Current Limit (FastLED)</label>
                <select
                  value={config.maxMilliamps}
                  onChange={(e) => setConfig({ ...config, maxMilliamps: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 cursor-pointer"
                >
                  <option value="1500">1.5A (1500 mA)</option>
                  <option value="2000">2.0A (2000 mA)</option>
                  <option value="3000">3.0A (3000 mA)</option>
                  <option value="5000">5.0A (5000 mA)</option>
                  <option value="10000">10.0A (10000 mA)</option>
                </select>
              </div>
            </div>

            {config.chipType !== 'esp01' && (
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.hasButtonControl}
                    onChange={(e) => setConfig({ ...config, hasButtonControl: e.target.checked })}
                    className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Include Pattern Pushbutton (Pin {config.buttonPin})</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.hasBrightnessPot}
                    onChange={(e) => setConfig({ ...config, hasBrightnessPot: e.target.checked })}
                    className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Include Brightness Potentiometer (Analog Pin {config.potPin})</span>
                </label>
              </div>
            )}
          </div>

          {/* Code Viewer & Action Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>buddha_chakra_controller.ino</span>
                <span className="text-slate-600">·</span>
                <span className="text-amber-400">{totalLeds} LEDs</span>
                <span className="text-slate-600">·</span>
                <span className="text-sky-400 font-semibold">{config.chipType.toUpperCase()}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(generatedCode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>

                <button
                  onClick={handleDownloadIno}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .INO</span>
                </button>
              </div>
            </div>

            <pre className="p-4 text-xs font-mono text-slate-300 bg-slate-950/80 max-h-[380px] overflow-y-auto leading-relaxed select-text">
              <code>{generatedCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* DEDICATED ESP-01 / ESP-01S FLASHING & PINOUT GUIDE */}
      {activeTab === 'esp01_guide' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                ESP-01 / ESP-01S Programming & Connection Guide
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                The ESP-01 is very popular for Buddha halo backplates because it is ultra-compact (only 25mm × 14mm) and hides easily behind the 15-inch disc!
              </p>
            </div>
            <span className="text-xs font-mono bg-sky-500/20 text-sky-300 px-2.5 py-1 rounded-lg border border-sky-500/30">
              ESP8266 1MB Flash
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ESP-01 Header Pinout */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                ESP-01 8-Pin Header Wiring
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="font-mono text-slate-300">VCC (Pin 8)</span>
                  <span className="text-amber-400">Regulated 3.3V DC (Do NOT use 5V!)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="font-mono text-slate-300">GND (Pin 1)</span>
                  <span className="text-slate-300">Common GND with 5V Power Supply</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="font-mono text-slate-300">CH_PD / EN (Pin 4)</span>
                  <span className="text-emerald-400">Pull HIGH to 3.3V (Enable chip)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="font-mono text-slate-300">GPIO 2 (Pin 3)</span>
                  <span className="text-sky-400 font-bold">WS2812 DATA OUT (DIN via 330Ω)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="font-mono text-slate-300">GPIO 0 (Pin 5)</span>
                  <span className="text-rose-400">Connect to GND ONLY during flashing</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-mono text-slate-300">RX / TX (Pins 7, 2)</span>
                  <span className="text-slate-400">Connect to FTDI USB-UART programmer</span>
                </div>
              </div>
            </div>

            {/* Arduino IDE Board Settings */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                Arduino IDE Flash Configuration
              </h4>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Board:</span>
                  <span className="font-semibold text-slate-200">Generic ESP8266 Module</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Flash Size:</span>
                  <span className="font-semibold text-slate-200">1MB (FS:64KB OTA:~470KB)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">CPU Frequency:</span>
                  <span className="font-semibold text-slate-200">80 MHz (or 160 MHz)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Upload Speed:</span>
                  <span className="font-semibold text-slate-200">115200 Baud</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Reset Method:</span>
                  <span className="font-semibold text-slate-200">dtr (or manual button)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step-by-Step Programming Procedure */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Step-by-Step Flashing Procedure:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1 leading-relaxed">
              <li>Connect your ESP-01 to a USB FTDI programmer (VCC to 3.3V, GND to GND, TX to RX, RX to TX, CH_PD to 3.3V).</li>
              <li>Connect <strong>GPIO 0 to GND</strong> before plugging into the computer USB port (this puts ESP-01 into bootloader download mode).</li>
              <li>Open Arduino IDE, install the <strong>FastLED</strong> library and <strong>ESP8266</strong> board package.</li>
              <li>Open the downloaded <code className="text-amber-400 bg-slate-800 px-1 py-0.5 rounded">.ino</code> code and click <strong>Upload</strong>.</li>
              <li>Once uploaded, disconnect GPIO 0 from GND and reboot the ESP-01. It will immediately begin driving your WS2812 Buddha halo!</li>
            </ol>
          </div>
        </div>
      )}

      {/* WLED CONFIG TAB */}
      {activeTab === 'wled' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-1">WLED Circular Matrix Mapping</h3>
            <p className="text-xs text-slate-400 mb-3">
              If your controller is running WLED firmware, paste this into <code className="text-amber-400 bg-slate-800 px-1 py-0.5 rounded">ledmap.json</code> in the WLED file system editor to allow circular 2D animations!
            </p>

            <div className="flex justify-end mb-2">
              <button
                onClick={() => handleCopy(generatedWledMap)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>

            <pre className="p-4 text-xs font-mono text-slate-300 bg-slate-950 rounded-lg max-h-[300px] overflow-y-auto">
              <code>{generatedWledMap}</code>
            </pre>
          </div>
        </div>
      )}

      {/* USB WEB SERIAL TEST TAB */}
      {activeTab === 'serial' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Usb className="w-4 h-4 text-amber-400" />
                Live Web Serial Hardware Streaming
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Connect your real controller to your computer via USB. The browser will stream live 60 FPS pixel colors directly to the hardware so you can test your physical Buddha Chakra in real time!
              </p>
            </div>

            <button
              onClick={handleConnectSerial}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                serialConnected
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
              }`}
            >
              <Usb className="w-4 h-4" />
              <span>{serialConnected ? 'Disconnect USB' : 'Connect via USB'}</span>
            </button>
          </div>

          {serialError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{serialError}</span>
            </div>
          )}

          {serialConnected ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3 text-xs text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="block text-emerald-200">Hardware Streaming Active!</strong>
                <span>Streaming {totalLeds} LEDs @ 115200 Baud over USB COM port. Watch your physical WS2812 chakra glow!</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-400 space-y-2">
              <div className="font-semibold text-slate-300">How to use Live USB Streaming:</div>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
                <li>Flash the generated FastLED sketch to your board once via Arduino IDE.</li>
                <li>Plug the board into your computer USB port.</li>
                <li>Click <strong>Connect via USB</strong> above and choose your board's COM port in the browser popup.</li>
                <li>The physical LEDs will replicate the screen simulator instantly!</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* SOLDERING & WIRING GUIDE TAB */}
      {activeTab === 'wiring' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">
            WS2812 Buddha Chakra Hardware Soldering Blueprint
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-amber-400 flex items-center gap-2">
                <span>1. Power Lines (5V & GND)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Connect all 5V power rails in parallel using a thick 18AWG or 20AWG circular bus wire around the back of the chakra frame. Connect GND similarly in a ring.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-sky-400 flex items-center gap-2">
                <span>2. Data Line (DIN → DOUT)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Data travels sequentially in one direction! Follow the arrow on the WS2812 strip. In <strong>Zig-zag</strong> mode, the DOUT of strip 1 solders to the DIN at the tip of strip 2, eliminating long return wires.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
                <span>3. Noise & Capacitor Protection</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Add a <strong>330Ω to 470Ω resistor</strong> between the microcontroller data pin and the first LED DIN. Place a <strong>1000µF 6.3V/16V electrolytic capacitor</strong> across the 5V and GND terminals.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
