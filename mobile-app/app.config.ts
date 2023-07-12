import { ExpoConfig, ConfigContext } from 'expo/config';
import 'dotenv/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    android: {
        package: process.env.ANDROID_PACKAGE,
        ...config.android
    },
    extra: {
        eas: {
            projectId: process.env.PROJECT_ID,
            ...config.extra?.eas
        },
        ...config.extra
    },
    name: config.name as string,
    slug: config.slug as string,
    ...config
});