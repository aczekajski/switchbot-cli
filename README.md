# switchbot-cli

This is a very simple CLI tool to interact with SwitchBot API.

## Usage

### List all devices
```bash
switchbot-cli devices
```

### Get status of the device
```bash
switchbot-cli devices DEVICEID
```
- `DEVICEID` is an ID that can be obtained from the list of all devices

This works only with physical SwitchBot devices. Will not work with virtual infrared remote controlled devices. See the supported list here: https://github.com/OpenWonderLabs/SwitchBotAPI?tab=readme-ov-file#description-1

### Send command to device
```bash
switchbot-cli devices DEVICEID COMMAND [PARAMETERS]
```
- `DEVICEID` is an ID that can be obtained from the list of all devices
- `COMMAND`  is a device-specific command that can be sent to this particular device. Refer to [list of physical devices](https://github.com/OpenWonderLabs/SwitchBotAPI?tab=readme-ov-file#command-set-for-physical-devices) or [list of infrared remote controlled devices](https://github.com/OpenWonderLabs/SwitchBotAPI?tab=readme-ov-file#command-set-for-virtual-infrared-remote-devices) for available commands (see "Command" in the tables there). Hint: many devices support `turnOn` and `turnOff` so you can start from these 😊
- `PARAMETERS`  is a device-and-command-specific parameters that can be sent together with the current command. Refer to [list of physical devices](https://github.com/OpenWonderLabs/SwitchBotAPI?tab=readme-ov-file#command-set-for-physical-devices) or [list of infrared remote controlled devices](https://github.com/OpenWonderLabs/SwitchBotAPI?tab=readme-ov-file#command-set-for-virtual-infrared-remote-devices) for needed params (see "command parameter" in the tables there). If it says `default`, you can omit `PARAMETERS`

Examples:

```bash
switchbot-cli devices QWEASDZXCQWEASDZXC turnOff
switchbot-cli devices ASDZXCQWEASDZXCQWE setBrightness 90
```

### Push a custom button on virtual infrared remote controller
```bash
switchbot-cli devices DEVICEID "custom/BUTTONNAME"
```
- `DEVICEID` is an ID that can be obtained from the list of all devices
- `BUTTONNAME` is a literal name of custom button as seen in switchbot app

### List all scenes
```bash
switchbot-cli scenes
```
This refers to manually executable scenes, not "automations".

### Execute scene
```bash
switchbot-cli scenes SCENEID
```
- `SCENEID` is an ID that can be obtained from the list of all scenes