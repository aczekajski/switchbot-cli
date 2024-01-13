# switchbot-cli

This is a very simple CLI tool to interact with SwitchBot API. Binaries are provided in [Releases page](https://github.com/aczekajski/switchbot-cli/releases) so it's ready to use.

## Usage
### Authentication
There are three ways in which you can provide authentication data for your requests:
1. Save it to local file using [Save auth info](#save-auth-info) command
1. Pass it as an argument using `--auth=TOKEN,SECRET` option before the main command ([how to obtain secret and token from app](https://support.switch-bot.com/hc/en-us/articles/12822710195351-How-to-obtain-a-Token-)). Example:
    ```bash
    switchbot-cli --auth=qwertyuiop124567890,asdfghjkl devices
    ```
1. Provide it each time you execute the command using `--authInteractive` option before the main command. Program will ask you to provide them before executing the request. Example:
    ```bash
    switchbot-cli --authInteractive scenes
    ```

### Save auth info
Run below command to save authentication data for your SwitchBot account:
```
switchbot-cli config auth
```
> ⚠ Warning! The token and secret involved in this step are sensitive data! They will be stored in file named `SWITCHBOT-AUTH` in the current working directory (folder you're running the command from). Plase make sure it is not exposed to 3rd parties and remains safe!

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

> Seems that pressing some predefined buttons on infrared devices is not possible at the moment as they are not listed in API docs and are not reacting to calling the button by its name. If you want to press such button via API, create a custom button with the same function or a manual scene that presses the desired button.

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

## Development
Requires `nodeJS` 14+.

Can be run as `node index.js` during development.

Building binaries requires `pkg` (`npm i -g pkg`).

To build:
```
./build.sh
```
(on Windows use git-bash or WSL)