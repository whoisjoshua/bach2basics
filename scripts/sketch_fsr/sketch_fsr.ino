/*
 * FSR Glove Test
 * 
 */

/*
 * Fields
 */
// FSR D9-16
//  - Datasheet for D9-40: (https://cdn.velleman.eu/downloads/25/infosheets/fsr_datasheet.pdf)
//  - 1k to 100k ohms depending on sens
//      [ ] 1K
//      [ ] 5K
//      [X] 10K
//      [ ] 20K
//      [ ] 50K
const float FSR_SENS = 20.0
const int FSR_PINS[] = {A1, A2, A3, A4, A5};
const int NUM_FSR = sizeof(FSR_PINS) / sizeof(FSR_PINS[0]);

const byte LED_PINS[] = {13, 12, 11, 10, 9};
const int NUM_LED = sizeof(LED_PINS) / sizeof(LED_PINS[0]);

/*
 * Setup 
 */
void setup() {
  Serial.begin(9600);

  // Setup all 5 LEDs
  for (int i = 0; i < NUM_LED; i++) {
    pinMode(LED_PINS[i], OUTPUT);
  }
}

/*
 * Loop
 */
void loop() {
  
  // Detect finger presses 
  for (int i = 0; i < NUM_FSR; i++) {
    float fsr_val = analogRead(FSR_PINS[i]);

    // TODO: Map potentiometer value to adjust this value for testing/calibration
    //       OR maybe have a calibration button phase (only if there is time)
    if (fsr_val >= FSR_SENS) {
      // Power LED as a notification
      digitalWrite(LED_PINS[i], HIGH);
      
      Serial.print("[FSR A");
      Serial.print(i+1);  // A1-A5
      Serial.print("]: ");
      Serial.println(fsr_val);
    }
    else {
      digitalWrite(LED_PINS[i], LOW);
    }
  }
  
}
