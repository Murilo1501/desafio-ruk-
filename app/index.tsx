import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {graphqlFetch}  from './../lib/helper'


const AUTH_MUTATION = `
  mutation Auth($loginUserInput: LoginUserInput!) {
    auth(loginUserInput: $loginUserInput) {
      id
      accessToken
    }
  }
`;

interface AuthResponseData {
  auth: {
    id: string;
    accessToken: string;
  };
}

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validateEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!text.trim()) {
      setErrors(prev => ({ ...prev, email: '' }));
    } else if (!emailRegex.test(text)) {
      setErrors(prev => ({ ...prev, email: 'Enter a valid email' }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }
    setEmail(text);
  };

  const validatePassword = (text: string) => {
    if (!text.trim()) {
      setErrors(prev => ({ ...prev, password: '' }));
    } else if (text.length < 5) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 5 characters' }));
    } else {
      setErrors(prev => ({ ...prev, password: '' }));
    }
    setPassword(text);
  };

  const handleSignIn = async () => {
    validateEmail(email);
    validatePassword(password);


    setLoading(true);
    try {
      const data = await graphqlFetch<AuthResponseData>(
        AUTH_MUTATION,
        { loginUserInput: { email, password } }
      );

      if (data.auth?.accessToken) {
        await AsyncStorage.setItem('authToken', data.auth.accessToken);
        router.replace('/dashboard');
      } else {
        Alert.alert('Login Error', 'Authentication failed, no token received.');
      }
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Nice to see you again</Text>

          <View>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="Email or phone number"
              placeholderTextColor="#999"
              value={email}
              onChangeText={validateEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              placeholder="Enter password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={validatePassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberContainer}
              onPress={() => setRememberMe(!rememberMe)}
              disabled={loading}
            >
              <View style={styles.checkbox}>
                {rememberMe && (
                  <Ionicons name="checkmark" size={14} color="#007AFF" />
                )}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity disabled={loading}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.signInButton, loading && styles.signInButtonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.signInButtonText}>Sign in</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
          
          </View>

          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>RUK</Text>
            <Text style={styles.logoSubtext}>SPORTING GOODS</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    fontSize: 15,
    color: '#000',
    marginBottom: 15,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginBottom: 5,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    top: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 14,
    color: '#666',
  },
  forgotText: {
    fontSize: 14,
    color: '#007AFF',
  },
  signInButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  signUpText: {
    fontSize: 14,
    color: '#666',
  },
  signUpLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 10,
    color: '#666',
    letterSpacing: 3,
  },
});
