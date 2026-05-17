import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, getAge, isBirthdayToday, daysUntilBirthday } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const heart1 = useRef(new Animated.Value(0)).current;
  const heart2 = useRef(new Animated.Value(0)).current;
  const heart3 = useRef(new Animated.Value(0)).current;
  const age = getAge();
  const isBirthday = isBirthdayToday();
  const daysLeft = daysUntilBirthday();

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const pulseHearts = () => {
      Animated.sequence([
        Animated.timing(heart1, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(heart2, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(heart3, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(heart1, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(heart2, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(heart3, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ]).start(() => pulseHearts());
    };
    pulseHearts();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.heartsContainer}>
        {[heart1, heart2, heart3].map((anim, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.floatingHeart,
              {
                opacity: anim,
                transform: [{ scale: anim }],
                left: 30 + i * 100,
                top: 80 + i * 60,
              },
            ]}
          >
            💖
          </Animated.Text>
        ))}
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.youAre}>You are</Text>
        <Text style={styles.myWorld}>My World</Text>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Text style={styles.globeEmoji}>🌍</Text>
        </Animated.View>

        {isBirthday ? (
          <View style={styles.birthdayBox}>
            <Text style={styles.confetti}>🎉🎂🎉</Text>
            <Text style={styles.birthdayText}>
              Happy {age}
              {age === 20 ? 'th' : age === 21 ? 'st' : age === 22 ? 'nd' : age === 23 ? 'rd' : 'th'} Birthday, Raisa!
            </Text>
            <Text style={styles.birthdaySubtext}>
              You are the best thing that ever happened to me.
            </Text>
            <Text style={styles.confetti}>🎈💝🎈</Text>
          </View>
        ) : (
          <View style={styles.birthdayBox}>
            <Text style={styles.ageText}>
              Raisa, you're {age} and you're my everything.
            </Text>
            <Text style={styles.countdownText}>
              {daysLeft} days until your {age + 1}
              {age + 1 === 21 ? 'st' : age + 1 === 22 ? 'nd' : age + 1 === 23 ? 'rd' : 'th'} birthday 💕
            </Text>
          </View>
        )}
      </Animated.View>

      <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => router.push('/globe')}
          activeOpacity={0.8}
        >
          <Text style={styles.continueText}>Continue</Text>
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>
        <Text style={styles.tapHint}>tap to enter your world</Text>
      </Animated.View>
    </View>
  );
}

function getOrdinal(n: number): string {
  if (n === 20 || n === 30) return 'th';
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
  return suffixes[n] || 'th';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a001a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  heartsContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  floatingHeart: {
    position: 'absolute',
    fontSize: 28,
  },
  content: {
    alignItems: 'center',
  },
  youAre: {
    fontSize: 28,
    color: COLORS.primaryLight,
    fontFamily: undefined,
    letterSpacing: 3,
    marginBottom: 4,
  },
  myWorld: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
    textShadowColor: 'rgba(255,105,180,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  globeEmoji: {
    fontSize: 80,
    marginVertical: 20,
  },
  birthdayBox: {
    backgroundColor: 'rgba(255,105,180,0.12)',
    borderRadius: 20,
    padding: 24,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,105,180,0.3)',
    maxWidth: width * 0.85,
  },
  confetti: {
    fontSize: 24,
    letterSpacing: 8,
  },
  birthdayText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginVertical: 8,
  },
  birthdaySubtext: {
    fontSize: 15,
    color: COLORS.primaryLight,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  ageText: {
    fontSize: 18,
    color: COLORS.primaryLight,
    textAlign: 'center',
    lineHeight: 26,
  },
  countdownText: {
    fontSize: 14,
    color: 'rgba(255,182,193,0.7)',
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  continueText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 1,
    marginRight: 8,
  },
  arrowText: {
    fontSize: 22,
    color: COLORS.white,
  },
  tapHint: {
    fontSize: 12,
    color: 'rgba(255,182,193,0.5)',
    marginTop: 12,
    letterSpacing: 2,
  },
});
