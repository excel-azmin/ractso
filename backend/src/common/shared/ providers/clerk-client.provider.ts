import {
  CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY,
  EnvConfigService,
} from '@/common/config/env/env-config.service';
import { createClerkClient } from '@clerk/backend';

export const ClerkClientProvider = {
  provide: 'ClerkClient',
  useFactory: (configService: EnvConfigService) => {
    return createClerkClient({
      publishableKey: configService.get(CLERK_PUBLISHABLE_KEY),
      secretKey: configService.get(CLERK_SECRET_KEY),
    });
  },
  inject: [EnvConfigService],
};
