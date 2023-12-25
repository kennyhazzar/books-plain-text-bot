export class CommonConfigs {
  port: number;
  appUrl: string;
}

export class DatabaseConfigs {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export class TelegrafConfigs {
  token: string;
  url: string;
}

export class RedisConfigs {
  host: string;
  port: number;
}
