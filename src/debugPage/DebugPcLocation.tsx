import { Memory } from '../cpu/Cpu';

type Props = { PC: number; memory: Memory };

const DebugPcLocation = ({ PC, memory }: Props) => {
  const constructPage = () => {
    let row = `$${PC.toString(16)}:`;
    for (let j = 0; j < 3; j++) {
      let num = memory.memory[PC + j].toString(16);
      if (num.length == 1) {
        row += ` 0${num}`;
      } else {
        //   row += ` ${num.toString(16)}`;
        row += ` ${num}`;
      }
    }

    return row;
  };

  return (
    <div className='pcTracker'>
      <ul>{constructPage()}</ul>
    </div>
  );
};

export default DebugPcLocation;
