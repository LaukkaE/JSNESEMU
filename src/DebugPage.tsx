import MemoryPage from './MemoryPage';
import { CPU, Memory } from './cpu/Cpu';
import './DebugPage.css';
import { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { useInterval } from './utils/useInterval';
import DebugPcLocation from './debugPage/DebugPcLocation';
import DebugStack from './debugPage/DebugStack';

type Props = { cpu: CPU; memory: Memory };
const fileTypes = ['nes'];

const DebugPage = ({ cpu, memory }: Props) => {
  const [_, setState] = useState(false);
  const [run, setRun] = useState(false);
  const [runUntil, setRunUntil] = useState(0);
  const [hexToRead, setHexToRead] = useState('');
  const [rom, setRom] = useState<Uint8Array | null>(null);
  const handleKeyDown = (e: any) => {
    if (!rom) return;
    if (e.key === ' ') {
      cpu.runOneInstruction(memory);
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
      cpu.reset(memory);
      cpu.PC = 0xc000;
      cpu.elapsedCycles = 7;
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
    while (cpu.elapsedCycles <= runUntil - 1) {
      cpu.runOneInstruction(memory);
    }
    setState((prev) => !prev);
  };

  const reset = () => {
    setRun(false);
    cpu.reset(memory);
    memory.resetMemory();
    memory.loadProgram(rom);
    cpu.PC = 0xc000;
    cpu.elapsedCycles = 7;
  };

  const wrap = () => {
    cpu.runOneInstruction(memory);
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
          <p style={{ color: `${cpu.flags.N ? 'green' : 'red'}` }}>N</p>
          <p style={{ color: `${cpu.flags.V ? 'green' : 'red'}` }}>V</p>
          <p style={{ color: `${cpu.flags.B ? 'green' : 'red'}` }}>B</p>
          <p style={{ color: `${cpu.flags.D ? 'green' : 'red'}` }}>D</p>
          <p style={{ color: `${cpu.flags.I ? 'green' : 'red'}` }}>I</p>
          <p style={{ color: `${cpu.flags.Z ? 'green' : 'red'}` }}>Z</p>
          <p style={{ color: `${cpu.flags.C ? 'green' : 'red'}` }}>C</p>
        </div>
        <div className='registers'>
          <h2>Registers</h2>
          <p>{`A: $${cpu.registers.A.toString(16)}`}</p>
          <p>{`X: $${cpu.registers.X.toString(16)}`}</p>
          <p>{`Y: $${cpu.registers.Y.toString(16)}`}</p>
          <p>{`SP $${cpu.SP.toString(16)}`}</p>
          <p>{`PC $${cpu.PC.toString(16)}`}</p>
          <p>{`Elapsed ticks ${cpu.elapsedCycles}`}</p>
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
        <DebugPcLocation PC={cpu.PC} memory={memory} />
        <DebugStack SP={cpu.SP} memory={memory} />
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
