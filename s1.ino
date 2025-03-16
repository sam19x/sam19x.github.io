#include <Servo.h>

Servo myservo;  // Create servo object to control a servo

void setup() {
  Serial.begin(9600);
  myservo.attach(9);  // Attach the servo to pin 9
}

void loop() {
  if (Serial.available()) {
        char command = Serial.read();
        if (command == 'M') {  // Move servo when receiving 'M'
            myservo.write(150);
            delay(200);
            myservo.write(60);
            delay(200);
  // for (int pos = 0; pos <= 180; pos += 3) { // Increase step size for faster movement
  //   myservo.write(pos); 
  //   delay(5); // Reduced delay for faster response
  // }
  // for (int pos = 360; pos >= 180; pos -=3) { 
  //   myservo.write(pos); 
  //   delay(5);
  // }
}
