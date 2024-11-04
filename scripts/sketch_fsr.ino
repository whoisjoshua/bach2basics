/*
 * FSR Glove Test
 * 
 */

// FSR TEST
//  - Datasheet: (https://cdn.velleman.eu/downloads/25/infosheets/fsr_datasheet.pdf)
//  - 1k to 100k ohms depending on sens
//      [ ] 1K
//      [ ] 5K
//      [X] 10K
//      [ ] 20K
//      [ ] 50K
const int FSR_PINS[] = {A0, A1, A2, A3, A4};
const int NUM_FSR = sizeof(FSR_PINS) / sizeof(FSR_PINS[0]);


void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
}

void loop() {

  for (int i = 0; i < NUM_FSR; i++) {
    float fsr_val = analogRead(FSR_PINS[i]);
    if (fsr_val != 0) {
      Serial.print("FSR ");
      Serial.print(i);
      Serial.print(": ");
      Serial.println(fsr_val);
    }
  }
  
}
