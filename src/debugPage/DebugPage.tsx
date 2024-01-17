import MemoryPage from './MemoryPage';
import { CPU } from '../cpu/Cpu';
import { MemoryBus } from '../cpu/MemoryBus';
import './DebugPage.css';
import { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { useInterval } from '../utils/useInterval';
import DebugPcLocation from './DebugPcLocation';
import DebugStack from './DebugStack';
import { PPU } from '../cpu/Ppu';

type Props = { memory: MemoryBus };
const fileTypes = ['nes'];
const PCStart = 0x8000;

const DebugPage = ({ memory }: Props) => {
  const [_, setState] = useState(false);
  const [run, setRun] = useState(false);
  const [runUntil, setRunUntil] = useState(0);
  const [hexToRead, setHexToRead] = useState('');
  const [rom, setRom] = useState<Uint8Array | null>(null);
  const handleKeyDown = (e: any) => {
    if (!rom) return;
    if (e.key === ' ') {
      memory.CPU.runOneInstruction();
    }
    if (e.key === 'r' || e.key === 'R') {
      setRun((prev) => !prev);
    }
    if (e.key === 's') {
      reset();
    }
    setState((prev) => !prev);
  };
  const handleRomLoad = (file: any) => {
    if (!file) return;
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      let arrayBuffer = reader.result;
      var bytes = new Uint8Array(arrayBuffer as ArrayBuffer);
      memory.loadProgram(bytes);
      memory.CPU.reset();
      memory.CPU.PC = PCStart;
      memory.CPU.elapsedCycles = 7;
      setRom(bytes);
      setState((prev) => !prev);
    };
  };

  const handleChange = (e: any) => {
    let num = parseFloat(e.target.value);
    if (!isNaN(num)) {
      setRunUntil(num);
    }
  };
  const handleHexChange = (e: any) => {
    let input = e.target.value;
    const hex = /^[0-9A-Fa-f]*$/;
    if (hex.test(input) || input === '') {
      if (parseInt(input, 16) <= +0xffff) {
        setHexToRead(input);
      }
    }
  };

  const handleReadMemory = (e: any) => {
    e.preventDefault();
    console.log(
      `Memory At Location 0x${hexToRead}: ${memory.memory[
        parseInt(hexToRead, 16)
      ].toString(16)}`
    );
    setHexToRead('');
  };
  const handleJumpToTick = (e: any) => {
    e.preventDefault();
    if (!rom) {
      return;
    }
    while (memory.CPU.elapsedCycles <= runUntil - 1) {
      memory.CPU.runOneInstruction();
    }
    setState((prev) => !prev);
  };

  const reset = () => {
    setRun(false);
    memory.CPU.reset();
    memory.resetMemory();
    if (rom) {
      memory.loadProgram(rom);
    }
    // cpu.PC = PCStart;
    memory.CPU.elapsedCycles = 7;
  };

  const wrap = () => {
    memory.CPU.runOneInstruction();
    // cpu.tick(memory);
    setState((prev) => !prev);
  };
  useInterval(wrap, run ? 0.1 : null);

  return (
    <div className='debugPage' tabIndex={0} onKeyDown={(e) => handleKeyDown(e)}>
      <div className='debugMemory'>
        <h2>Zeropage</h2>
        <MemoryPage memory={memory} startPos={0x00} />
        <h2>Start of program</h2>
        <MemoryPage memory={memory} startPos={0xc000} />
      </div>
      <div className='debugCpu'>
        <h2>Status Flags: </h2>
        <div className='flags'>
          <p style={{ color: `${memory.CPU.flags.N ? 'green' : 'red'}` }}>N</p>
          <p style={{ color: `${memory.CPU.flags.V ? 'green' : 'red'}` }}>V</p>
          <p style={{ color: `${memory.CPU.flags.B ? 'green' : 'red'}` }}>B</p>
          <p style={{ color: `${memory.CPU.flags.D ? 'green' : 'red'}` }}>D</p>
          <p style={{ color: `${memory.CPU.flags.I ? 'green' : 'red'}` }}>I</p>
          <p style={{ color: `${memory.CPU.flags.Z ? 'green' : 'red'}` }}>Z</p>
          <p style={{ color: `${memory.CPU.flags.C ? 'green' : 'red'}` }}>C</p>
        </div>
        <button onClick={() => memory.triggerNMI()}>Trigger NMI</button>
        <div className='registers'>
          <h2>Registers</h2>
          <p>{`A: $${memory.CPU.registers.A.toString(16)}`}</p>
          <p>{`X: $${memory.CPU.registers.X.toString(16)}`}</p>
          <p>{`Y: $${memory.CPU.registers.Y.toString(16)}`}</p>
          <p>{`SP $${memory.CPU.SP.toString(16)}`}</p>
          <p>{`PC $${memory.CPU.PC.toString(16)}`}</p>
          <p>{`Elapsed ticks ${memory.CPU.elapsedCycles}`}</p>
        </div>
        <h1>LOAD ROM</h1>
        <FileUploader
          handleChange={handleRomLoad}
          name='file'
          types={fileTypes}
        />
        <p>Space - Run single command</p>
        <p>R - {run ? 'Stop' : 'Run'} Program</p>
        <p>S - Reset</p>
        <DebugPcLocation PC={memory.CPU.PC} memory={memory} />
        <DebugStack SP={memory.CPU.SP} memory={memory} />
      </div>
      <div className='debugForms'>
        <form onSubmit={(e) => handleJumpToTick(e)}>
          <label>
            Run until chosen tick:
            <input
              type='text'
              name='value'
              value={runUntil}
              onChange={(e) => handleChange(e)}
            />
          </label>
          <input type='submit' value='Run' />
        </form>
        <form onSubmit={(e) => handleReadMemory(e)}>
          <label>
            Read memory at hex:
            <input
              type='text'
              name='value'
              value={hexToRead}
              onChange={(e) => handleHexChange(e)}
            />
          </label>
          <input type='submit' value='Read' />
        </form>
      </div>
    </div>
  );
};

export default DebugPage;
