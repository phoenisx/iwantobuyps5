import bunyan from 'bunyan';

export const logger = bunyan.createLogger({
  name: 'iwantobuyps5',
  level: 'debug',
});
