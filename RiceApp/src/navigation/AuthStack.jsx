import React                                    from 'react';
import { createNativeStackNavigator }           from '@react-navigation/native-stack';
import LoginScreen                              from '../screens/auth/LoginScreen';
import OTPScreen                               from '../screens/auth/OTPScreen';
import RoleSelectScreen                        from '../screens/auth/RoleSelectScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login"      component={LoginScreen}      />
    <Stack.Screen name="OTP"        component={OTPScreen}        />
    <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
  </Stack.Navigator>
);

export default AuthStack;