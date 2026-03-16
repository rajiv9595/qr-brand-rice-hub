// navigation/RootNavigator.jsx
// Checks AsyncStorage for token → shows Auth stack or App tabs

import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext }                from '../context/AuthContext';
import AuthStack                      from './AuthStack';
import BuyerTabs                      from './BuyerTabs';
import TraderTabs                     from './TraderTabs';

// Buyer Screens
import SearchType        from '../screens/buyer/SearchType';
import SearchQuantity    from '../screens/buyer/SearchQuantity';
import NearbyShops       from '../screens/buyer/NearbyShops';
import OrderConfirm      from '../screens/buyer/OrderConfirm';
import RiceDetail        from '../screens/buyer/RiceDetail';

// Trader Screens
import TraderSetup       from '../screens/trader/TraderSetup';
import AddProduct        from '../screens/trader/AddProduct';
import EditProduct       from '../screens/trader/EditProduct';
import MyListings        from '../screens/trader/MyListings';

const Stack = createNativeStackNavigator();

const BuyerAppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BuyerTabs" component={BuyerTabs} />
    <Stack.Screen name="SearchType" component={SearchType} />
    <Stack.Screen name="SearchQuantity" component={SearchQuantity} />
    <Stack.Screen name="NearbyShops" component={NearbyShops} />
    <Stack.Screen name="OrderConfirm" component={OrderConfirm} />
    <Stack.Screen name="RiceDetail" component={RiceDetail} />
    <Stack.Screen name="ListingDetail" component={RiceDetail} />
  </Stack.Navigator>
);

const TraderAppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TraderTabs" component={TraderTabs} />
    <Stack.Screen name="TraderSetup" component={TraderSetup} />
    <Stack.Screen name="AddProduct" component={AddProduct} />
    <Stack.Screen name="EditProduct" component={EditProduct} />
    <Stack.Screen name="MyListings" component={MyListings} />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null; // Splash screen handles this

  // Conditionally render SCREENS instead of NAVIGATORS
  // This prevents react-native-screens from freezing touches on Android during auth swap
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : user.role === 'supplier' ? (
        <Stack.Screen name="TraderApp" component={TraderAppStack} />
      ) : (
        <Stack.Screen name="BuyerApp" component={BuyerAppStack} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
