# Ionic BLE Scanner

This is an Ionic 1 application that utilizes Cordova plugins to be able to scan for BLE beacons

Once cloning the repository and going into the directory, you must execute the following commands in order to build/deploy:

```bash
npm install
bower install
ionic platform add android@6.2.1
ionic build android
ionic run android
```

NOTE: You must have an Android device actually connected to your computer via USB for the `ionic run android` command to deploy to your device.

I have not tested this with iOS, but it should work there as well.
