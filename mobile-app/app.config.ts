import { ExpoConfig, ConfigContext } from 'expo/config';
require('dotenv').config();

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    android: {
        ...config.android,
        package: process.env.ANDROID_PACKAGE
    },
    extra: {
        ...config.extra,
        eas: {
            ...config.extra?.eas,
            projectId: process.env.PROJECT_ID
        }
    },
    name: config.name as string,
    slug: config.slug as string,
});