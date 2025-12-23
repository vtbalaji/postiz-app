import { initializeSentry } from '@gitroom/nestjs-libraries/sentry/initialize.sentry';
initializeSentry('backend', true);

import { loadSwagger } from '@gitroom/helpers/swagger/load.swagger';
import { json } from 'express';

process.env.TZ = 'UTC';

import cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { SubscriptionExceptionFilter } from '@gitroom/backend/services/auth/permissions/subscription.exception';
import { HttpExceptionFilter } from '@gitroom/nestjs-libraries/services/exception.filter';
import { ConfigurationChecker } from '@gitroom/helpers/configuration/configuration.checker';
import { startMcp } from '@gitroom/nestjs-libraries/chat/start.mcp';

async function start() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    cors: {
      ...(!process.env.NOT_SECURED ? { credentials: true } : {}),
      allowedHeaders: ['Content-Type', 'Authorization', 'x-copilotkit-runtime-client-gql-version'],
      exposedHeaders: [
        'reload',
        'onboarding',
        'activate',
        'x-copilotkit-runtime-client-gql-version',
        ...(process.env.NOT_SECURED ? ['auth', 'showorg', 'impersonate'] : []),
      ],
      origin: [
        process.env.FRONTEND_URL,
        'http://localhost:6274',
        ...(process.env.MAIN_URL ? [process.env.MAIN_URL] : []),
      ],
    },
  });

  await startMcp(app);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  app.use('/copilot/*', (req: any, res: any, next: any) => {
    json({ limit: '50mb' })(req, res, next);
  });

  app.use(cookieParser());
  app.useGlobalFilters(new SubscriptionExceptionFilter());
  app.useGlobalFilters(new HttpExceptionFilter());

  loadSwagger(app);

  // Use BACKEND_PORT if set, otherwise fall back to PORT, then 3000
  // This allows frontend to use PORT for Railway, while backend uses BACKEND_PORT
  // Force backend to always use port 3000 when PORT=4200 to avoid conflicts
  const port = process.env.BACKEND_PORT || (process.env.PORT !== '4200' ? process.env.PORT : null) || 3000;

  try {
    await app.listen(port);

    logEnvironmentVariables(); // Log environment variables for debugging
    checkConfiguration(); // Do this last, so that users will see obvious issues at the end of the startup log without having to scroll up.

    Logger.log(`🚀 Backend is running on: http://localhost:${port}`);
  } catch (e) {
    Logger.error(`Backend failed to start on port ${port}`, e);
  }
}

function checkConfiguration() {
  const checker = new ConfigurationChecker();
  checker.readEnvFromProcess();
  checker.check();

  if (checker.hasIssues()) {
    for (const issue of checker.getIssues()) {
      Logger.warn(issue, 'Configuration issue');
    }

    Logger.warn('Configuration issues found: ' + checker.getIssuesCount());
  } else {
    Logger.log('Configuration check completed without any issues');
  }
}

function logEnvironmentVariables() {
  Logger.log('=== ENVIRONMENT VARIABLES (first 10 chars for security) ===');
  const envVars = Object.keys(process.env)
    .filter(key => !key.startsWith('npm_') && !key.startsWith('_'))
    .sort();

  for (const key of envVars) {
    const value = process.env[key];
    if (value) {
      const displayValue = value.length > 10 ? value.substring(0, 10) + '***' : value;
      Logger.log(`${key}=${displayValue}`);
    } else {
      Logger.log(`${key}=(empty)`);
    }
  }
  Logger.log('=== END ENVIRONMENT VARIABLES ===');
}

start();
