// Name: serialcomms.js
// Description:
//     Reads serial communications from Arduino via input with the baud rate of 9600.
//     Requires the "serialport" package, which can be installed by "npm install serialport".

import SerialPort from 'serialport';
import Readline from '@serialport/parser-readline'

// Common Arduino USB vendor IDs
const ARDUINO_VENDORS = [
  '2341',  // Arduino
  '1A86',  // QinHeng Electronics
  '2A03',  // Arduino SA
  '0403',  // FTDI
  'de55',  // Silicon Labs (CP2102)
];

// Fields
const SerialPort = require('serialport');
const TARGET_PORT = 'COM3';      // Default port
const BAUD_RATE = 9600;
const ports = [];
let found_port = new Boolean(false);

// Verify port comms exist

SerialPort.list().then(ports => {
  ports.forEach(port => {

    // Port information log
    console.log(port);

    // Print port name (e.g., COM1, /dev/ttyUSB0)
    if (port.comName) { 
      console.log('[INFO] Port name: ', port.comName);
      ports.push(port.comName);   // Add to list of ports
    }

    // Verify that the default port exists
    if (PORT_COM == port.comName) {
        console.log("[INFO] Port found: ", port.comName);
        found_port = new Boolean(true);
    }
  });
}).catch(err => {
  console.error('[ERR] Verify serial port error: ', err);
});

// Auto-detect port for Arduino
if (!found_port) {
  for (let i = 0; i < ports.length; i++) {
    const port = ports[i];
    
    // Check if the port has a vendor ID that matches known Arduino vendors
    if (port.vendorId && ARDUINO_VENDORS.includes(port.vendorId.toLowerCase())) {
      console.log("[INFO] Arduino detected on port: ", port.comName);
      TARGET_PORT = port.comName;
      found_port = true;
      break;
    }
    
    // Alternative detection method: Check manufacturer or product strings
    const manufacturer = (port.manufacturer || '').toLowerCase();
    const productId = (port.productId || '').toLowerCase();
    
    if (
      manufacturer.includes('arduino') ||
      manufacturer.includes('ftdi') ||
      productId.includes('arduino')
    ) {
      console.log("[INFO] Arduino detected on port: ", port.comName);
      TARGET_PORT = port.comName;
      found_port = true;
      break;
    }
  }
}


// Read data from serial
const port = new SerialPort(TARGET_PORT, { baudRate: BAUD_RATE });
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
//     - https://stackoverflow.com/questions/57011328/arduino-read-serial-monitor-with-nodejs-and-output-in-react-web-page