"""
File Name: SerialComms.py
Description: Reads serial communications from Arduino via input with the baud rate of 9600.
             Requires the "pyserial" package, which can be installed by "pip install pyserial".
"""

import serial
import serial.tools.list_ports
import time
import keyboard 

def search_arduino():
    """
    Searches for an Arduino among the available COM ports.
    Returns the COM port if found, else None.
    """
    ports = serial.tools.list_ports.comports()
    for port in ports:
        if "Arduino" in port.description or "CH340" in port.description:
            return port.device  # Return the port (e.g., 'COM4')
    return None

def read_serial_data(port="COM3", baud_rate=9600):
    """
    Reads data from the specified serial port.
    If the port is unavailable, searches for an Arduino and reads data from it.
    """

    # Connect to default serial port COM3
    try:
        ser = serial.Serial(port, baud_rate, timeout=1)
        print("[INFO] Connected to {}".format(port))

    # Search and connect to Arduino in the event of the default port not being available
    except serial.SerialException:
        print("[INFO] Comms port {} not available. Searching for an Arduino...".format(port))
        port = search_arduino()

        if port is None:
            print("[ERR] No Arduino found. Please check your connection to the Arduino.")
            return
        
        # Connect to found Arduino
        ser = serial.Serial(port, baud_rate, timeout=1)
        print("[INFO] Connected to Arduino on {}".format(port))

    # Read serial data
    try:
        while True:
            # TODO: If we want to include key events
            if keyboard.is_pressed("e"):
                print("[INFO] E key pressed.")
                break

            # Serial reading
            if ser.in_waiting:
                data = ser.readline().decode('utf-8').strip()
                print(f"Received: {data}")
            time.sleep(0.1)

    # TODO: Should I remove this and add key events for ending + adjusting latency?
    except KeyboardInterrupt:
        print("[INFO] Exiting. Disconnecting from {}.".format(port))
    finally:
        ser.close()
        print("[INFO] Closed serial communication.")

if __name__ == "__main__":
    print("[INFO] Started serial communication reading...")
    read_serial_data()