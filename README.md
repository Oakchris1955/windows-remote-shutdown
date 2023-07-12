# Remote shutdown for Windows

## Usage

### Server

1) Clone the repository in the directory of your choice
2) Press <kbd>Win</kbd>+<kbd>R</kbd>, type `shell:startup` and press <kbd>Enter</kbd>
3) Create a shortcut in the folder File Explorer just opened that points to `server/startup.vbs`
4) Create a `server/AUTH_TOKEN` file, inside of which you should put your authorization token
5) Create a `.env` file, inside of which you should type:

    ```text
    PORT = port_number
    ```

    where `port_number` is the number of the port you want the server to listen to (I use 8600)

### Mobile app

1) Clone the repository
2) Install `NodeJS` and `npm` if you haven't already
3) Create an Expo account at <https://expo.dev>
4) Open a command prompt and type `npm install`
5) Run `npx eas build -p OS --profile PROFILE`, where `OS` can be either `android` or `ios` and profile one of the available build profiles in `eas.json`. For Android, I recommend `production-apk`. You might be asked your Expo credentials during this and other things, like creating a new package.
6) Upon finishing, Expo will show a URL where the build is located. Keep in mind that this URL isn't valid for too long, so make sure to download the build immediately.

Note: Upon finishing this process, your app.json might be updated, specifically the `android.package` and `extra.eas.packageId` fields. If you want, you can create a `.env` file inside the `mobile-app` directory and set the `ANDROID_PACKAGE` and `PROJECT_ID` fields respectively
