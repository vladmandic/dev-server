import * as fs from 'fs';
import * as log from '@vladmandic/pilogger';
import { program as commander } from 'commander';
import * as helpers from './helpers';
import * as main from './build';

/**
 * Runs build in cli mode
 *
 * Usage: build [options] [command]
 *
 * **Options:**
 * - `-c`, `--config` `<file>`  specify alternative config file
 * - `-d`, `--debug`            enable debug output
 * - `-g`, `--generate`         generate config files from templates
 * - `-h`, `--help`             display help for command
 *
 * **Commands:**
 * - `development`          start development ci
 * - `production`           start production build
 * - `config`               show active configuration and exit
 * - `help [command]`       display help for command
 */
export function run() {
  const build = new main.Build();

  log.header();
  if (build.environment.tsconfig) (build.config.build.global as Record<string, unknown>)['tsconfig'] = 'tsconfig.json';
  // let params: Record<string, unknown> = {};
  commander.option('-c, --config <file>', 'specify config file');
  commander.option('-d, --debug', 'enable debug output');
  commander.option('-g, --generate', 'generate config files from templates');
  commander.option('-p, --profile <profile>', 'run build for specific profile');
  commander.parse(process.argv);
  build.params = { ...build.params, ...commander.opts() };
  if (build.params.debug) {
    log.info('Debug output:', build.params.debug);
    build.config.log.debug = true;
  }
  if (build.params.generate) {
    log.info('Generate config files:', build.params.generate);
    build.config['generate'] = true;
  }
  if (build.params.config && build.params.config !== '') {
    if (fs.existsSync(build.params.config as string)) {
      const data = fs.readFileSync(build.params.config as string);
      try {
        build.config = helpers.merge(build.config, JSON.parse(data.toString()));
        log.info('Parsed config file:', build.params.config, build.config);
      } catch {
        log.error('Error parsing config file:', build.params.config);
      }
    } else {
      log.error('Config file does not exist:', build.params.config);
    }
  }
  if (!build.params.profile) {
    log.error('Profile not specified');
  } else if (!build.config.profiles) {
    log.error('Profiles not configured');
  } else if (!Object.keys(build.config.profiles).includes(build.params.profile as string)) {
    log.error('Profile not found:', build.params.profile);
  } else {
    build.run(build.params.profile as string);
  }
}

exports.run = run;