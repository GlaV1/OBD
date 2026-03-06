import { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; // Ekranlar arası geçiş için

export default function WelcomeScreen() {
  const router = useRouter();
  const [vin, setVin] = useState('');
  const [brand, setBrand] = useState('');

  const handleConnect = () => {
    // Burada ileride "gerçekten cihaza bağlanma" mantığı olacak
    // Şimdilik direkt dashboard'a yönlendiriyoruz
    console.log("Bağlanılan Araç:", brand, "VIN:", vin);
    router.push('/dashboard'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Aracınıza Bağlanın</Text>
        <Text style={styles.subtitle}>Otomatik OBD bağlantısı başlatın veya manuel olarak araç bilgilerinizi girin.</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Araç Markası / Modeli</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Örn: Volkswagen Golf 1.4 TSI"
            placeholderTextColor="#666"
            value={brand}
            onChangeText={setBrand}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Şasi Numarası (VIN) - Opsiyonel</Text>
          <TextInput 
            style={styles.input} 
            placeholder="17 Haneli VIN Girin"
            placeholderTextColor="#666"
            autoCapitalize="characters"
            maxLength={17}
            value={vin}
            onChangeText={setVin}
          />
        </View>

        <TouchableOpacity style={styles.autoButton} onPress={() => console.log('Otomatik VIN okuma tetiklendi')}>
          <Text style={styles.autoButtonText}>🔍 Otomatik VIN Oku</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
          <Text style={styles.connectButtonText}>Araca Bağlan 🚀</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e2d',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#a1a1aa',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#2b2b40',
    color: '#ffffff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  autoButton: {
    backgroundColor: '#2b2b40',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4ade80', // Yeşil hat
  },
  autoButtonText: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: 'bold',
  },
  connectButton: {
    backgroundColor: '#00d2ff', // Neon Mavi
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#00d2ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  connectButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  }
});