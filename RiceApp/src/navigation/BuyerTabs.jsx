// navigation/BuyerTabs.jsx
import React            from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors }       from '../theme/colors';
import { Typography }   from '../theme/typography';
import { useLang }      from '../context/LangContext';

import HomeScreen       from '../screens/buyer/HomeScreen';
import SearchVariety    from '../screens/buyer/SearchVariety';
import MyOrders         from '../screens/buyer/MyOrders';
import BuyerProfile     from '../screens/buyer/BuyerProfile';

import { Text }         from 'react-native';

const Tab = createBottomTabNavigator();

const BuyerTabs = () => {
  const { t } = useLang();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   Colors.primary,
        tabBarInactiveTintColor: '#AAAAAA',
        tabBarStyle: {
          height:            64,
          paddingBottom:     8,
          paddingTop:        6,
          borderTopWidth:    0.5,
          borderTopColor:    '#E0E0E0',
          backgroundColor:   '#FFFFFF',
        },
        tabBarLabelStyle: {
          fontSize:   10,
          fontWeight: 'bold',
          marginTop:  2,
        },
      }}
    >
      <Tab.Screen 
        name="Home"    
        component={HomeScreen}    
        options={{ 
          title: t('navHome') || 'హోమ్',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🏠</Text>
        }}    
      />
      <Tab.Screen 
        name="Search"  
        component={SearchVariety} 
        options={{ 
          title: t('navSearch') || 'వెతుకు',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🔍</Text> 
        }}  
      />
      <Tab.Screen 
        name="Orders"  
        component={MyOrders}      
        options={{ 
          title: t('navOrders') || 'ఆర్డర్లు',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>📦</Text> 
        }}  
      />
      <Tab.Screen 
        name="Profile" 
        component={BuyerProfile}  
        options={{ 
          title: t('navProfile') || 'ప్రొఫైల్',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>👤</Text> 
        }} 
      />
    </Tab.Navigator>
  );
};

export default BuyerTabs;
