import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { graphqlFetch } from './../../lib/helper';

const ME_QUERY = `
  query Me {
    me {
      id
      email
      name
      createdAt
      modifiedAt
    }
  }
`;

const USERS_QUERY = `
  query Users {
    users {
      id
      name
      email
      createdAt
    }
  }
`;


interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  modifiedAt?: string;
}

interface MeResponse {
  me: User;
}

interface UsersResponse {
  users: User[];
}


export default function HomeScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        router.replace('/');
        return;
      }

      await loadData();
    };

    checkAuth();
  }, []);


  const loadData = async () => {
    try {
      setLoading(true);
      const [meData, usersData] = await Promise.all([
        graphqlFetch<MeResponse>(ME_QUERY),
        graphqlFetch<UsersResponse>(USERS_QUERY),
      ]);

      setCurrentUser(meData.me);
      setAllUsers(usersData.users);
    } catch (error: any) {
      if (error.message !== 'UNAUTHORIZED') {
        Alert.alert('Erro', error.message);
      }
    } finally {
      setLoading(false);
    }
  };


  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    router.replace('/');
  };


  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#FFF" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>


        {currentUser && (
          <LinearGradient
            colors={['#007AFF', '#0051D5']}
            style={styles.idCard}
          >
            <Text style={styles.userName}>{currentUser.name}</Text>
            <Text style={styles.userEmail}>{currentUser.email}</Text>
          </LinearGradient>
        )}


        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Buscar usuários</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Digite um nome..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>


        <View style={styles.usersSection}>
          <Text style={styles.sectionTitle}>Usuários</Text>

          {filteredUsers.map(user => (
            <View key={user.id} style={styles.userCard}>
              <Text style={styles.userCardName}>{user.name}</Text>
              <Text style={styles.userCardEmail}>{user.email}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  scrollContent: { padding: 20 },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 10, fontSize: 16 },

  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: { color: '#FFF', fontWeight: '600' },

  idCard: {
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    height:150
  },

  userName: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  userEmail: { color: '#FFF', marginTop: 6 },

  searchSection: { marginTop: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },

  searchInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
  },

  usersSection: { marginTop: 30 },

  userCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  userCardName: { fontWeight: '600', fontSize: 16 },
  userCardEmail: { color: '#666' },
});
