/*
 * Photoresistor Glove Test
 * 
 */

/*
 * Fields
 */
const int PHOTORESISTOR_PINS[] = {A0, A1, A2, A3, A4};   
const int NUM_PHOTORESISTORS = sizeof(PHOTORESISTOR_PINS) / sizeof(PHOTORESISTOR_PINS[0]);
const byte LED_PINS[] = {2, 3, 4, 5, 6}; 

int photoresistor_vals[NUM_PHOTORESISTORS];

/*
 * Setup
 */
void setup() {
  Serial.begin(9600);

  // NOTE: sizeof() returns the size of an array in terms of bytes only.
  //       Do not use for other cases if type is not bytes.
  for (int i = 0; i < sizeof(LED_PINS); i++) {
    pinMode(LED_PINS[i], OUTPUT);
  }
}

/*
 * Loop
 */
void loop() {
  for (int i = 0; i < NUM_PHOTORESISTORS; i++) {
    int photoresistor_vals[i] = analogRead(PHOTORESISTOR_PIN[i]); // NOTE: Maybe I omit saving if measurement latency is an issue?
    Serial.print("[INFO] Photoresistor Val ");
    Serial.print(i);
    Serial.print(": ");
    Serial.println(photoresistor_vals[i]);

    if (photoresistor_vals[i] > 450) {
      digitalWrite(LED_PIN, LOW);
    } 
    else {
      digitalWrite(LED_PIN,  HIGH);
    }
  }
}
