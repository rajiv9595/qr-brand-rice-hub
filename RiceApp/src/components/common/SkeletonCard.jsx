// RiceApp/src/components/common/SkeletonCard.jsx
// Professional shimmering skeleton loader for rice listings. 
// Provides an "instant" feel while data is fetching from the backend.

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const SkeletonCard = ({ width = 240, height = 280 }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={[styles.card, { width, height }]}>
      {/* SHIMMER OVERLAY */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ translateX }],
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            zIndex: 1,
          },
        ]}
      />
      
      {/* MOCK IMAGE */}
      <View style={styles.imgMock} />
      
      {/* MOCK TEXT LINES */}
      <View style={styles.padding}>
        <View style={styles.titleMock} />
        <View style={styles.subTitleMock} />
        <View style={styles.priceRowMock}>
             <View style={styles.priceMock} />
             <View style={styles.badgeMock} />
        </View>
        <View style={[styles.subTitleMock, { width: '40%', marginTop: 12 }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imgMock: {
    width: '100%',
    height: 130,
    backgroundColor: '#E5E7EB',
  },
  padding: {
    padding: 12,
  },
  titleMock: {
    width: '80%',
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  subTitleMock: {
    width: '60%',
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 4,
  },
  priceRowMock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  priceMock: {
    width: '30%',
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  badgeMock: {
    width: 50,
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
});

export default SkeletonCard;
