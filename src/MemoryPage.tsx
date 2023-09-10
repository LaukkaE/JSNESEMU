import React from 'react';
import { Memory } from './cpu/Cpu';

type Props = { memory: Memory; startPos: number };

const MemoryPage = ({ memory, startPos }: Props) => {
  const constructPage = () => {
    let page = [];
    for (let i = 0; i < 16; i++) {
      let row = `$${(startPos + i * 16).toString(16)}:`;
      for (let j = 0; j < 16; j++) {
        let num = memory.memory[startPos + j + i * 16].toString(16);
        if (num.length == 1) {
          row += ` 0${num}`;
        } else {
          //   row += ` ${num.toString(16)}`;
          row += ` ${num}`;
        }
      }
      page.push(
        <li key={i}>
          <p>{row}</p>
        </li>
      );
    }

    return page;
  };

  return (
    <div className='memoryPage'>
      <ul>{constructPage()}</ul>
    </div>
  );
};

export default MemoryPage;
