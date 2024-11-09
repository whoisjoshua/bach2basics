// Name: serialcomms.js
// Description:
//     Reads serial communications from Arduino via input with the baud rate of 9600.
//     Requires the "serialport" package, which can be installed by "npm install serialport".

import SerialPort from 'serialport';
import Readline from '@serialport/parser-readline'

const IO_PORT = '/dev/cu.usbmodemFA141'

const port = new SerialPort(IO_PORT, { baudRate: 9600 });
const parser = port.pipe(new Readline({ delimiter: '\n' }));
port.on("open", () => {
  console.log('serial port open');
});

const App = () => {

  const [data, setData] = useState('');

  parser.on('data', serialData => {
    setData(serialData)
  });

  return (
    <div className="App">
      <p>Distance: {data}</p>
    </div>
  );
}



// References:
//     - https://medium.com/@machadogj/arduino-and-node-js-via-serial-port-bcf9691fab6a
//     - 