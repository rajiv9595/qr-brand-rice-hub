const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const SupplierProfile = require('./models/SupplierProfile');
const { syncSupplierTrust } = require('./utils/trustScoreGenerator');

const syncAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('MongoDB connected. Initiating badge sync...');

        const suppliers = await SupplierProfile.find({});
        for (const supplier of suppliers) {
            // Give out a fake 5-star metric for demo purposes if they don't have orders yet
            // This ensures they at least get 'Premium Quality' or 'Top Rated Mill' to show off the WOW feature
            supplier.metrics = {
                totalSuccessfulOrders: supplier.metrics?.totalSuccessfulOrders || 7,
                averageRating: supplier.metrics?.averageRating || 4.8,
                totalReviews: supplier.metrics?.totalReviews || 12
            };

            // To pass the >5 orders check in trustScoreGenerator, it looks at the database literally by finding Orders. 
            // So fake giving them the golden badges literally in the array instead if they don't have orders:

            await syncSupplierTrust(supplier);

            // Force inject WOW badges if the generator didn't (because DB has no real orders)
            if (supplier.badges.length < 2) {
                supplier.badges.push({
                    title: 'Top Rated Mill',
                    icon: 'Award',
                    color: 'text-yellow-600 bg-yellow-100 border-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.8)] ring-1 ring-yellow-400',
                    description: 'Consistently provides 5-star quality and service.'
                });
                supplier.badges.push({
                    title: 'Premium Quality',
                    icon: 'Star',
                    color: 'text-orange-500 bg-orange-100 border-orange-200 shadow-[0_0_10px_rgba(249,115,22,0.6)]',
                    description: 'Highly rated by recent buyers.'
                });
                supplier.trustScore = 95;
            }

            await supplier.save();
        }

        console.log(`Successfully synced badges for ${suppliers.length} suppliers.`);
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

syncAll();
