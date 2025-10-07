# Expo SQLite Tutorial Project

This is a simple React Native application demonstrating how to use SQLite database with Expo.

## What You'll Learn

- How to set up SQLite in an Expo React Native app
- Creating and initializing database tables
- Performing CRUD operations (Create, Read)
- Using React hooks with async database operations
- Type-safe database queries with TypeScript

## Project Structure

```
app/
├── _layout.tsx    # Root layout with SQLiteProvider setup
├── db.ts          # Database logic (schema, queries, types)
└── index.tsx      # Main screen with UI and database interactions
```

## Key Concepts

### 1. SQLiteProvider (`_layout.tsx`)

The `SQLiteProvider` wraps your entire app, making the database accessible to all screens:

```tsx
<SQLiteProvider databaseName="db.db" onInit={initDb}>
  {/* Your app screens */}
</SQLiteProvider>
```

- **databaseName**: The filename for your local SQLite database
- **onInit**: Callback that runs once to set up tables when the database opens

### 2. Database Functions (`db.ts`)

All database logic is separated into a dedicated file:

- **`initDb()`**: Creates the database table structure
- **`insertItem()`**: Adds new records using parameterized queries
- **`fetchItems()`**: Retrieves all records as a typed array

### 3. Async/Await Pattern

Database operations are asynchronous (they take time), so we use `async/await`:

```tsx
const loadItems = async () => {
  const items = await fetchItems(db);  // Wait for database
  setItems(items);                     // Then update UI
};
```

### 4. Parameterized Queries

Always use `?` placeholders to prevent SQL injection:

```tsx
// ✅ SAFE: Values are separated from SQL
db.runAsync('INSERT INTO items (name, quantity) VALUES (?, ?)', [name, qty]);

// ❌ UNSAFE: Never concatenate user input into SQL
db.runAsync(`INSERT INTO items VALUES ('${name}', ${qty})`);
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npx expo start --tunnel
   ```

3. **Run on your device/emulator:**
   - Scan QR code with Expo Go app
   - Press w for webview (not reccomended)

## How It Works

1. **App Initialization**: `_layout.tsx` wraps the app with `SQLiteProvider`
2. **Database Setup**: `onInit` callback runs `initDb()` to create the `items` table
3. **Component Mount**: `index.tsx` loads initial data with `useEffect`
4. **User Input**: User enters name and quantity in TextInputs
5. **Save Action**: Button click validates input and calls `insertItem()`
6. **UI Update**: After saving, app reloads data to show the new item

## Additional Resources

- [Expo SQLite Documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [SQLite SQL Tutorial](https://www.sqlite.org/lang.html)

## Common Issues

### "Cannot access database before it's initialized"
- Make sure `SQLiteProvider` wraps your app in `_layout.tsx`
- Ensure you're using `useSQLiteContext()` inside the provider

### Database changes not appearing
- Check that you're calling `loadItems()` after insert/update/delete
- Verify your SQL syntax is correct

### Type errors with database results
- Ensure your `Item` interface matches your table schema
- Use the generic type parameter: `db.getAllAsync<Item>(...)`

## Best Practices

1. **Separate database logic**: Keep SQL queries in `db.ts`, not in components
2. **Use TypeScript interfaces**: Define types for your database records
3. **Handle errors**: Always wrap database operations in try/catch blocks
4. **Validate input**: Check user input before saving to database
5. **Use parameterized queries**: Never concatenate user input into SQL strings