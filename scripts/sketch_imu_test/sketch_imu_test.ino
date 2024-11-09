/*
 * Bach 2 Basics V1
 * 
 * Passive Haptic Learning (PHL)
 * Piano practice audio recognition and learning feedback
 */

//#include <Logger.h>
#include <Wire.h>
 
/*
 * Fields
 */
// KY-037 High Sensitivity Sound Detection Module
const byte MIC_D0_PIN = 3;  // digital interface
const int MIC_A0_PIN = A0;  // analog interface

// ADXL345 Accelerometer
const int ADXL345 = 0x53; // Sensor I2C address
float xa_out_1; 
float ya_out_1;
float za_out_1;

// Vibration Motor Module
const byte MOTOR_PIN_1 = 11;

// Diodes
const byte LED_PIN = 2;   // blue led

// Declare the local logger function before it is called.
//void localLogger(Logger::Level level, const char* module, const char* message);

/*
 * Setup
 */
void setup() {
  // Inputs
  pinMode(MIC_D0_PIN, INPUT);
  pinMode(MIC_A0_PIN, INPUT);

  // Outputs
  pinMode(LED_PIN, OUTPUT);
  pinMode(MOTOR_PIN_1, OUTPUT);

  // Open serial port
  Serial.begin(9600);
  //Serial.begin(115200);

  // Initiate Wire library
  Wire.begin();
  // Set ADXL345 in measuring mode
  Wire.beginTransmission(ADXL345); // Start communicating with the device 
  Wire.write(0x2D); // Access/ talk to POWER_CTL Register - 0x2D
  // Enable measurement
  Wire.write(8); // (8dec -> 0000 1000 binary) Bit D3 High for measuring enable 
  Wire.endTransmission();
  delay(10);

  /*
  Logger::setLogLevel(Logger::WARNING);

  Logger::verbose("setup()", "This is a verbose message.");
  Logger::notice("setup()", "This is a notice message.");
  Logger::warning("setup()", "This is a warning message.");
  Logger::error("setup()", "This is a error message.");
  Logger::fatal("setup()", "This is a fatal error message.");

  Logger::setLogLevel(Logger::VERBOSE);

  Logger::setOutputFunction(localLogger);

  Logger::verbose("setup()", "This is a verbose message.");
  Logger::notice("setup()", "This is a notice message.");
  Logger::warning("setup()", "This is a warning message.");
  Logger::error("setup()", "This is a error message.");
  Logger::fatal("setup()", "This is a fatal error message.");
  */
}

/*
 * Loop
 */
void loop() {
  int mic_digital_val;
  float mic_analog_val;
    
  // Current values are read out --> voltage
  mic_digital_val = digitalRead(MIC_D0_PIN);
  mic_analog_val = analogRead(MIC_A0_PIN) * (5.0 / 1023.0);

  // LED feedback from sound detection module
  if (mic_digital_val == 1) {
    digitalWrite(LED_PIN, HIGH);
  }
  else {
    digitalWrite(LED_PIN, LOW);
  }

  // SOURCE: https://howtomechatronics.com/tutorials/arduino/how-to-track-orientation-with-arduino-and-adxl345-accelerometer/
  // Read accelerometer
  Wire.beginTransmission(ADXL345);
  Wire.write(0x32); // Start with register 0x32 (ACCEL_XOUT_H)
  Wire.endTransmission(false);
  Wire.requestFrom(ADXL345, 6, true); // Read 6 registers total, each axis value is stored in 2 registers
  xa_out_1 = ( Wire.read()| Wire.read() << 8); // x-axis value
  xa_out_1 = xa_out_1/256; // for a range of +-2g, we need to divide the raw values by 256, according to the datasheet
  ya_out_1 = ( Wire.read()| Wire.read() << 8); // Y-axis value
  ya_out_1 = ya_out_1/256;
  za_out_1 = ( Wire.read()| Wire.read() << 8); // Z-axis value
  za_out_1 = za_out_1/256;

  //
  Serial.println("[ADXL345 Accelerometer]");
  Serial.print("xa_out_1= ");
  Serial.print(xa_out_1);
  Serial.print("   ya_out_1= ");
  Serial.print(ya_out_1);
  Serial.print("   za_out_1= ");
  Serial.println(za_out_1);

  // NOTE: 2.5 V seems to be a decent default value in relation 
  //       to the current level of resistance
  
  Serial.println("[KY-037 Sound Detection]");
  Serial.print("Analog voltage value: ");
  Serial.print(mic_analog_val, 4);
  Serial.print(" V, \t Threshold value: ");
  Serial.println(mic_digital_val);
  Serial.println("----------------------------------------------------------------");
  delay(1000);
}

/*
void localLogger(Logger::Level level, const char* module, const char* message)
{
  Serial.print(F("LocalLogger: ["));

  Serial.print(Logger::asString(level));

  Serial.print(F("] "));

  if (strlen(module) > 0)
  {
      Serial.print(F(": "));
      Serial.print(module);
      Serial.print(" ");
  }

  Serial.println(message);
}
*/
