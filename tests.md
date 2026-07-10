### List all devices
```bash
switchbot-cli devices
```
OK
no auth OK

### Get status of the device
```bash
switchbot-cli devices DEVICEID
```
OK
no auth OK

### Send command to device
```bash
switchbot-cli devices DEVICEID COMMAND [PARAMETERS]
```
OK turnOn turnOff toggle
OK setAll with params
wrong command OK
wrong params OK setAll
no params OK setAll
no auth OK

### Push a custom button on virtual infrared remote controller
```bash
switchbot-cli devices DEVICEID "custom/BUTTONNAME"
```
OK no quotes
OK quotes
OK button with space in it
no auth OK
wrong cmd OK

COULDN'T RUN unicode button name like "custom/🎨"

### List all scenes
```bash
switchbot-cli scenes
```
OK
no credentials OK

### Execute scene
```bash
switchbot-cli scenes SCENEID
```
OK
no credentials OK
wrong sceneId OK