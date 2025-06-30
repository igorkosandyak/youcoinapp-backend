import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.logger.log('🔧 Initializing MongoDB database service...');
  }

  async onModuleInit() {
    try {
      await this.testConnection();
    } catch (error) {
      this.logger.error('❌ Failed to initialize database service:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('🛑 Shutting down database service...');
    try {
      if (this.connection && this.connection.readyState === 1) {
        await this.connection.close();
        this.logger.log('✅ MongoDB connection closed gracefully');
      }
    } catch (error) {
      this.logger.error('❌ Error during database service shutdown:', error);
    }
  }

  private async testConnection(): Promise<void> {
    try {
      await this.connection.db.admin().ping();

      const dbName = this.connection.db.databaseName;

      this.logger.log(`✅ MongoDB connection test successful, 📊 Database: ${dbName}`);
    } catch (error) {
      this.logger.error('❌ MongoDB connection test failed:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
    details?: any;
  }> {
    try {
      if (!this.connection || this.connection.readyState !== 1) {
        return {
          status: 'unhealthy',
          message: 'MongoDB connection not established',
        };
      }

      // Test connection with ping
      await this.connection.db.admin().ping();

      // Get database stats
      const stats = await this.connection.db.stats();

      return {
        status: 'healthy',
        message: 'MongoDB connection is working',
        details: {
          database: this.connection.db.databaseName,
          collections: stats.collections,
          dataSize: stats.dataSize,
          storageSize: stats.storageSize,
          indexes: stats.indexes,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `MongoDB connection failed: ${error.message}`,
      };
    }
  }

  getConnection(): Connection {
    return this.connection;
  }

  isConnected(): boolean {
    return this.connection && this.connection.readyState === 1;
  }
}
