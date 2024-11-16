import asyncio
import websockets
import serial
import serial.tools.list_ports
import json

class ArduinoReader:
    def __init__(self, baud_rate=9600):
        self.baud_rate = baud_rate
        self.serial_port = None
        
    def search_arduino(self):
        """Search for Arduino among available COM ports."""
        ports = serial.tools.list_ports.comports()
        for port in ports:
            if "Arduino" in port.description or "CH340" in port.description:
                return port.device
        return None

    def connect(self, port="COM3"):
        """Connect to Arduino on specified or discovered port."""
        try:
            self.serial_port = serial.Serial(port, self.baud_rate, timeout=1)
            print(f"[INFO] Connected to {port}")
            return True
        except serial.SerialException:
            print(f"[INFO] Port {port} not available. Searching for Arduino...")
            arduino_port = self.search_arduino()
            if arduino_port:
                try:
                    self.serial_port = serial.Serial(arduino_port, self.baud_rate, timeout=1)
                    print(f"[INFO] Connected to Arduino on {arduino_port}")
                    return True
                except serial.SerialException:
                    print(f"[ERR] Failed to connect to Arduino on {arduino_port}")
            else:
                print("[ERR] No Arduino found")
            return False

    def read_note(self):
        """Read a single note from Arduino."""
        if self.serial_port and self.serial_port.in_waiting:
            try:
                data = self.serial_port.readline().decode('utf-8').strip()
                # Process the data to extract note
                # You might need to modify this based on your Arduino output format
                if data:
                    # Assuming Arduino sends single letters (C, D, E, F, G)
                    note = data.upper()
                    if note in ['C', 'D', 'E', 'F', 'G']:
                        return note
            except Exception as e:
                print(f"[ERR] Error reading from Arduino: {e}")
        return None

    def close(self):
        """Close the serial connection."""
        if self.serial_port:
            self.serial_port.close()
            print("[INFO] Closed serial communication")

class WebSocketServer:
    def __init__(self):
        self.arduino = ArduinoReader()
        self.connected_clients = set()

    async def register(self, websocket):
        """Register a new WebSocket client."""
        self.connected_clients.add(websocket)
        print(f"[INFO] Client connected. Total clients: {len(self.connected_clients)}")

    async def unregister(self, websocket):
        """Unregister a WebSocket client."""
        self.connected_clients.remove(websocket)
        print(f"[INFO] Client disconnected. Total clients: {len(self.connected_clients)}")

    async def arduino_reader(self):
        """Continuously read from Arduino and broadcast to all clients."""
        if not self.arduino.connect():
            return

        while True:
            note = self.arduino.read_note()
            if note:
                print(f"[INFO] Read note: {note}")
                # Broadcast to all connected clients
                websockets_clients = self.connected_clients.copy()
                for websocket in websockets_clients:
                    try:
                        await websocket.send(note)
                    except websockets.exceptions.ConnectionClosed:
                        await self.unregister(websocket)
            await asyncio.sleep(0.01)  # Small delay to prevent CPU overwhelming

    async def handler(self, websocket, path):
        """Handle WebSocket connections."""
        await self.register(websocket)
        try:
            async for message in websocket:
                # Handle any messages from the client if needed
                print(f"[INFO] Received from client: {message}")
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            await self.unregister(websocket)

async def main():
    server = WebSocketServer()
    
    # Start the WebSocket server
    async with websockets.serve(server.handler, "localhost", 8765):
        print("[INFO] WebSocket server started on ws://localhost:8765")
        
        # Start the Arduino reader
        arduino_task = asyncio.create_task(server.arduino_reader())
        
        # Keep the server running
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("[INFO] Server shutting down...")
    finally:
        # Clean up code here if needed
        pass
