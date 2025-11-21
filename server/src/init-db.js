import { initDatabase } from './database.js';

initDatabase()
    .then(() => {
        console.log('Database setup completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Database setup failed:', error);
        process.exit(1);
    });