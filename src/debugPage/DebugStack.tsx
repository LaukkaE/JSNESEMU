import React from 'react';
import { Memory } from '../cpu/Cpu';

type Props = { SP: number; memory: Memory };

const DebugStack = ({ SP, memory }: Props) => {
  const constructStack = () => {
    let li = [];
    for (let i = -8; i <= 8; i++) {
      li.push(
        <li key={i}>
          <p style={{ color: `${i === 0 ? 'blue' : 'white'}` }}>
            {' '}
            {`${(SP + i).toString(16)}: ${memory.memory[SP + i]}`}
          </p>
        </li>
      );
    }
    return li;
  };

  //   const constructPage = () => {
  //     let page = [];
  //     for (let i = 0; i < 16; i++) {
  //       let row = `$${(startPos + i * 16).toString(16)}:`;
  //       for (let j = 0; j < 16; j++) {
  //         let num = memory.memory[startPos + j + i * 16].toString(16);
  //         if (num.length == 1) {
  //           row += ` 0${num}`;
  //         } else {
  //           //   row += ` ${num.toString(16)}`;
  //           row += ` ${num}`;
  //         }
  //       }
  //       page.push(
  //         <li key={i}>
  //           <p>{row}</p>
  //         </li>
  //       );
  //     }

  //     return page;
  //   };

  return (
    <div className='debugStack'>
      <h3>Stack</h3>
      <ul>{constructStack()}</ul>
    </div>
  );
};

export default DebugStack;
