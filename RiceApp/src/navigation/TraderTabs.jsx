// navigation/TraderTabs.jsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '../theme/colors';
import { useLang } from '../context/LangContext';

import TraderDashboard from '../screens/trader/TraderDashboard';
import MyListings from '../screens/trader/MyListings';
import TraderOrders from '../screens/trader/TraderOrders';
import TraderProfile from '../screens/trader/TraderProfile';

import { Text } from 'react-native';

const Tab = createBottomTabNavigator();

const TraderTabs = () => {
  const { t } = useLang();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#AAAAAA',
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: '#FFFFFF',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={TraderDashboard} 
        options={{ 
          title: t('navHome') || 'హోమ్',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>📊</Text> 
        }} 
      />
      <Tab.Screen 
        name="Listings"  
        component={MyListings}      
        options={{ 
          title: t('navMyRice') || 'నా బియ్యం',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🍚</Text> 
        }} 
      />
      <Tab.Screen 
        name="Orders"    
        component={TraderOrders}    
        options={{ 
          title: t('navOrders') || 'ఆర్డర్లు',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>📦</Text> 
        }} 
      />
      <Tab.Screen 
        name="Profile"   
        component={TraderProfile}   
        options={{ 
          title: t('navProfile') || 'ప్రొఫైల్',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🏪</Text> 
        }} 
      />
    </Tab.Navigator>
  );
};

export default TraderTabs;
