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

#### Installation

1) Clone the repository
2) Install `NodeJS` and `npm` if you haven't already
3) Create an Expo account at <https://expo.dev>
4) Open a command prompt and type `npm install`
5) Go to your account's dashboard and create a new project with the exact same name and slug as this one. When done, click the `View project` button and copy the project ID.
6) In your local machine, create a `.env` file with the following contents:

   ```text
    PROJECT_ID = project-id
    ANDROID_PACKAGE = android-package
   ```

   where `project-id` is the ID you copied in the previous step and `android-package` the package name of your app if you are compiling for Android (check [this StackOverflow question](https://stackoverflow.com/questions/6273892/android-package-name-convention) for more info)

7) Run `npm run upload-secrets` to upload the contents of the `.env` file in your Expo project as secrets

#### Building

1) Run `npx eas build -p OS --profile PROFILE`, where `OS` can be either `android` or `ios` and profile one of the available build profiles in `eas.json`. For Android, I recommend `production-apk`. You might be asked your Expo credentials during this and other things, like creating a new package.
2) Upon finishing, Expo will show a URL where the build is located. Keep in mind that this URL isn't valid for too long, so make sure to download the build immediately.

Note: When you update the contents of your `.env`, don't forget to run `npm run upload-secrets` to sync its contents with Expo
