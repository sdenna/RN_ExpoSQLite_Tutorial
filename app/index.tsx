import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { fetchItems, insertItem, type Item } from './db';

export default function App() {
  /**
   * Database Access
   * 
   * useSQLiteContext() hook gives us access to the database instance.
   * This works because _layout.tsx wraps the app in SQLiteProvider.
   * Without the provider, this hook would throw an error.
   */
  const db = useSQLiteContext();

  /**
   * Form State
   * 
   * These state variables control the input fields (controlled components).
   * They're stored as strings because TextInput always works with strings.
   */
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');

  /**
   * Database State
   * 
   * Stores the items retrieved from the database.
   * When this updates, React re-renders the FlatList to show the new data.
   */
  const [items, setItems] = useState<Item[]>([]);

  /**
   * Load Items on Mount
   * 
   * useEffect with empty dependency array [] runs once when component mounts.
   * This is the perfect place to load initial data from the database.
   * 
   * Note: VSCode may warn about missing 'loadItems' dependency.
   * We intentionally omit it because we only want this to run once on mount,
   * not every time loadItems function is redefined.
   */
  useEffect(() => {
    loadItems();
  }, []);

  /**
   * Load Items Function
   * 
   * Fetches all items from the database and updates the state.
   * 
   * Why async/await?
   * - Database operations take time (they're asynchronous)
   * - 'await' pauses execution until the database responds
   * - This prevents the app from freezing while waiting for data
   * 
   * Why try/catch?
   * - Database operations can fail (device storage full, corrupted data, etc.)
   * - try/catch prevents crashes by gracefully handling errors
   * - Always log errors to help with debugging
   */
  const loadItems = async () => {
    try {
      const value = await fetchItems(db);
      setItems(value);
    } catch (err) {
      console.log('Failed to fetch items');
      console.log(err);
    }
  };

  /**
   * Save Item Function
   * 
   * Validates user input and saves a new item to the database.
   * 
   * Validation Steps:
   * 1. Check name isn't empty (trim() removes whitespace)
   * 2. Parse quantity string to integer (base 10)
   * 3. Check that quantity is a valid number (not NaN)
   * 
   * After successful insert:
   * - Reload items to show the new entry
   * - Clear the form fields for the next entry
   */
  const saveItem = async () => {
    // Validate name is not empty or just whitespace
    if (!name.trim()) return;
    
    // Validate quantity is a valid number
    const parsedQuantity = parseInt(quantity, 10);
    if (Number.isNaN(parsedQuantity)) return;

    try {
      await insertItem(db, name, parsedQuantity);
      await loadItems(); // Refresh the list to show the new item
      
      // Clear form fields
      setName('');
      setQuantity('');
    } catch (err) {
      console.log('Failed to save item');
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SQLite Example</Text>
      <TextInput
        style={styles.input}
        placeholder="Item Name"
        value={name}
        onChangeText={setName}
      />

      {/* 
        Quantity Input
        
        keyboardType="numeric" shows a number keyboard on mobile devices.
        Note: This doesn't prevent non-numeric input, so we still validate in saveItem().
      */}
      <TextInput
        style={styles.input}
        placeholder="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />

      {/* 
        Save Button
        
        Triggers the saveItem function which validates and saves to database.
      */}
      <Button title="Save Item" onPress={saveItem} />
      <FlatList
        style={styles.list}
        data={items}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.name}</Text>
            <Text>{item.quantity}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  list: {
    marginTop: 20,
    width: '100%',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});