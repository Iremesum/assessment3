import {
  Sequelize,
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';

import path from 'path';
import sqlite3 from 'sqlite3';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: sqlite3,
  storage: path.resolve('./sqlite/dev.sqlite'),
  logging: false,
});

export class Feed extends Model<
  InferAttributes<Feed>,
  InferCreationAttributes<Feed>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: CreationOptional<string | null>;
  declare status: 'active' | 'inactive';
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Feed.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Feed',
    tableName: 'Feeds',
    timestamps: true,
  }
);

export class Post extends Model<
  InferAttributes<Post>,
  InferCreationAttributes<Post>
> {
  declare id: CreationOptional<number>;
  declare feedId: ForeignKey<Feed['id']> | null;
  declare title: string;
  declare author: string;
  declare content: string;
  declare summary: string;
  declare imageUrl: CreationOptional<string | null>;
  declare link: CreationOptional<string | null>;
  declare status: 'published' | 'draft';
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    feedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Feed,
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    summary: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('published', 'draft'),
      allowNull: false,
      defaultValue: 'published',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Post',
    tableName: 'Posts',
    timestamps: true,
  }
);

export class RequestLog extends Model<
  InferAttributes<RequestLog>,
  InferCreationAttributes<RequestLog>
> {
  declare id: CreationOptional<number>;
  declare feedId: ForeignKey<Feed['id']> | null;
  declare clientId: CreationOptional<string | null>;
  declare endpoint: string;
  declare statusCode: number;
  declare responseTimeMs: number;
  declare requestedAt: CreationOptional<Date>;
}

RequestLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    feedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Feed,
        key: 'id',
      },
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    endpoint: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    statusCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    responseTimeMs: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    requestedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'RequestLog',
    tableName: 'RequestLogs',
    timestamps: false,
  }
);

Feed.hasMany(Post, {
  foreignKey: 'feedId',
  as: 'posts',
});

Post.belongsTo(Feed, {
  foreignKey: 'feedId',
  as: 'feed',
});

Feed.hasMany(RequestLog, {
  foreignKey: 'feedId',
  as: 'requestLogs',
});

RequestLog.belongsTo(Feed, {
  foreignKey: 'feedId',
  as: 'feed',
});